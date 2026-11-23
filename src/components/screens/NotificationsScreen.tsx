import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  ClipboardCheck,
  Info,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../ui/Primitives';

export const NotificationsScreen: React.FC = () => {
  const {
    visibleNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    openTaskDetail,
  } = useApp();

  const [filter, setFilter] = useState<'todas' | 'nao_lidas'>('todas');

  const items =
    filter === 'nao_lidas'
      ? visibleNotifications.filter((n) => !n.read)
      : visibleNotifications;

  const getIcon = (type: string) => {
    switch (type) {
      case 'devolucao':
        return <RotateCcw className="w-4 h-4 text-[#B91F2C] dark:text-[#F87171]" />;
      case 'prazo':
        return <AlertTriangle className="w-4 h-4 text-[#D97706] dark:text-[#FBBF24]" />;
      case 'conferencia':
        return <ClipboardCheck className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />;
      default:
        return <Info className="w-4 h-4 text-[#6B7280]" />;
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#24272D] dark:text-[#F3F4F6]">
            Notificações
          </h2>
          <p className="hidden sm:block text-xs text-[#6B7280] dark:text-[#8B93A1]">
            Alertas de prazo, devoluções de conferência e atualizações da rede.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 liquid-glass-segment rounded-xl">
            <button
              type="button"
              onClick={() => setFilter('todas')}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === 'todas'
                  ? 'bg-white dark:bg-[#1F2531] text-[#24272D] dark:text-[#F3F4F6] font-semibold shadow-xs dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'text-[#6B7280] dark:text-[#8B93A1] hover:text-[#24272D] dark:hover:text-[#F3F4F6]'
              }`}
            >
              Todas ({visibleNotifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('nao_lidas')}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === 'nao_lidas'
                  ? 'bg-white dark:bg-[#1F2531] text-[#24272D] dark:text-[#F3F4F6] font-semibold shadow-xs dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'text-[#6B7280] dark:text-[#8B93A1] hover:text-[#24272D] dark:hover:text-[#F3F4F6]'
              }`}
            >
              Não lidas
            </button>
          </div>

          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#11141B] text-xs font-medium text-[#4B5563] dark:text-[#D1D5DB] hover:bg-[#F7F8FA] dark:hover:bg-white/[0.04] inline-flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Marcar lidas</span>
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Nenhum aviso pendente"
          description="Você está em dia com todas as notificações operacionais."
        />
      ) : (
        <div className="bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl divide-y divide-[#E5E7EB] dark:divide-white/[0.06] overflow-hidden">
          {items.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                markNotificationRead(n.id);
                if (n.taskId) openTaskDetail(n.taskId);
              }}
              className={`w-full text-left p-3.5 sm:p-4 flex items-start gap-3 transition-colors hover:bg-[#F7F8FA] dark:hover:bg-white/[0.03] ${
                !n.read ? 'bg-[#FFF1F2]/35 dark:bg-[#E1434F]/[0.06]' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-[#F7F8FA] dark:bg-[#171B24] border border-[#E5E7EB] dark:border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] truncate">
                    {n.title}
                  </span>
                  <span className="text-[11px] font-mono-num text-[#6B7280] dark:text-[#8B93A1] shrink-0">
                    {n.createdAt}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {n.message}
                </p>
                {n.taskId && (
                  <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#D52E3A] dark:text-[#FCA5A5]">
                    <Bell className="w-3 h-3" aria-hidden="true" />
                    Abrir atividade vinculada
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
