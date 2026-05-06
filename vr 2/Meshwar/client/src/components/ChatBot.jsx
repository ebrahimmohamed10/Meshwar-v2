import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

/* ─── Inline styles (no extra deps needed) ─── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  .cb-root * { box-sizing: border-box; font-family: 'Inter', 'Outfit', sans-serif; }

  /* FAB pulse ring */
  @keyframes cb-ring {
    0%   { transform: scale(1);   opacity: .6; }
    100% { transform: scale(1.9); opacity: 0;  }
  }
  /* Window entrance */
  @keyframes cb-enter {
    from { opacity: 0; transform: translateY(24px) scale(.96); }
    to   { opacity: 1; transform: translateY(0)     scale(1);   }
  }
  /* Message pop */
  @keyframes cb-msg {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  /* Typing dot */
  @keyframes cb-dot {
    0%,80%,100% { transform: translateY(0);   opacity: .4; }
    40%          { transform: translateY(-5px); opacity: 1;  }
  }
  /* Gradient shift for header */
  @keyframes cb-grad {
    0%   { background-position: 0%   50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0%   50%; }
  }
  /* Shimmer on FAB hover */
  @keyframes cb-shimmer {
    0%   { left: -60%; }
    100% { left: 130%; }
  }

  .cb-fab {
    position: fixed; bottom: 28px; right: 28px;
    width: 60px; height: 60px; border-radius: 50%;
    background: linear-gradient(135deg, #0ea5e9, #10b981, #6366f1);
    background-size: 200% 200%;
    animation: cb-grad 4s ease infinite;
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 32px rgba(16,185,129,.45);
    transition: transform .2s, box-shadow .2s;
    z-index: 9999; overflow: hidden;
  }
  .cb-fab:hover { transform: scale(1.1); box-shadow: 0 12px 40px rgba(16,185,129,.6); }
  .cb-fab::after {
    content:''; position:absolute; top:-50%; left:-60%;
    width:40%; height:200%; background:rgba(255,255,255,.2);
    transform: skewX(-20deg);
  }
  .cb-fab:hover::after { animation: cb-shimmer .55s ease; }

  .cb-ring {
    position: absolute; inset: -4px; border-radius: 50%;
    border: 2px solid rgba(16,185,129,.7);
    animation: cb-ring 1.8s ease-out infinite;
  }

  .cb-badge {
    position: absolute; top: -3px; right: -3px;
    width: 14px; height: 14px; border-radius: 50%;
    background: #ef4444; border: 2px solid #fff;
    animation: cb-ring 1.8s ease-out infinite;
  }

  .cb-window {
    position: fixed; bottom: 104px; right: 28px;
    width: 400px; max-width: calc(100vw - 40px);
    height: 620px; max-height: calc(100vh - 120px);
    border-radius: 24px;
    background: rgba(10,12,20,.92);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255,255,255,.08);
    box-shadow: 0 32px 80px rgba(0,0,0,.6), 0 0 0 .5px rgba(255,255,255,.05) inset;
    display: flex; flex-direction: column; overflow: hidden;
    animation: cb-enter .35s cubic-bezier(.22,1,.36,1);
    z-index: 9998;
  }

  /* Header */
  .cb-header {
    padding: 18px 20px;
    background: linear-gradient(135deg,rgba(14,165,233,.18),rgba(99,102,241,.18),rgba(16,185,129,.18));
    border-bottom: 1px solid rgba(255,255,255,.07);
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }
  .cb-avatar {
    width: 42px; height: 42px; border-radius: 50%;
    background: linear-gradient(135deg,#0ea5e9,#10b981);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
    box-shadow: 0 0 0 3px rgba(16,185,129,.25);
  }
  .cb-title { font-size: 15px; font-weight: 700; color: #f0fdf4; letter-spacing: -.2px; }
  .cb-status {
    display: flex; align-items: center; gap: 6px;
    font-size: 11px; color: rgba(255,255,255,.55); margin-top: 2px;
  }
  .cb-dot-online {
    width: 7px; height: 7px; border-radius: 50%; background: #10b981;
    box-shadow: 0 0 6px #10b981;
  }
  .cb-reset {
    background: rgba(255,255,255,.07); border: none; cursor: pointer;
    padding: 8px; border-radius: 10px; color: rgba(255,255,255,.6);
    transition: background .2s, color .2s; display: flex; align-items: center; justify-content: center;
  }
  .cb-reset:hover { background: rgba(255,255,255,.14); color: #fff; }

  /* History View */
  .cb-history-view {
    flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 8px;
  }
  .cb-history-view::-webkit-scrollbar { width: 4px; }
  .cb-history-view::-webkit-scrollbar-track { background: transparent; }
  .cb-history-view::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 4px; }
  
  .cb-history-item {
    background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
    border-radius: 12px; padding: 12px 16px; cursor: pointer;
    display: flex; justify-content: space-between; align-items: center;
    transition: all .2s; color: rgba(255,255,255,.8);
  }
  .cb-history-item:hover { background: rgba(16,185,129,.1); border-color: rgba(16,185,129,.3); }
  .cb-history-item.active { border-color: #10b981; background: rgba(16,185,129,.15); }
  .cb-history-title { font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 240px; color: #fff; }
  .cb-history-meta { font-size: 11px; color: rgba(255,255,255,.4); margin-top: 4px; }
  .cb-history-delete {
    background: transparent; border: none; color: rgba(239,68,68,.7); cursor: pointer;
    padding: 6px; border-radius: 6px; transition: all .2s; display: flex; align-items: center;
  }
  .cb-history-delete:hover { background: rgba(239,68,68,.15); color: #ef4444; }


  /* Messages */
  .cb-messages {
    flex: 1; overflow-y: auto; padding: 20px 16px 8px;
    display: flex; flex-direction: column; gap: 12px;
    scroll-behavior: smooth;
  }
  .cb-messages::-webkit-scrollbar { width: 4px; }
  .cb-messages::-webkit-scrollbar-track { background: transparent; }
  .cb-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 4px; }

  /* Welcome screen */
  .cb-welcome {
    display: flex; flex-direction: column; align-items: center;
    padding: 24px 0 12px; gap: 8px;
  }
  .cb-welcome-icon {
    width: 64px; height: 64px; border-radius: 50%;
    background: linear-gradient(135deg,#0ea5e9,#10b981);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px;
    box-shadow: 0 0 32px rgba(16,185,129,.35);
  }
  .cb-welcome h4 { font-size: 17px; font-weight: 700; color: #f0fdf4; margin: 0; }
  .cb-welcome p  { font-size: 13px; color: rgba(255,255,255,.5); margin: 0; text-align: center; }

  /* Quick action chips */
  .cb-chips { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px; }
  .cb-chip {
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 14px; padding: 12px 10px;
    cursor: pointer; text-align: left; transition: all .2s;
    color: rgba(255,255,255,.8);
  }
  .cb-chip:hover {
    background: rgba(16,185,129,.12);
    border-color: rgba(16,185,129,.4);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16,185,129,.15);
  }
  .cb-chip span:first-child { font-size: 22px; display: block; margin-bottom: 4px; }
  .cb-chip span:last-child  { font-size: 12px; font-weight: 600; }

  /* Bubbles */
  .cb-row { display: flex; animation: cb-msg .25s ease; }
  .cb-row.user  { justify-content: flex-end; }
  .cb-row.bot   { justify-content: flex-start; align-items: flex-end; gap: 8px; }
  .cb-bot-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg,#0ea5e9,#10b981);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; flex-shrink: 0;
  }
  .cb-bubble {
    max-width: 78%; padding: 12px 16px; border-radius: 20px;
    font-size: 13.5px; line-height: 1.55; white-space: pre-wrap; word-break: break-word;
  }
  .cb-bubble.user {
    background: linear-gradient(135deg,#0ea5e9,#6366f1);
    color: #fff; border-bottom-right-radius: 6px;
    box-shadow: 0 4px 16px rgba(14,165,233,.3);
  }
  .cb-bubble.bot {
    background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.1);
    color: rgba(255,255,255,.9); border-bottom-left-radius: 6px;
  }
  .cb-bubble.error {
    background: rgba(239,68,68,.12);
    border: 1px solid rgba(239,68,68,.25);
    color: #fca5a5;
  }
  .cb-ts { font-size: 10px; margin-top: 5px; opacity: .45; }

  /* Markdown Styles */
  .cb-markdown { display: flex; flex-direction: column; gap: 8px; }
  .cb-markdown p { margin: 0; line-height: 1.55; }
  .cb-markdown strong { font-weight: 700; color: #fff; }
  .cb-markdown em { font-style: italic; }
  .cb-markdown ul { margin: 0; padding-left: 20px; list-style-type: disc; }
  .cb-markdown ol { margin: 0; padding-left: 20px; list-style-type: decimal; }
  .cb-markdown li { margin-bottom: 4px; }
  .cb-markdown li:last-child { margin-bottom: 0; }
  .cb-markdown h1, .cb-markdown h2, .cb-markdown h3, .cb-markdown h4 { margin: 0; font-size: 1em; font-weight: 700; color: #fff; }
  .cb-markdown a { color: #38bdf8; text-decoration: none; }
  .cb-markdown a:hover { text-decoration: underline; }

  /* Typing indicator */
  .cb-typing {
    display: flex; align-items: flex-end; gap: 8px; animation: cb-msg .25s ease;
  }
  .cb-typing-bubble {
    background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 20px; border-bottom-left-radius: 6px;
    padding: 14px 18px; display: flex; gap: 5px; align-items: center;
  }
  .cb-typing-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #10b981;
  }
  .cb-typing-dot:nth-child(1) { animation: cb-dot 1.2s ease infinite .0s; }
  .cb-typing-dot:nth-child(2) { animation: cb-dot 1.2s ease infinite .18s; }
  .cb-typing-dot:nth-child(3) { animation: cb-dot 1.2s ease infinite .36s; }

  /* Input area */
  .cb-footer {
    padding: 14px 16px 18px;
    background: rgba(255,255,255,.03);
    border-top: 1px solid rgba(255,255,255,.07);
    flex-shrink: 0;
  }
  .cb-input-row {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 16px; padding: 6px 6px 6px 16px;
    transition: border-color .2s, box-shadow .2s;
  }
  .cb-input-row:focus-within {
    border-color: rgba(16,185,129,.5);
    box-shadow: 0 0 0 3px rgba(16,185,129,.1);
  }
  .cb-input {
    flex: 1; background: transparent; border: none; outline: none;
    font-size: 13.5px; color: rgba(255,255,255,.9); padding: 6px 0;
  }
  .cb-input::placeholder { color: rgba(255,255,255,.3); }
  .cb-send {
    width: 38px; height: 38px; border-radius: 12px; border: none;
    background: linear-gradient(135deg,#0ea5e9,#10b981);
    color: #fff; cursor: pointer; display: flex; align-items: center;
    justify-content: center; flex-shrink: 0;
    transition: transform .15s, box-shadow .15s;
    box-shadow: 0 4px 12px rgba(16,185,129,.35);
  }
  .cb-send:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 6px 18px rgba(16,185,129,.5); }
  .cb-send:disabled { opacity: .45; cursor: not-allowed; transform: none; }
  .cb-hint { font-size: 10.5px; color: rgba(255,255,255,.25); text-align: center; margin-top: 8px; }
`;

/* ─── Component ─── */
const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  // Sessions state for multiple chats
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('carRentalChatSessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
      return [{ id: Date.now().toString(), title: 'New Chat', messages: [], date: new Date().toLocaleDateString() }];
    } catch {
      return [{ id: Date.now().toString(), title: 'New Chat', messages: [], date: new Date().toLocaleDateString() }];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return sessions.length > 0 ? sessions[0].id : Date.now().toString();
  });

  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quickActions, setQuickActions] = useState([]);
  const [showTyping, setShowTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const conversation = activeSession?.messages || [];

  useEffect(() => { loadQuickActions(); }, []);

  useEffect(() => {
    if (!showHistory) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation, showTyping, showHistory]);

  // Save sessions to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('carRentalChatSessions', JSON.stringify(sessions));
  }, [sessions]);

  const loadQuickActions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/chatbot/quick-actions`);
      if (res.data.success) setQuickActions(res.data.quickActions);
    } catch { }
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    setSessions(prev => [{ id: newId, title: 'New Chat', messages: [], date: new Date().toLocaleDateString() }, ...prev]);
    setActiveSessionId(newId);
    setShowHistory(false);
  };

  const deleteChat = (e, id) => {
    e.stopPropagation();
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) {
        const newId = Date.now().toString();
        setActiveSessionId(newId);
        return [{ id: newId, title: 'New Chat', messages: [], date: new Date().toLocaleDateString() }];
      }
      if (activeSessionId === id) setActiveSessionId(filtered[0].id);
      return filtered;
    });
  };

  const updateSessionMessages = (newMessages, titleUpdate = null) => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, messages: newMessages, title: titleUpdate || s.title };
      }
      return s;
    }));
  };



  const handleSendMessage = async (text = null) => {
    const msg = text || message;
    if (!msg.trim()) return;

    const userMsg = { id: Date.now(), type: 'user', text: msg, timestamp: new Date().toLocaleTimeString() };
    const isFirstMessage = conversation.length === 0;
    const titleUpdate = isFirstMessage ? (msg.length > 25 ? msg.substring(0, 25) + '...' : msg) : null;

    const newMessages = [...conversation, userMsg];
    updateSessionMessages(newMessages, titleUpdate);
    setMessage('');
    setIsLoading(true);
    setShowTyping(true);

    try {
      const history = newMessages.slice(-10).map(m => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.text
      }));
      const res = await axios.post(`${API_URL}/api/chatbot/chat`, { message: msg, conversationHistory: history });
      setShowTyping(false);
      if (res.data.success) {
        updateSessionMessages([...newMessages, {
          id: Date.now() + 1, type: 'bot',
          text: res.data.message, timestamp: new Date().toLocaleTimeString()
        }]);
      }
    } catch {
      setShowTyping(false);
      updateSessionMessages([...newMessages, {
        id: Date.now() + 1, type: 'bot', isError: true,
        text: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally { setIsLoading(false); }
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  return (
    <div className="cb-root">
      <style>{css}</style>

      {/* FAB */}
      <button className="cb-fab" onClick={() => setIsOpen(o => !o)} aria-label="Toggle chat">
        {!isOpen && <span className="cb-ring" />}
        {!isOpen && <span className="cb-badge" />}
        {isOpen
          ? <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="5" x2="17" y2="17" /><line x1="17" y1="5" x2="5" y2="17" /></svg>
          : <svg width="24" height="24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
        }
      </button>

      {/* Window */}
      {isOpen && (
        <div className="cb-window">
          {/* Header */}
          <div className="cb-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="cb-avatar">🚗</div>
              <div>
                <div className="cb-title">CarRental Assistant</div>
                <div className="cb-status">
                  <span className="cb-dot-online" />
                  Online · Ready to help
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="cb-reset" onClick={() => setShowHistory(!showHistory)} title={showHistory ? "Back to Chat" : "Chat History"}>
                {showHistory ? (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                )}
              </button>
              {!showHistory && (
                <button className="cb-reset" onClick={createNewChat} title="Start a New Chat">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {showHistory ? (
            /* History View */
            <div className="cb-history-view">
              {sessions.map(s => (
                <div key={s.id} className={`cb-history-item ${activeSessionId === s.id ? 'active' : ''}`} onClick={() => { setActiveSessionId(s.id); setShowHistory(false); }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                    <div className="cb-history-title">{s.title}</div>
                    <div className="cb-history-meta">{s.messages.length} {s.messages.length === 1 ? 'message' : 'messages'} • {s.date}</div>
                  </div>
                  <button className="cb-history-delete" onClick={(e) => deleteChat(e, s.id)} title="Delete Chat">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Messages View */
            <>
              <div className="cb-messages">
                {conversation.length === 0 ? (
                  <>
                    <div className="cb-welcome">
                      <div className="cb-welcome-icon">🚗</div>
                      <h4>Hey there! 👋</h4>
                      <p>I'm your AI car rental assistant.<br />How can I help you today?</p>
                    </div>
                    {quickActions.length > 0 && (
                      <div className="cb-chips">
                        {quickActions.map(a => (
                          <button key={a.id} className="cb-chip" onClick={() => handleSendMessage(a.query)} disabled={isLoading}>
                            <span>{a.icon}</span>
                            <span>{a.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  conversation.map(msg => (
                    <div key={msg.id} className={`cb-row ${msg.type}`}>
                      {msg.type === 'bot' && <div className="cb-bot-avatar">🤖</div>}
                      <div className={`cb-bubble ${msg.type}${msg.isError ? ' error' : ''}`}>
                        {msg.type === 'bot' && !msg.isError ? (
                          <div className="cb-markdown">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                        ) : (
                          msg.text
                        )}
                        <div className="cb-ts">{msg.timestamp}</div>
                      </div>
                    </div>
                  ))
                )}

                {showTyping && (
                  <div className="cb-typing">
                    <div className="cb-bot-avatar">🤖</div>
                    <div className="cb-typing-bubble">
                      <span className="cb-typing-dot" />
                      <span className="cb-typing-dot" />
                      <span className="cb-typing-dot" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="cb-footer">
                <div className="cb-input-row">
                  <input
                    className="cb-input"
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Ask me anything about cars..."
                    disabled={isLoading}
                  />
                  <button className="cb-send" onClick={() => handleSendMessage()} disabled={isLoading || !message.trim()}>
                    {isLoading
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" style={{ animation: 'cb-grad 1s linear infinite' }} /></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    }
                  </button>
                </div>
                <div className="cb-hint">⏎ Enter to send · Powered by Groq AI</div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBot;
