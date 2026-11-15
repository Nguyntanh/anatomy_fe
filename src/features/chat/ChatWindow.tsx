import React, { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[500px] border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Trợ lý AI RAG</h3>
        <p className="text-xs text-gray-500 mt-1">Chat đa phương thức (Text/Voice)</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] p-3 rounded-lg ${
              msg.role === 'user'
                ? 'ml-auto bg-purple-100 text-gray-900 rounded-tr-none'
                : 'mr-auto bg-gray-100 text-gray-900 rounded-tl-none'
            }`}
          >
            <p className="text-sm">{msg.content}</p>
            <span className="text-xs text-gray-500 block mt-1">{msg.timestamp}</span>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};