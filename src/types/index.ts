export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: 'patient' | 'doctor' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Symptom {
  id: string;
  userId: string;
  name: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  location: string;
  reportedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'voice';
  timestamp: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface DashboardStats {
  heartRate: number;
  bloodPressure: string;
  temperature: number;
  lastUpdated: string;
}