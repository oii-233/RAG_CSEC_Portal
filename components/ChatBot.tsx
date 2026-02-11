
import React, { useState, useRef, useEffect } from 'react';
import { getChatResponse } from '../services/geminiService';
import { Icons, COLORS } from '../constants';
import { ChatMessage, ReportType, ReportStatus } from '../types';

interface ChatBotProps {
  onReportGenerated?: (reportData: any) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ onReportGenerated, isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Authorized Access. How can I assist you with ASTU campus safety or policy information today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const parseReportTag = (text: string) => {
    const match = text.match(/\[REPORT_FINALIZED: (.*?)\]/);
    if (match && onReportGenerated) {
      const parts = match[1].split('|');
      onReportGenerated({
        type: parts[0]?.includes('Maintenance') ? ReportType.MAINTENANCE : ReportType.SECURITY,
        category: parts[1] || 'General',
        location: parts[2] || 'Unknown',
        description: parts[3] || 'N/A',
        priority: parts[4] || 'Medium'
      });
      return text.replace(/\[REPORT_FINALIZED: .*?\]/, "\n\n**STATUS: Your case has been securely registered with the ASTU Administration.**");
    }
    return text;
  };

  const handleSend = async (forcedMsg?: string) => {
    const messageText = forcedMsg || input;
    if (!messageText.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: messageText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    if (!forcedMsg) setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseTextRaw = await getChatResponse(messageText, history);
    const responseText = parseReportTag(responseTextRaw || "");
    
    setIsTyping(false);
    setMessages(prev => [...prev, {
      role: 'model',
      text: responseText,
      timestamp: new Date()
    }]);
  };

  // Expose external trigger
  useEffect(() => {
    if (isOpen && messages.length === 1 && forcedReportTrigger) {
      handleSend("I would like to report an incident.");
      setForcedReportTrigger(false);
    }
  }, [isOpen]);

  const [forcedReportTrigger, setForcedReportTrigger] = useState(false);
  
  // Custom hook-like behavior for "I Report It" button
  (window as any).triggerAIReporting = () => {
    setIsOpen(true);
    setForcedReportTrigger(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-80 md:w-[400px] h-[550px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#0F2A3D] p-5 text-white flex justify-between items-center border-b border-[#17A2B8]">
            <div className="flex items-center gap-3">
              <div className="text-[#17A2B8]"><Icons.Shield /></div>
              <div>
                <span className="font-bold text-sm block">Safety Assistant</span>
                <span className="text-[10px] text-green-400 font-mono flex items-center gap-1 uppercase">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div> Encrypted Connection
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F4F8FA]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-4 rounded-xl shadow-sm border ${
                  msg.role === 'user' 
                    ? 'bg-[#17A2B8] text-white rounded-tr-none border-[#17A2B8]' 
                    : 'bg-white text-gray-800 border-gray-200 rounded-tl-none'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <span className="text-[9px] opacity-60 mt-2 block font-mono">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-4 rounded-xl rounded-tl-none shadow-sm flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[#17A2B8] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#17A2B8] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#17A2B8] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Describe issue or ask about policies..."
                className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#17A2B8] transition-all bg-gray-50"
              />
              <button 
                onClick={() => handleSend()}
                className="bg-[#17A2B8] text-white p-3 rounded-xl hover:opacity-90 shadow-md transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-[9px] text-gray-400 font-black uppercase tracking-widest">
              <Icons.Lock /> Secure ASTU Communication
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#17A2B8] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-3 border-4 border-white"
      >
        <Icons.Message />
        <span className="font-bold hidden md:inline tracking-tight">Safety Assistant</span>
      </button>
    </div>
  );
};

export default ChatBot;
