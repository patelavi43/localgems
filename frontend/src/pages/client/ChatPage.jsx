import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ChatPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    chatAPI.getConversations()
      .then(({ data }) => setConversations(data.data))
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (conversationId) {
      chatAPI.getMessages(conversationId)
        .then(({ data }) => setActiveConvo(data.data))
        .catch(() => toast.error('Failed to load messages'));
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvo?.messages]);

  const selectConversation = (id) => {
    navigate(`/chat/${id}`);
    chatAPI.getMessages(id).then(({ data }) => setActiveConvo(data.data));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !conversationId) return;
    setSending(true);
    try {
      const { data } = await chatAPI.sendMessage(conversationId, message.trim());
      setActiveConvo(prev => ({ ...prev, messages: [...prev.messages, data.data] }));
      setMessage('');
      setConversations(prev => prev.map(c => c._id === conversationId ? { ...c, lastMessage: message.trim(), lastMessageAt: new Date() } : c));
    } catch { toast.error('Failed to send message'); }
    finally { setSending(false); }
  };

  const getOtherParticipant = (convo) => convo.participants?.find(p => p._id !== user?._id);

  return (
    <div className="page-container max-w-5xl">
      <h1 className="section-title mb-6">Messages</h1>
      <div className="card overflow-hidden" style={{ height: '70vh' }}>
        <div className="flex h-full">
          {/* Conversations list */}
          <div className="w-72 flex-shrink-0 border-r border-gem-800/40 flex flex-col">
            <div className="p-4 border-b border-gem-800/40">
              <p className="text-gem-300 text-sm font-medium">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-14 bg-gem-800/30 rounded-lg animate-pulse" />)}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gem-500 text-sm">No conversations yet</p>
                  <p className="text-gem-600 text-xs mt-1">Start by messaging a talent</p>
                </div>
              ) : conversations.map(convo => {
                const other = getOtherParticipant(convo);
                const isActive = convo._id === conversationId;
                return (
                  <button key={convo._id} onClick={() => selectConversation(convo._id)}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-gem-800/30 transition-colors text-left ${isActive ? 'bg-gem-800/50 border-l-2 border-gem-500' : ''}`}
                  >
                    <img src={other?.profile_pic || `https://api.dicebear.com/7.x/personas/svg?seed=${other?.name}`} alt={other?.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{other?.name}</p>
                      {convo.lastMessage && <p className="text-gem-500 text-xs truncate">{convo.lastMessage}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 flex flex-col min-w-0">
            {activeConvo ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-gem-800/40">
                  {(() => {
                    const other = getOtherParticipant(activeConvo);
                    return (
                      <>
                        <img src={other?.profile_pic || `https://api.dicebear.com/7.x/personas/svg?seed=${other?.name}`} alt={other?.name} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <p className="text-white font-medium text-sm">{other?.name}</p>
                          <p className="text-gem-500 text-xs">{other?.role}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {activeConvo.messages?.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-gem-500 text-sm">Start the conversation!</p>
                    </div>
                  )}
                  {activeConvo.messages?.map((msg, i) => {
                    const isOwn = msg.senderId === user?._id || msg.senderId?._id === user?._id;
                    return (
                      <div key={i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                          isOwn ? 'bg-gem-600 text-white rounded-br-md' : 'bg-gem-900/80 text-gem-100 border border-gem-800/40 rounded-bl-md'
                        }`}>
                          <p className="leading-relaxed">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-gem-200' : 'text-gem-500'}`}>
                            {msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-gem-800/40 flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="input-field text-sm flex-1"
                    disabled={sending}
                  />
                  <button type="submit" disabled={sending || !message.trim()} className="btn-primary px-4 disabled:opacity-50">
                    {sending ? '...' : '→'}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-3">💬</div>
                  <p className="text-gem-400 font-display">Select a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
