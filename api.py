from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend import chatbot, retrieve_all_threads, retrieve_thread_history
from langchain_core.messages import HumanMessage, AIMessage, AIMessageChunk
from fastapi.responses import StreamingResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    thread_id: str

@app.post("/chat")
def chat(request: ChatRequest):
    def event_stream():
        config = {"configurable": {"thread_id": request.thread_id}}
        try:
            for event in chatbot.stream({"messages": [HumanMessage(content=request.message)]}, config, stream_mode="messages"):
                chunk, metadata = event
                if isinstance(chunk, AIMessageChunk) and metadata.get("langgraph_node") == "chat_node":
                    if chunk.content:
                        yield str(chunk.content)
        except Exception as e:
            yield f"Error: {str(e)}"
            
    return StreamingResponse(event_stream(), media_type="text/plain")

@app.get("/threads")
def get_threads():
    try:
        threads = retrieve_all_threads()
        return {"threads": threads}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chat/{thread_id}")
def get_chat_history(thread_id: str):
    try:
        messages = retrieve_thread_history(thread_id)
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
