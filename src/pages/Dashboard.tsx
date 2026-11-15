import { useState } from 'react';
import { Activity, ShieldCheck, HeartPulse, Brain, Bone, Clock, Bot } from 'lucide-react';
import Header from '@/components/layout/Header';
import LeftSidebar from '@/components/layout/LeftSidebar';
import Footer from '@/components/layout/Footer';
import BodyCanvas3D from '@/components/3d/BodyCanvas3D';
import ChatPanel from '@/components/chat/ChatPanel';
import type {
  BodyCategory,
  BodyRegionId,
  ConsultationSession,
  SymptomItem,
  TriageStatus,
} from '@/types/health';
import {
  BODY_CATEGORIES,
  INITIAL_REGION_STATES,
  INITIAL_SESSIONS,
  SYSTEM_STATUS,
} from '@/data/bodyData';

const REGION_LABELS: Record<BodyRegionId, string> = {
  head: 'Đầu',
  chest: 'Ngực',
  abdomen: 'Bụng',
  spine: 'Cột sống',
  shoulder: 'Vai',
  knee: 'Gối',
};

export default function Dashboard() {
  const [activeRegionId, setActiveRegionId] = useState<BodyRegionId>('head');
  const [activeSessionId, setActiveSessionId] = useState<string>('session-1');
  const [regionStatuses, setRegionStatuses] = useState<Record<BodyRegionId, TriageStatus>>({
    head: 'normal',
    chest: 'normal',
    abdomen: 'normal',
    spine: 'normal',
    shoulder: 'normal',
    knee: 'normal',
  });
  const [user] = useState({ fullName: 'Nguyễn Thị Mai', email: 'mai.nguyen@email.com' });
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: string }[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const activeRegionName = REGION_LABELS[activeRegionId];

  const handleSelectRegion = (regionId: BodyRegionId) => {
    setActiveRegionId(regionId);
  };

  const handleSelectSymptom = (symptom: SymptomItem) => {
    setActiveRegionId(symptom.regionId);
    const newStatuses = { ...regionStatuses, [symptom.regionId]: symptom.defaultStatus };
    setRegionStatuses(newStatuses);
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: symptom.label, timestamp: new Date().toLocaleTimeString('vi-VN') },
    ]);
    setIsStreaming(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: `Đã ghi nhận triệu chứng "${symptom.label}" cho vùng ${REGION_LABELS[symptom.regionId]}. AI đang phân tích...`, timestamp: new Date().toLocaleTimeString('vi-VN') },
      ]);
      setIsStreaming(false);
    }, 1500);
  };

  const handleQuickSubmit = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date().toLocaleTimeString('vi-VN') },
    ]);
    setIsStreaming(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: `Tôi đã nhận được thông tin: "${text}". Bạn có thể chọn vùng cơ thể cụ thể trên mô hình 3D để tôi tư vấn chi tiết hơn không?`, timestamp: new Date().toLocaleTimeString('vi-VN') },
      ]);
      setIsStreaming(false);
    }, 1500);
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const handleNewSession = () => {
    setActiveSessionId(`session-${Date.now()}`);
    setMessages([]);
  };

  const handleAskRegion = (regionId: BodyRegionId) => {
    setActiveRegionId(regionId);
    const msg = `Tôi muốn tư vấn về vùng ${REGION_LABELS[regionId]}.`;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date().toLocaleTimeString('vi-VN') },
    ]);
    setIsStreaming(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: `Đã chuyển focus tới vùng ${REGION_LABELS[regionId]} trên mô hình 3D. Bạn có muốn mô tả triệu chứng cụ thể không?`, timestamp: new Date().toLocaleTimeString('vi-VN') },
      ]);
      setIsStreaming(false);
    }, 1500);
  };

  const session = INITIAL_SESSIONS.find((s) => s.id === activeSessionId) || INITIAL_SESSIONS[0];

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] text-slate-900">
      <Header
        userName={user.fullName}
        userEmail={user.email}
        systemStatus={SYSTEM_STATUS as any}
        onLogout={() => {}}
      />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar
          categories={BODY_CATEGORIES as BodyCategory[]}
          activeRegionId={activeRegionId}
          regionStatuses={regionStatuses}
          sessions={INITIAL_SESSIONS as ConsultationSession[]}
          activeSessionId={activeSessionId}
          onSelectRegion={handleSelectRegion}
          onSelectSymptom={handleSelectSymptom}
          onQuickSubmitSymptom={handleQuickSubmit}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
        />
        <div className="flex flex-col flex-1 min-h-0 relative">
          <main className="flex-1 overflow-hidden flex">
            <div className="flex-1 h-full overflow-y-auto p-4 lg:p-6">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Vùng đang chọn</p>
                        <h3 className="text-2xl font-bold text-slate-900">{activeRegionName}</h3>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
                        <Activity className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái</p>
                        <h3 className="text-2xl font-bold text-slate-900">
                          {regionStatuses[activeRegionId] === 'normal' ? 'Bình thường' : regionStatuses[activeRegionId] === 'monitoring' ? 'Theo dõi' : 'Cấp tính'}
                        </h3>
                      </div>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                        {regionStatuses[activeRegionId] === 'normal' ? (
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                        ) : regionStatuses[activeRegionId] === 'monitoring' ? (
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <HeartPulse className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                            <Brain className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Lần cập nhật</p>
                        <h3 className="text-2xl font-bold text-slate-900">{session.updatedAt}</h3>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                        <Clock className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <Bone className="w-3.5 h-3.5" />
                          </div>
                          <h3 className="text-sm font-semibold text-slate-900">Mô hình cơ thể 3D</h3>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Interactive</span>
                      </div>
                      <div className="flex-1 relative min-h-0">
                        <BodyCanvas3D
                          activeRegionId={activeRegionId}
                          regionStatuses={regionStatuses}
                          onSelectRegion={setActiveRegionId}
                          onAskRegionInChat={handleAskRegion}
                        />
                      </div>
                      <div className="p-4 border-t border-slate-100 bg-slate-50">
                        <p className="text-xs text-slate-500">
                          Kéo chuột để xoay • Cuộn để zoom • Nhấn nút vùng để chọn
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                          <h3 className="text-sm font-semibold text-slate-900">Trợ lý AI Y tế</h3>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">RAG</span>
                      </div>
                      <div className="flex-1 min-h-0">
                        <ChatPanel
                          sessionTitle={session.title}
                          activeRegionName={activeRegionName}
                          activeRegionId={activeRegionId}
                          messages={messages.map((m) => ({
                            id: m.id,
                            role: m.role,
                            content: m.content,
                            timestamp: m.timestamp,
                          }))}
                          isStreaming={isStreaming}
                          onSendMessage={() => {}}
                          onClearSession={handleNewSession}
                          onAskRegion={handleAskRegion}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
