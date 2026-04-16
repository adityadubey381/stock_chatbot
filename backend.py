# backedn.py

from langgraph.graph import StateGraph, START, END
from typing import Annotated, TypedDict
from langchain_core.messages import HumanMessage, BaseMessage, SystemMessage, AIMessage
from langchain_openai import ChatOpenAI
from langgraph.graph.message import add_messages
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.prebuilt import tools_condition, ToolNode
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.tools import tool
from dotenv import load_dotenv
import sqlite3
import requests
import re

def generate_short_title(text: str) -> str:
    """Strip common question phrases from the start of a message to create a clean thread title."""
    t = text.lower().strip()
    
    # Specific transformations
    t = re.sub(r"^(what is|what's)\s+(the\s+)?current price of\s+(.+)$", r"\3 Stock Price", t)
    t = re.sub(r"^(what is|what's)\s+(the\s+)?price of\s+(.+)$", r"\3 Price", t)
    
    # General removals
    prefixes = [
        r"what is\s+(the\s+)?",
        r"who is\s+(the\s+)?",
        r"can you provide me\s+(the\s+)?",
        r"tell me\s+(about\s+)?",
        r"how to\s+",
        r"please\s+",
    ]
    for p in prefixes:
        t = re.sub("^" + p, "", t)
        
    t = t.replace("?", "").strip()
    if not t:
        return text[:20] + "..."
        
    t = t.title()
    if len(t) > 30:
        t = t[:27] + "..."
        
    return t

load_dotenv()

#----------------------------------
# 1. LLM
#----------------------------------

#llm = ChatOpenAI()

from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    openai_api_key="API_Key",
    openai_api_base="https://integrate.api.nvidia.com/v1",
    model_name="meta/llama3-70b-instruct"
)
#----------------------------------
# 2. Tools
#----------------------------------

search_tool = DuckDuckGoSearchRun()

@tool
def calculator(first_num: float, second_num: float, operation: str) -> dict:
    """
    Perform a basic arithmetic operation on two number
    Supported operations: add, sub, mul, div
    """
    try:
        if operation == 'add':
            result = first_num + second_num
        elif operation == 'sub':
            result = first_num - second_num
        elif operation == 'mul':
            result = first_num * second_num
        elif operation == 'div':
            if second_num == 0:
                return {'error':'Division by zero is not allowed'}
            result = first_num / second_num
        else:
            return {"error": f"Unsupported operation '{operation}'"}
        
        return{"first_num": first_num, "second_num": second_num, "result": result}

    except Exception as e:
        return {"error": str(e)}
    

@tool
def get_stock_price(symbol: str) -> dict:
    """
    Fetch latest stock Price for a given symbol (e.g. 'APPL', 'TSLA')
    using Alpha Vantage API key in the URL.
    """
    url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&interval=5min&apikey=XNGD1XY426LWZC9G'
    r = requests.get(url)
    return r.json()



tools = [search_tool, calculator, get_stock_price]
llm_with_tools = llm.bind_tools(tools)



# -------------------
# 3. State
# -------------------
class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]

# -------------------
# 4. Nodes
# -------------------
def chat_node(state: ChatState):
    """LLM node that may answer or request a tool call."""
    messages = state["messages"]
    
    # System prompt defining the role and behavior
    sys_msg = SystemMessage(content=(
        "You are an expert FinCal AI Assistant. "
        "CRITICAL INSTRUCTION: You MUST ONLY answer questions related to finance, the stock market, and investments. "
        "If the user asks a question about ANY other topic (such as programming, Python, general knowledge, etc.), you MUST politely refuse to answer and state that you are a financial AI assistant and only answer finance-related queries. "
        "You provide hardcore, direct, and factual financial information and analysis. "
        "If you do not have the knowledge or information to answer a valid financial question, strictly reply with 'I don't know'."
    ))
    
    response = llm_with_tools.invoke([sys_msg] + messages)
    return {"messages": [response]}

tool_node = ToolNode(tools)

#----------------------------------
# 5. Check pointer
#----------------------------------
conn = sqlite3.connect(database='chatbot.db', check_same_thread=False)
checkpointer = SqliteSaver(conn=conn)


#----------------------------------
# 6. Graph
#----------------------------------
graph = StateGraph(ChatState)
graph.add_node("chat_node", chat_node)
graph.add_node("tools", tool_node)

graph.add_edge(START, "chat_node")
graph.add_conditional_edges("chat_node", tools_condition)
graph.add_edge('tools', 'chat_node')

chatbot = graph.compile(checkpointer=checkpointer)

#----------------------------------
# 7. Helper
#----------------------------------

def retrieve_all_threads():
    thread_info = []
    seen = set()
    
    # 1. Gather all unique thread IDs first to avoid SQLite cursor deadlock
    thread_ids = []
    for checkpoint in checkpointer.list(None):
        t_id = checkpoint.config["configurable"]["thread_id"]
        if t_id not in seen:
            seen.add(t_id)
            thread_ids.append(t_id)
            
    # 2. Now fetch the state for each safely
    for t_id in thread_ids:
        title = t_id
        state = chatbot.get_state({"configurable": {"thread_id": t_id}})
        if state and hasattr(state, "values") and "messages" in state.values:
            for msg in state.values["messages"]:
                if isinstance(msg, HumanMessage):
                    title = generate_short_title(msg.content)
                    break
        thread_info.append({"id": t_id, "title": title})
        
    return thread_info

def retrieve_thread_history(thread_id: str):
    config = {"configurable": {"thread_id": thread_id}}
    state = chatbot.get_state(config)
    history = []
    if state and hasattr(state, "values") and "messages" in state.values:
        for msg in state.values["messages"]:
            if isinstance(msg, HumanMessage):
                history.append({"role": "user", "content": msg.content})
            elif isinstance(msg, AIMessage):
                if msg.content:
                    history.append({"role": "ai", "content": str(msg.content)})
    return history