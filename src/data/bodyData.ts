import type { BodyCategory, BodyRegionId, SymptomItem, TriageStatus } from '@/types/health';

export const BODY_REGIONS: Record<BodyRegionId, { name: string; anatomicalLabel: string }> = {
  head: { name: 'Đầu', anatomicalLabel: 'Craneal / Facial region' },
  chest: { name: 'Ngực', anatomicalLabel: 'Thoracic region' },
  abdomen: { name: 'Bụng', anatomicalLabel: 'Abdominal region' },
  spine: { name: 'Cột sống', anatomicalLabel: 'Vertebral column' },
  shoulder: { name: 'Vai', anatomicalLabel: 'Shoulder girdle' },
  knee: { name: 'Gối', anatomicalLabel: 'Knee joint' },
};

export const BODY_CATEGORIES: BodyCategory[] = [
  {
    id: 'cat-head',
    name: 'Đầu & Cổ',
    iconName: 'brain',
    regionId: 'head',
    symptoms: [
      { id: 'sym-head-1', label: 'Đau đầu', regionId: 'head', defaultStatus: 'monitoring' },
      { id: 'sym-head-2', label: 'Chóng mặt', regionId: 'head', defaultStatus: 'normal' },
      { id: 'sym-head-3', label: 'Matted eyes / Khô mắt', regionId: 'head', defaultStatus: 'normal' },
    ],
  },
  {
    id: 'cat-chest',
    name: 'Ngực & Phổi',
    iconName: 'lungs',
    regionId: 'chest',
    symptoms: [
      { id: 'sym-chest-1', label: 'Thở hěn', regionId: 'chest', defaultStatus: 'monitoring' },
      { id: 'sym-chest-2', label: 'Đau ngực', regionId: 'chest', defaultStatus: 'acute' },
      { id: 'sym-chest-3', label: 'Ho', regionId: 'chest', defaultStatus: 'normal' },
    ],
  },
  {
    id: 'cat-abdomen',
    name: 'Bụng & Tiêu hóa',
    iconName: 'stomach',
    regionId: 'abdomen',
    symptoms: [
      { id: 'sym-abdomen-1', label: 'Đau bụng', regionId: 'abdomen', defaultStatus: 'monitoring' },
      { id: 'sym-abdomen-2', label: 'Buồn nôn', regionId: 'abdomen', defaultStatus: 'normal' },
      { id: 'sym-abdomen-3', label: 'Tiêu chảy', regionId: 'abdomen', defaultStatus: 'normal' },
    ],
  },
  {
    id: 'cat-spine',
    name: 'Cột sống & Xương khớp',
    iconName: 'bone',
    regionId: 'spine',
    symptoms: [
      { id: 'sym-spine-1', label: 'Đau lưng', regionId: 'spine', defaultStatus: 'monitoring' },
      { id: 'sym-spine-2', label: 'Đau cöt sống cổ', regionId: 'spine', defaultStatus: 'normal' },
      { id: 'sym-spine-3', label: 'Hẹpothèque cột sống', regionId: 'spine', defaultStatus: 'acute' },
    ],
  },
  {
    id: 'cat-shoulder',
    name: 'Vai & Tay',
    iconName: 'heart',
    regionId: 'shoulder',
    symptoms: [
      { id: 'sym-shoulder-1', label: 'Đau vai', regionId: 'shoulder', defaultStatus: 'normal' },
      { id: 'sym-shoulder-2', label: 'Teo tay', regionId: 'shoulder', defaultStatus: 'monitoring' },
      { id: 'sym-shoulder-3', label: 'Viêm gân', regionId: 'shoulder', defaultStatus: 'normal' },
    ],
  },
  {
    id: 'cat-knee',
    name: 'Gối & Chân',
    iconName: 'bone',
    regionId: 'knee',
    symptoms: [
      { id: 'sym-knee-1', label: 'Đau gối', regionId: 'knee', defaultStatus: 'monitoring' },
      { id: 'sym-knee-2', label: 'Sưng khớp', regionId: 'knee', defaultStatus: 'normal' },
      { id: 'sym-knee-3', label: 'Gãy xương', regionId: 'knee', defaultStatus: 'acute' },
    ],
  },
];

export const INITIAL_REGION_STATES: Record<BodyRegionId, { status: TriageStatus; painScore: number; summary: string }> = {
  head: { status: 'normal', painScore: 0, summary: 'Không dấu hiệu bất thường' },
  chest: { status: 'normal', painScore: 0, summary: 'Không dấu hiệu bất thường' },
  abdomen: { status: 'normal', painScore: 0, summary: 'Không dấu hiệu bất thường' },
  spine: { status: 'normal', painScore: 0, summary: 'Không dấu hiệu bất thường' },
  shoulder: { status: 'normal', painScore: 0, summary: 'Không dấu hiệu bất thường' },
  knee: { status: 'normal', painScore: 0, summary: 'Không dấu hiệu bất thường' },
};

export const INITIAL_SESSIONS = [
  {
    id: 'session-1',
    title: 'Tư vấn đau đầu',
    updatedAt: '14:30',
    primaryRegionId: 'head' as BodyRegionId,
    regionStatuses: {
      head: 'monitoring',
      chest: 'normal',
      abdomen: 'normal',
      spine: 'normal',
      shoulder: 'normal',
      knee: 'normal',
    },
    messages: [
      { id: 'm1', role: 'user', content: 'Tôi bị đau đầu liên tục 2 ngày', timestamp: '14:25' },
      { id: 'm2', role: 'assistant', content: 'Bạn có kèm theo sốt hoặc chóng mặt không?', timestamp: '14:26' },
    ],
  },
  {
    id: 'session-2',
    title: 'Khám ngực định kỳ',
    updatedAt: '10:15',
    primaryRegionId: 'chest' as BodyRegionId,
    regionStatuses: {
      head: 'normal',
      chest: 'normal',
      abdomen: 'normal',
      spine: 'normal',
      shoulder: 'normal',
      knee: 'normal',
    },
    messages: [
      { id: 'm3', role: 'user', content: 'Kiểm tra sức khỏe tim phổi', timestamp: '10:10' },
      { id: 'm4', role: 'assistant', content: 'Kết quả khám bình thường, tiếp tục theo dõi.', timestamp: '10:12' },
    ],
  },
];

export const SYSTEM_STATUS = {
  apiConnected: true,
  guardrailsActive: true,
  modelName: 'Gemini Medical RAG',
};
