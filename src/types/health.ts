export type BodyRegionId =
  | 'head'
  | 'chest'
  | 'abdomen'
  | 'spine'
  | 'shoulder'
  | 'knee';

export type TriageStatus = 'normal' | 'monitoring' | 'acute';

export type BodyStatusColor = 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';

export interface BodyStatusItem {
  body_part_id: string;
  status_color: BodyStatusColor;
  risk_score: number;
  last_updated: string;
  short_tooltip?: string | null;
}

export interface BodyStatusMapResponse {
  body_status_map: BodyStatusItem[];
}

// Mapping từ status_color (backend) sang TriageStatus (frontend Three.js)
export const BODY_STATUS_TO_TRIAGE: Record<BodyStatusColor, TriageStatus> = {
  GREEN: 'normal',
  YELLOW: 'monitoring',
  RED: 'acute',
  UNKNOWN: 'normal',
};

// Màu chuẩn theo tài liệu EPIC 2 US 2
export const BODY_STATUS_COLORS: Record<BodyStatusColor, string> = {
  GREEN: '#22C55E',
  YELLOW: '#EAB308',
  RED: '#EF4444',
  UNKNOWN: '#94A3B8',
};

// Mapping body_part_id (backend) -> BodyRegionId (frontend)
export const BACKEND_ZONE_TO_REGION: Record<string, BodyRegionId> = {
  head_02: 'head',
  chest_01: 'chest',
  abdomen_01: 'abdomen',
  spine_01: 'spine',
  shoulder_01: 'shoulder',
  knee_01: 'knee',
};

export interface SymptomItem {
  id: string;
  label: string;
  regionId: BodyRegionId;
  defaultStatus: TriageStatus;
}

export interface BodyCategory {
  id: string;
  name: string;
  iconName: 'brain' | 'lungs' | 'stomach' | 'bone' | 'heart';
  regionId: BodyRegionId;
  symptoms: SymptomItem[];
}

export interface BodyRegionState {
  id: BodyRegionId;
  name: string;
  anatomicalLabel: string;
  status: TriageStatus;
  painScore: number;
  summary: string;
  markerPosition: [number, number, number];
  cameraTarget: [number, number, number];
  cameraOffset: [number, number, number];
}

export interface MedicalSource {
  id: string;
  organization: 'WHO' | 'Bộ Y tế' | 'Vinmec' | 'MedlinePlus';
  title: string;
  snippet: string;
  url: string;
  publishedYear: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  regionId?: BodyRegionId;
  sources?: MedicalSource[];
  isStreaming?: boolean;
  isError?: boolean;
}

export interface ConsultationSession {
  id: string;
  title: string;
  updatedAt: string;
  primaryRegionId: BodyRegionId;
  regionStatuses: Record<BodyRegionId, TriageStatus>;
  messages: ChatMessage[];
}

export interface SystemStatus {
  apiConnected: boolean;
  guardrailsActive: boolean;
  modelName: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: 'patient' | 'doctor' | 'admin';
  createdAt: string;
  updatedAt: string;
}
