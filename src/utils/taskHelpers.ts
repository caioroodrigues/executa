import { OperationalTask, TaskPriority, TaskStatus, UserRole } from '../types/operations';

export interface RoleCapabilities {
  canCreateTasks: boolean;
  canEditTasks: boolean;
  canReviewTasks: boolean;
  canExecuteTasks: boolean;
  canManageStores: boolean;
  canManageAdmin: boolean;
  scopeLabel: string;
}

export function getRoleCapabilities(role: UserRole): RoleCapabilities {
  switch (role) {
    case 'admin':
      return {
        canCreateTasks: true,
        canEditTasks: true,
        canReviewTasks: true,
        canExecuteTasks: true,
        canManageStores: true,
        canManageAdmin: true,
        scopeLabel: 'Visão corporativa · Todas as unidades',
      };
    case 'supervisor':
      return {
        canCreateTasks: true,
        canEditTasks: true,
        canReviewTasks: true,
        canExecuteTasks: true,
        canManageStores: true,
        canManageAdmin: false,
        scopeLabel: 'Regional Centro-Sul · 6 unidades',
      };
    case 'gerente':
      return {
        canCreateTasks: false,
        canEditTasks: false,
        canReviewTasks: false,
        canExecuteTasks: true,
        canManageStores: false,
        canManageAdmin: false,
        scopeLabel: 'Unidade MM-04 Savassi · Tarefas designadas',
      };
  }
}

export function isTaskOverdue(task: OperationalTask): boolean {
  if (task.status === 'aprovada' || task.status === 'aguardando_conferencia') {
    return false;
  }
  const due = new Date(task.dueDate).getTime();
  const now = Date.now();
  return due < now;
}

export function formatDueShort(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');

  if (isToday) return `Hoje, ${hh}:${mm}`;
  if (isYesterday) return `Ontem, ${hh}:${mm}`;

  const dd = String(date.getDate()).padStart(2, '0');
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mo}, ${hh}:${mm}`;
}

export function formatNowStamp(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${dd}/${mo} às ${hh}:${mm}`;
}

export const STATUS_META: Record<
  TaskStatus,
  { label: string; shortLabel: string; colorClass: string }
> = {
  pendente: {
    label: 'Pendente',
    shortLabel: 'Pendente',
    colorClass: 'text-[#6B7280] dark:text-[#9CA3AF]',
  },
  em_andamento: {
    label: 'Em andamento',
    shortLabel: 'Em curso',
    colorClass: 'text-[#1D4ED8] dark:text-[#60A5FA]',
  },
  aguardando_conferencia: {
    label: 'Aguardando conferência',
    shortLabel: 'Conferência',
    colorClass: 'text-[#B45309] dark:text-[#FBBF24]',
  },
  aprovada: {
    label: 'Aprovada',
    shortLabel: 'Aprovada',
    colorClass: 'text-[#15803D] dark:text-[#4ADE80]',
  },
  devolvida: {
    label: 'Devolvida para ajuste',
    shortLabel: 'Devolvida',
    colorClass: 'text-[#B91F2C] dark:text-[#F87171]',
  },
};

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; colorClass: string; weight: number }
> = {
  alta: {
    label: 'Alta',
    colorClass: 'text-[#B91F2C] dark:text-[#F87171]',
    weight: 3,
  },
  media: {
    label: 'Média',
    colorClass: 'text-[#B45309] dark:text-[#FBBF24]',
    weight: 2,
  },
  baixa: {
    label: 'Baixa',
    colorClass: 'text-[#6B7280] dark:text-[#9CA3AF]',
    weight: 1,
  },
};
