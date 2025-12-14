
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2 } from 'lucide-react';
import { chatWithAssistant } from '@/services/api';

interface Message {
  role: 'user' | 'model';
  message: string;
}

export const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      message: 'Namaste! I am your AI Civic Assistant. How can I help you regarding civic issues today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', message: userMessage }]);
    setIsLoading(true);

    try {
      // Prepare history for API (excluding the current user message which is sent as 'message')
      // and mapping 'model' to 'model' (Gemini uses 'model', our state uses 'model')
      // Filter out the initial greeting or any messsage that might cause issues (Gemini history often needs to start with User)
      const history = messages
        .filter(m => !(m.role === 'model' && m.message.startsWith('Namaste! I am your AI Civic Assistant'))) 
        .map(m => ({
          role: m.role,
          message: m.message
        }));

      const response = await chatWithAssistant(userMessage, history);
      
      if (response.success && response.reply) {
        setMessages(prev => [...prev, { role: 'model', message: response.reply }]);
      } else {
         setMessages(prev => [...prev, { role: 'model', message: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', message: 'Sorry, something went wrong. Check your connection.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4 font-sans">
      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <div className="w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Civic Assistant</h3>
                <p className="text-xs text-blue-100 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
               <button 
                onClick={() => setIsMinimized(true)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`
                    max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}
                  `}
                >
                  <div className="flex items-center gap-2 mb-1 opacity-70 text-xs font-medium">
                    {msg.role === 'user' ? (
                        <>
                            <span>You</span>
                            <User className="w-3 h-3" />
                        </>
                    ) : (
                        <>
                            <Bot className="w-3 h-3" />
                            <span>Assistant</span>
                        </>
                    )}
                  </div>
                  {/* Render simplified markdown-like line breaks */}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.message.split('\n').map((line, i) => {
                      // Basic parsing for bold text (**text**)
                      const parts = line.split(/(\*\*.*?\*\*)/g);
                      
                      return (
                        <div key={i} className="min-h-[20px]">
                          {line.trim().startsWith('* ') ? (
                            <div className="flex items-start ml-2 gap-2 my-1">
                               <span className="mt-1.5 w-1.5 h-1.5 bg-current rounded-full flex-shrink-0 opacity-60"></span>
                               <span>
                                {line.replace(/^\* /, '').split(/(\*\*.*?\*\*)/g).map((part, ptIdx) => 
                                  part.startsWith('**') && part.endsWith('**') ? 
                                  <strong key={ptIdx}>{part.slice(2, -2)}</strong> : 
                                  part
                                )}
                               </span>
                            </div>
                          ) : (
                            parts.map((part, pIdx) => 
                              part.startsWith('**') && part.endsWith('**') ? 
                              <strong key={pIdx}>{part.slice(2, -2)}</strong> : 
                              part
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    <span className="text-xs text-slate-500 font-medium">Thinking...</span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about potholes, tickets, etc..."
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-sm text-slate-700"
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 text-center">
                <p className="text-[10px] text-slate-400">AI can make mistakes. Please verify important info.</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
        }}
        className={`
            group relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300
            ${isOpen && !isMinimized ? 'hidden' : 'flex'}
        `}
      >
        <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20 transition-opacity"></div>
        <MessageCircle className="w-7 h-7" />
        {/* Pulse effect */}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
      </button>
    </div>
  );
};
