import {
  useState,
  useRef,
  useEffect,
  Fragment,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Bot,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import type { BodyRegionId, ChatMessage } from '@/types/health';

interface ChatPanelProps {
  sessionTitle: string;
  activeRegionName: string;
  activeRegionId: BodyRegionId;
  messages: ChatMessage[];
  isStreaming: boolean;
  onSendMessage: (text: string) => void;
  onClearSession: () => void;
  onAskRegion: (regionId: BodyRegionId) => void;
}

function renderFormattedText(text: string) {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const renderedParts = parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <Fragment key={idx}>{part}</Fragment>;
    });
    return (
      <span key={lineIdx} className="block min-h-[1.1em]">
        {renderedParts}
      </span>
    );
  });
}

export default function ChatPanel({
  sessionTitle,
  activeRegionName,
  activeRegionId,
  messages,
  isStreaming,
  onSendMessage,
  onClearSession,
  onAskRegion,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSendMessage(trimmed);
    setInput('');
    setSpeechNotice(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleTextToSpeech = () => {
    if (speakingMessageId) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMessageId(null);
      return;
    }
    const assistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');
    if (assistantMsg && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeakingMessageId(assistantMsg.id);
      const utterance = new SpeechSynthesisUtterance(assistantMsg.content);
      utterance.lang = 'vi-VN';
      utterance.onend = () => setSpeakingMessageId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const askRegion = () => {
    onAskRegion(activeRegionId);
  };

  return (
    <div className="flex flex-col h-full w-full min-h-0 bg-white border-l border-slate-200">
      <div className="h-14 shrink-0 bg-slate-50 border-b border-slate-200 px-4 flex items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 truncate">{sessionTitle}</h3>
            <p className="text-xs text-slate-500">
              Vùng: <span className="font-medium text-slate-700 capitalize">{activeRegionName}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClearSession}
            className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Xóa
          </button>
          <button
            type="button"
            onClick={askRegion}
            disabled={isStreaming}
            className="px-3 py-1.5 text-xs text-sky-600 hover:bg-sky-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Hỏi về vùng này
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 panel-scroll">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center text-slate-400">
            <Bot className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[85%] p-3 rounded-xl ${
              msg.role === 'user'
                ? 'ml-auto bg-sky-50 text-slate-900 rounded-tr-none border border-sky-100'
                : msg.isError
                  ? 'mr-auto bg-red-50 text-red-900 rounded-tl-none border border-red-200'
                  : 'mr-auto bg-slate-50 text-slate-900 rounded-tl-none border border-slate-100'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`text-[10px] font-medium ${msg.isError ? 'text-red-700' : 'text-sky-600'}`}>
                  {msg.isError ? 'Không gửi được' : 'AI Trợ lý'}
                </span>
                {msg.isStreaming && (
                  <span className="text-[10px] text-slate-400 animate-pulse">● Đang trả lời...</span>
                )}
              </div>
            )}
            <div className="text-sm leading-relaxed">
              {renderFormattedText(msg.content)}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {msg.timestamp}
            </span>
          </div>
        ))}
        {isStreaming && (
          <div className="ml-auto max-w-[85%] p-3 rounded-xl bg-sky-50 text-slate-900 rounded-tr-none border border-sky-100 animate-pulse">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] text-sky-600 font-medium">AI Trợ lý</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={scrollEndRef} />
      </div>

      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        {speechNotice && (
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5 mb-2">
            {speechNotice}
          </p>
        )}
        <div className="rounded-xl border border-slate-200 bg-white focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500/50 transition-colors p-2">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Đang lắng nghe giọng nói (Tiếng Việt)...' : 'Mô tả triệu chứng hoặc đặt câu hỏi cho AI...'}
            className="w-full resize-none bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none leading-relaxed"
          />
          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/70">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsListening((prev) => {
                    if (prev) {
                      setSpeechNotice('Đã dừng ghi âm');
                      return false;
                    }
                    setSpeechNotice('Đang lắng nghe...');
                    return true;
                  });
                }}
                title={isListening ? 'Dừng ghi âm' : 'Nhập bằng giọng nói (STT)'}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isListening
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">
                  {isListening ? 'Đang nghe' : 'Mic'}
                </span>
              </button>
              <button
                type="button"
                onClick={toggleTextToSpeech}
                disabled={messages.every((m) => m.role !== 'assistant')}
                title="Nghe phản hồi AI mới nhất (TTS)"
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 ${
                  speakingMessageId
                    ? 'bg-sky-100 text-sky-800 border border-sky-200'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {speakingMessageId ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">
                  {speakingMessageId ? 'Dừng đọc' : 'Loa'}
                </span>
              </button>
            </div>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!input.trim() || isStreaming}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-medium hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors whitespace-nowrap"
            >
              <span>{isStreaming ? 'Đang trả lời...' : 'Gửi'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
