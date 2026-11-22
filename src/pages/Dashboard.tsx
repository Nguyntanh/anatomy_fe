import { useEffect, useRef, useState } from 'react';
import { Activity, ShieldCheck, HeartPulse, Brain, Bone, Clock, Bot } from 'lucide-react';
import Header from '@/components/layout/Header';
import LeftSidebar from '@/components/layout/LeftSidebar';
import Footer from '@/components/layout/Footer';
import BodyCanvas3D from '@/components/3d/BodyCanvas3D';
import ChatPanel from '@/components/chat/ChatPanel';
import type {
  BodyRegionId,
  ConsultationSession,
  ChatMessage,
  SymptomItem,
  TriageStatus,
  SystemStatus,
  BodyStatusMapResponse,
} from '@/types/health';
import { BACKEND_ZONE_TO_REGION, BODY_STATUS_TO_TRIAGE } from '@/types/health';
import {
  BODY_CATEGORIES,
  INITIAL_SESSIONS,
} from '@/data/bodyData';
import {
  askChat,
  fetchBodyZones,
  fetchBodyStatusMap,
  fetchSystemStatus,
  getApiErrorMessage,
  getAuthenticatedUserId,
  submitSymptom,
  type AuthenticatedUser,
  type BodyZone,
} from '@/services/api';

const REGION_LABELS: Record<BodyRegionId, string> = {
  head: 'Đầu',
  chest: 'Ngực',
  abdomen: 'Bụng',
  spine: 'Cột sống',
  shoulder: 'Vai',
  knee: 'Gối',
};

const REGION_ZONE_CODES: Record<BodyRegionId, string> = {
  head: 'head_02',
  chest: 'chest_01',
  abdomen: 'abdomen_01',
  spine: 'spine_01',
  shoulder: 'shoulder_01',
  knee: 'knee_01',
};

const STATUS_BY_COLOR: Record<'GREEN' | 'YELLOW' | 'RED', TriageStatus> = {
  GREEN: 'normal',
  YELLOW: 'monitoring',
  RED: 'acute',
};

interface DashboardProps {
  user: AuthenticatedUser;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [bodyZones, setBodyZones] = useState<BodyZone[]>([]);
  const [zonesLoaded, setZonesLoaded] = useState(false);
  const [bodyStatusMap, setBodyStatusMap] = useState<BodyStatusMapResponse | null>(null);
  const requestInFlight = useRef(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    apiConnected: false,
    guardrailsActive: false,
    modelName: 'Chưa kết nối',
  });

  const activeRegionName = REGION_LABELS[activeRegionId];

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchBodyZones(), fetchSystemStatus(), fetchBodyStatusMap()])
      .then(([zones, status, bodyStatus]) => {
        if (!isMounted) return;
        setBodyZones(zones);
        setZonesLoaded(true);
        setSystemStatus(status);
        setBodyStatusMap(bodyStatus);

        // Cập nhật regionStatuses từ body_status_map của backend
        const newStatuses: Record<BodyRegionId, TriageStatus> = {
          head: 'normal',
          chest: 'normal',
          abdomen: 'normal',
          spine: 'normal',
          shoulder: 'normal',
          knee: 'normal',
        };
        bodyStatus.body_status_map.forEach((item) => {
          const regionId = BACKEND_ZONE_TO_REGION[item.body_part_id];
          if (regionId) {
            newStatuses[regionId] = BODY_STATUS_TO_TRIAGE[item.status_color];
          }
        });
        setRegionStatuses(newStatuses);
      })
      .catch(() => {
        if (isMounted) {
          setZonesLoaded(true);
          setSystemStatus({
            apiConnected: false,
            guardrailsActive: false,
            modelName: 'Chưa kết nối',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const sendSymptomToBackend = async (
    text: string,
    regionId: BodyRegionId
  ) => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    setActiveRegionId(regionId);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: text, timestamp },
    ]);
    setIsStreaming(true);

    try {
      if (!zonesLoaded || !systemStatus.apiConnected) {
        throw new Error('Backend chưa sẵn sàng. Vui lòng kiểm tra kết nối rồi thử lại.');
      }

      if (text.trim().length < 10) {
        throw new Error('Vui lòng mô tả triệu chứng ít nhất 10 ký tự.');
      }

      const bodyPartId = REGION_ZONE_CODES[regionId];
      if (!bodyZones.some((zone) => zone.zone_code === bodyPartId)) {
        throw new Error(
          `Backend chưa cấu hình vùng ${REGION_LABELS[regionId]} (${bodyPartId}).`
        );
      }

      const result = await submitSymptom({
        user_id: getAuthenticatedUserId(),
        body_part_id: bodyPartId,
        symptom_text: text.trim(),
        severity_level: 'YELLOW',
        client_timestamp: Date.now(),
      });
      const responseTimestamp = new Date().toLocaleTimeString('vi-VN');
      const responseText = [
        result.ai_advice,
        result.warning_message,
        result.disclaimer,
      ]
        .filter((part): part is string => Boolean(part))
        .join('\n\n');

      setRegionStatuses((previous) => ({
        ...previous,
        [regionId]: STATUS_BY_COLOR[result.status_color],
      }));

      // Refetch body status map để cập nhật màu vùng mới từ backend
      try {
        const updated = await fetchBodyStatusMap();
        setBodyStatusMap(updated);
        const newStatuses: Record<BodyRegionId, TriageStatus> = { ...regionStatuses };
        updated.body_status_map.forEach((item) => {
          const rid = BACKEND_ZONE_TO_REGION[item.body_part_id];
          if (rid) {
            newStatuses[rid] = BODY_STATUS_TO_TRIAGE[item.status_color];
          }
        });
        setRegionStatuses(newStatuses);
      } catch {
        // Bỏ qua lỗi refetch, trạng thái local đã được cập nhật
      }
      setMessages((prev) => [
        ...prev,
        {
          id: result.symptom_id,
          role: 'assistant',
          content: responseText,
          timestamp: responseTimestamp,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: getApiErrorMessage(error),
          timestamp: new Date().toLocaleTimeString('vi-VN'),
          isError: true,
        },
      ]);
    } finally {
      requestInFlight.current = false;
      setIsStreaming(false);
    }
  };

  const handleSelectRegion = (regionId: BodyRegionId) => {
    setActiveRegionId(regionId);
  };

  const handleSelectSymptom = (symptom: SymptomItem) => {
    sendSymptomToBackend(
      `Tôi đang có triệu chứng: ${symptom.label}.`,
      symptom.regionId
    );
  };

  const handleQuickSubmit = (text: string) => {
    sendSymptomToBackend(text, activeRegionId);
  };

  const handleChatQuestion = async (
    text: string,
    regionId: BodyRegionId = activeRegionId
  ) => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: new Date().toLocaleTimeString('vi-VN'),
      },
    ]);
    setIsStreaming(true);

    try {
      if (!zonesLoaded || !systemStatus.apiConnected) {
        throw new Error('Backend chưa sẵn sàng. Vui lòng kiểm tra kết nối rồi thử lại.');
      }

      const result = await askChat(text, REGION_ZONE_CODES[regionId]);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: [result.answer, result.disclaimer].filter(Boolean).join('\n\n'),
          timestamp: new Date().toLocaleTimeString('vi-VN'),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: getApiErrorMessage(error),
          timestamp: new Date().toLocaleTimeString('vi-VN'),
          isError: true,
        },
      ]);
    } finally {
      requestInFlight.current = false;
      setIsStreaming(false);
    }
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
    handleChatQuestion(
      `Tôi muốn tìm hiểu về vùng ${REGION_LABELS[regionId]}.`,
      regionId
    );
  };

  const session = INITIAL_SESSIONS.find((s) => s.id === activeSessionId) || INITIAL_SESSIONS[0];

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] text-slate-900">
      <Header
        userName={user.full_name}
        userEmail={user.email}
        systemStatus={systemStatus}
        onLogout={onLogout}
      />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar
          categories={BODY_CATEGORIES}
          activeRegionId={activeRegionId}
          regionStatuses={regionStatuses}
          isBusy={isStreaming}
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
                          bodyStatusMap={bodyStatusMap}
                          isBusy={isStreaming}
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
                          messages={messages}
                          isStreaming={isStreaming}
                          onSendMessage={handleChatQuestion}
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
