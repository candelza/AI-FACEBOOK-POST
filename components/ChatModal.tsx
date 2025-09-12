import React, { useState, useEffect, useRef } from 'react';
import { Chat } from "@google/genai";
import { createChatSession } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { SendIcon } from './icons/SendIcon';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  isApiConnected: boolean;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, isApiConnected }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen && isApiConnected && !chat) {
      try {
        const chatSession = createChatSession();
        setChat(chatSession);
        setMessages([{ role: 'model', text: 'สวัสดีครับ มีอะไรให้ Candelaz AI ช่วยไหมครับ?' }]);
      } catch (e) {
        console.error("Failed to initialize chat session", e);
        setMessages([{ role: 'model', text: 'ขออภัย, ไม่สามารถเริ่มต้นการแชทได้ในขณะนี้' }]);
      }
    } else if (!isOpen) {
      // Reset chat when modal is closed to start a new session next time
      setChat(null);
      setMessages([]);
      setInput('');
      setIsLoading(false);
    }
  }, [isOpen, isApiConnected, chat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chat) return;

    const userMessage: Message = { role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await chat.sendMessageStream({ message: userMessage.text });
      
      // Add a placeholder for the model's response
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text += chunkText;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = 'ขออภัย, เกิดข้อผิดพลาดในการสื่อสารกับ AI';
      setMessages(prev => {
        // If the last message is an empty model placeholder, replace it.
        // Otherwise, just add the error message. This prevents deleting the user's message.
        if (prev.length > 0 && prev[prev.length - 1].role === 'model' && prev[prev.length - 1].text === '') {
            return [...prev.slice(0, -1), { role: 'model', text: errorMessage }];
        }
        return [...prev, { role: 'model', text: errorMessage }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <SparklesIcon /> <span className="ml-2">Candelaz AI Assistant</span>
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            aria-label="Close chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">AI</div>}
              <div 
                className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                }`}
              >
                {(isLoading && index === messages.length - 1 && msg.text === '') ? <span className="inline-block w-2 h-4 bg-gray-600 dark:bg-gray-300 animate-pulse" /> : msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="พิมพ์คำถามของคุณที่นี่..."
              rows={1}
              className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              disabled={isLoading || !isApiConnected}
            />
            <button 
              type="submit" 
              className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shrink-0 hover:bg-indigo-700 disabled:bg-gray-400 transition"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};