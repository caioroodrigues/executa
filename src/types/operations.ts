export type UserRole = 'admin' | 'supervisor' | 'gerente';

export type TaskStatus =
  | 'pendente'
  | 'em_andamento'
  | 'aguardando_conferencia'
  | 'aprovada'
  | 'devolvida';

export type TaskPriority = 'alta' | 'media' | 'baixa';

export type TaskCategory =
  | 'Cadeia Fria'
  | 'Controle Sanitário'
  | 'Precificação'
  | 'Dermocosméticos'
  | 'Caixa e Cofre'
  | 'Validade e PVPS'
  | 'Boas Práticas';

export type AppRoute =
  | 'dashboard'
  | 'tasks'
  | 'review'
  | 'championship'
  | 'stores'
  | 'rankings'
  | 'notifications'
  | 'profile'
  | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  jobTitle: string;
  email: string;
  phone: string;
  storeId: string | null; // null for corporate/regional
  storeName: string;
  region: string;
  avatarUrl?: string;
  initials: string;
  active: boolean;
}

export interface StoreUnit {
  id: string;
  code: string;
  name: string;
  city: string;
  region: string;
  managerId: string;
  managerName: string;
  teamSize: number;
  slaRate: number;
  qualityIndex: number;
  openTasks: number;
  overdueTasks: number;
  status: 'ativa' | 'auditoria' | 'reforma';
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface TaskEvidence {
  id: string;
  type: 'image' | 'file';
  name: string;
  url: string;
  sizeLabel: string;
  uploadedAt: string;
  uploadedBy: string;
  note?: string;
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  text: string;
  createdAt: string;
  kind?: 'comment' | 'return_reason' | 'approval_note';
}

export interface TaskAuditEntry {
  id: string;
  action: string;
  actorName: string;
  timestamp: string;
}

export interface OperationalTask {
  id: string;
  code: string;
  title: string;
  description: string;
  instructions: string[];
  category: TaskCategory;
  storeId: string;
  storeCode: string;
  storeName: string;
  assigneeId: string;
  assigneeName: string;
  creatorId: string;
  creatorName: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string; // ISO string
  requiresPhoto: boolean;
  checklist: ChecklistItem[];
  evidences: TaskEvidence[];
  comments: TaskComment[];
  history: TaskAuditEntry[];
  returnReason?: string;
  startedAt?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'prazo' | 'devolucao' | 'conferencia' | 'sistema';
  taskId?: string;
  createdAt: string;
  read: boolean;
  targetRoles: UserRole[];
}

export interface RankingPeriodRow {
  storeId: string;
  storeCode: string;
  storeName: string;
  region: string;
  completedCount: number;
  onTimeRate: number;
  firstPassApprovalRate: number;
  avgResponseHours: number;
  deltaPosition: number;
}

export interface SystemParameter {
  id: string;
  key: string;
  label: string;
  value: string;
  description: string;
}

// Isolated demonstrative Championship types for future backend integration
export type ChampionshipCycleId = 'novembro_2026' | 'outubro_2026' | 'temporada_2026';

export interface ChampionshipScoreEvent {
  id: string;
  storeId: string;
  title: string;
  category: string;
  pointsDelta: number;
  occurredAt: string;
  relatedTaskId?: string;
  relatedTaskCode?: string;
}

export interface ChampionshipStanding {
  storeId: string;
  storeCode: string;
  storeName: string;
  managerName: string;
  region: string;
  totalPoints: number;
  weeklyDeltaPoints: number;
  positionDelta: number;
  completedTasks: number;
  evidenceRate: number;
  weeklyProgression: { label: string; points: number }[];
}

export interface ChampionshipCycle {
  id: ChampionshipCycleId;
  name: string;
  periodLabel: string;
  statusLabel: string;
  standings: ChampionshipStanding[];
  events: ChampionshipScoreEvent[];
}
