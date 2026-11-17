import { useState, type FormEvent } from 'react';
import {
  Brain,
  Wind,
  Activity,
  Bone,
  HeartPulse,
  Search,
  ChevronDown,
  Clock,
  Plus,
} from 'lucide-react';
import type {
  BodyCategory,
  BodyRegionId,
  ConsultationSession,
  SymptomItem,
  TriageStatus,
} from '@/types/health';
import { Link } from 'react-router-dom';

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  brain: Brain,
  lungs: Wind,
  stomach: Activity,
  bone: Bone,
  heart: HeartPulse,
};

const STATUS_BADGE_TEXT: Record<TriageStatus, { label: string; cls: string }> = {
  normal: { label: 'Bình thường', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  monitoring: { label: 'Theo dõi', cls: 'text-amber-700 bg-amber-50 border-amber-200' },
  acute: { label: 'Cấp tính', cls: 'text-red-700 bg-red-50 border-red-200' },
};

interface LeftSidebarProps {
  categories: BodyCategory[];
  activeRegionId: BodyRegionId;
  regionStatuses: Record<BodyRegionId, TriageStatus>;
  isBusy: boolean;
  sessions: ConsultationSession[];
  activeSessionId: string;
  onSelectRegion: (regionId: BodyRegionId) => void;
  onSelectSymptom: (symptom: SymptomItem) => void;
  onQuickSubmitSymptom: (text: string) => void;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
}

export default function LeftSidebar({
  categories,
  activeRegionId,
  regionStatuses,
  isBusy,
  sessions,
  activeSessionId,
  onSelectRegion,
  onSelectSymptom,
  onQuickSubmitSymptom,
  onSelectSession,
  onNewSession,
}: LeftSidebarProps) {
  const [quickInput, setQuickInput] = useState('');
  const [expandedCatId, setExpandedCatId] = useState<string>('cat-head');

  const normalizedSearch = quickInput.trim().toLowerCase();

  const filteredCategories = categories
    .map((cat) => {
      if (!normalizedSearch) return cat;
      const catMatches = cat.name.toLowerCase().includes(normalizedSearch);
      const matchingSymptoms = cat.symptoms.filter((s) =>
        s.label.toLowerCase().includes(normalizedSearch)
      );
      if (catMatches) return cat;
      if (matchingSymptoms.length > 0) {
        return { ...cat, symptoms: matchingSymptoms };
      }
      return null;
    })
    .filter((c): c is BodyCategory => c !== null);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = quickInput.trim();
    if (!trimmed || isBusy) return;
    onQuickSubmitSymptom(trimmed);
    setQuickInput('');
  };

  const CategoryIcon = CATEGORY_ICON_MAP;

  return (
    <aside className="w-full lg:w-[22%] xl:w-[20%] lg:min-w-[260px] lg:max-w-[310px] bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col min-h-0 max-h-[38vh] lg:max-h-none overflow-hidden">
      <div className="p-3.5 border-b border-slate-200 shrink-0">
        <label
          htmlFor="quick-symptom-input"
          className="block text-xs font-semibold text-slate-700 mb-2"
        >
          Nhập nhanh triệu chứng
        </label>
        <form onSubmit={handleFormSubmit} className="relative flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search
              className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              id="quick-symptom-input"
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Ví dụ: đau đầu, đau bụng..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-sky-500 outline-none bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            disabled={isBusy}
            className="px-2 py-1.5 text-xs text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
          >
            Gửi
          </button>
        </form>
      </div>
      <div className="flex-1 overflow-y-auto panel-scroll p-2.5 space-y-2">
        <div className="space-y-2">
          {filteredCategories.map((cat) => {
            const Icon = CategoryIcon[cat.iconName] || Activity;
            const isExpanded = expandedCatId === cat.id;
            const isActive = cat.regionId === activeRegionId;
            const regionStatus = STATUS_BADGE_TEXT[regionStatuses[cat.regionId]];

            return (
              <div
                key={cat.id}
                className={`rounded-lg border transition-colors ${
                  isActive
                    ? 'bg-sky-50 border-sky-200'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectRegion(cat.regionId);
                    setExpandedCatId(cat.id);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-600">
                      <Icon className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded border px-1.5 py-0.5 text-[9px] font-medium ${regionStatus.cls}`}>
                      {regionStatus.label}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-2.5 pb-2.5 pt-1 space-y-1 border-t border-slate-100">
                    {cat.symptoms.map((sym) => {
                      const symStatus = STATUS_BADGE_TEXT[sym.defaultStatus];
                      return (
                        <button
                          key={sym.id}
                          type="button"
                          disabled={isBusy}
                          onClick={() => onSelectSymptom(sym)}
                          className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-800 transition-colors flex items-center justify-between gap-2"
                        >
                          <span className="truncate">{sym.label}</span>
                          <span
                            className={`text-[10px] shrink-0 font-medium ${
                              sym.defaultStatus === 'acute'
                                ? 'text-red-600'
                                : sym.defaultStatus === 'monitoring'
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                            }`}
                          >
                            {symStatus.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Consultation Sessions */}
      <div className="p-3.5 border-t border-slate-200 shrink-0 bg-slate-50/50">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Phiên tư vấn gần nhất
          </h2>
          <button
            type="button"
            onClick={onNewSession}
            disabled={isBusy}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 hover:text-sky-800 px-2 py-1 rounded hover:bg-sky-50 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3 h-3" />
            Phiên mới
          </button>
        </div>

        <div className="space-y-1.5">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <Link
                key={session.id}
                to={`/chat?session=${session.id}`}
                onClick={() => onSelectSession(session.id)}
                className={`block w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                  isActive
                    ? 'bg-sky-50 border-sky-200 text-slate-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <p className="text-xs font-medium truncate">{session.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 tabular-nums flex items-center gap-1.5">
                  <span>{session.updatedAt}</span>
                  <span aria-hidden="true">·</span>
                  <span>{session.messages.length} tin nhắn</span>
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
