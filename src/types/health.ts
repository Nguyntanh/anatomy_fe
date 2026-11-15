export type BodyRegionId =
  | 'head'
  | 'chest'
  | 'abdomen'
  | 'spine'
  | 'shoulder'
  | 'knee';

export type TriageStatus = 'normal' | 'monitoring' | 'acute';

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
