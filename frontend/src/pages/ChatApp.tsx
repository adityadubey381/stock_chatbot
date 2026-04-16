import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import UserProfileHeader from '../components/UserProfileHeader';

type Message = {
  role: 'user' | 'ai';
  content: string;
};

type ThreadInfo = {
  id: string;
  title: string;
};

import { useAuth } from '../context/AuthContext';

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threads, setThreads] = useState<ThreadInfo[]>([]);
  const [currentThread, setCurrentThread] = useState<string>('default-thread');
  const { user } = useAuth();

  if (!user) {
    return <div style={{ color: 'white', padding: '2rem' }}>Please log in...</div>;
  }


  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  // Fetch threads on load
  useEffect(() => {
    fetch('http://127.0.0.1:8000/threads')
      .then(res => res.json())
      .then(data => {
        if (data.threads && data.threads.length > 0) {
          const formatted = data.threads.map((t: any) => typeof t === 'string' ? { id: t, title: t } : t);
          setThreads(formatted);
        }
      })
      .catch(err => console.error("Could not fetch threads", err));
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, thread_id: currentThread })
      });

      if (!response.ok) {
        setMessages(prev => [...prev, { role: 'ai', content: `Error: Something went wrong` }]);
        return;
      }

      setMessages(prev => [...prev, { role: 'ai', content: '' }]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunkText = decoder.decode(value, { stream: true });
            setMessages(prev => {
              const newMessages = [...prev];
              // only append to the last message if it's the AI we just created
              if (newMessages[newMessages.length - 1].role === 'ai') {
                newMessages[newMessages.length - 1] = { 
                  ...newMessages[newMessages.length - 1], 
                  content: newMessages[newMessages.length - 1].content + chunkText 
                };
              }
              return newMessages;
            });
          }
        }
      }

      if (!threads.some(t => t.id === currentThread)) {
        // Fast UI estimation of title
        let title = userMessage.toLowerCase().trim();
        title = title.replace(/^(what is|what's)\s+(the\s+)?current price of\s+(.+)$/, '$3 stock price');
        title = title.replace(/^(what is|what's)\s+(the\s+)?price of\s+(.+)$/, '$3 price');
        const prefixes = [
          /^what is\s+(the\s+)?/,
          /^who is\s+(the\s+)?/,
          /^can you provide me\s+(the\s+)?/,
          /^tell me\s+(about\s+)?/,
          /^how to\s+/,
          /^please\s+/,
        ];
        prefixes.forEach(p => { title = title.replace(p, ''); });
        title = title.replace(/\?$/, '').trim();
        if (!title) title = userMessage.substring(0, 20) + "...";
        title = title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        if (title.length > 30) title = title.substring(0, 27) + "...";

        setThreads(prev => [...prev, {
          id: currentThread,
          title: title
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Network error: Unable to connect to the backend." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewChat = () => {
    const newThreadId = `thread-${Date.now()}`;
    setCurrentThread(newThreadId);
    setMessages([]);
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <button onClick={startNewChat} className="new-chat-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Chat
        </button>

        <h2>Recent Chats</h2>
        <div className="threads-list">
          {threads.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No recent chats.</div>
          ) : (
            threads.map(thread => (
              <div
                key={thread.id}
                className={`thread-item ${currentThread === thread.id ? 'active' : ''}`}
                onClick={() => {
                  setCurrentThread(thread.id);
                  setIsLoading(true);
                  fetch(`http://127.0.0.1:8000/chat/${thread.id}`)
                    .then(res => res.json())
                    .then(data => {
                      if (data.messages && data.messages.length > 0) {
                        setMessages(data.messages);
                      } else {
                        setMessages([]);
                      }
                    })
                    .catch(err => {
                      console.error("Failed to fetch history", err);
                      setMessages([]);
                    })
                    .finally(() => setIsLoading(false));
                }}
              >
                {thread.title}
              </div>
            ))
          )}
        </div>
        <UserProfileHeader />
      </div>

      {/* Main Chat Area */}
      <div className="main-chat-area">
        <div className="chat-header">
          <div className="chat-title">NeuRa Ai</div>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <h1>How can I help you today?</h1>
              <p>I can help you with financial calculations, stock prices, and general inquiries using advanced tools.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`message-wrapper ${msg.role}`}>
                <div className={`message ${msg.role}`}>
                  {msg.role === 'ai' && (
                    <div className="ai-avatar">AI</div>
                  )}
                  <div className="message-content">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))
          )}

          {isLoading && messages[messages.length - 1]?.role !== 'ai' && (
            <div className="message-wrapper ai">
              <div className="message ai">
                <div className="ai-avatar">AI</div>
                <div className="message-content loading-indicator">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container-wrapper">
          <div className="input-container">
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder="Ask FinCal Assistant..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className="send-button"
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
