import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Play,
  Plus,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CHAMPIONSHIP_CYCLES } from '../../data/championshipData';
import { formatDueShort, isTaskOverdue } from '../../utils/taskHelpers';
import {
  EmptyState,
  ErrorState,
  PriorityLabel,
  StatusLabel,
  TaskListSkeleton,
} from '../ui/Primitives';

export const DashboardScreen: React.FC = () => {
  const {
    currentUser,
    capabilities,
    visibleTasks,
    stores,
    visibleNotifications,
    navigate,
    navigateTasksFiltered,
    openTaskDetail,
    openExecution,
    openCreateTaskModal,
    startTask,
    isLoadingView,
    simulateLoadError,
    retryViewLoad,
  } = useApp();

  if (simulateLoadError) {
    return (
      <ErrorState
        message="Simulação de falha na leitura operacional. Verifique sua conexão ou tente recarregar os dados em cache."
        onRetry={retryViewLoad}
      />
    );
  }

  const pendingCount = visibleTasks.filter(
    (t) => t.status === 'pendente' || t.status === 'devolvida'
  ).length;
  const inProgressCount = visibleTasks.filter((t) => t.status === 'em_andamento').length;
  const overdueCount = visibleTasks.filter((t) => isTaskOverdue(t)).length;
  const waitingReviewCount = visibleTasks.filter(
    (t) => t.status === 'aguardando_conferencia'
  ).length;

  const priorityTasks = [...visibleTasks]
    .filter((t) => t.status !== 'aprovada')
    .sort((a, b) => {
      const aOver = isTaskOverdue(a) ? 1 : 0;
      const bOver = isTaskOverdue(b) ? 1 : 0;
      if (aOver !== bOver) return bOver - aOver;
      if (a.status === 'devolvida' && b.status !== 'devolvida') return -1;
      if (b.status === 'devolvida' && a.status !== 'devolvida') return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);

  const nextExecutable = priorityTasks.find(
    (t) => t.status === 'devolvida' || t.status === 'pendente' || t.status === 'em_andamento'
  );

  const cycle = CHAMPIONSHIP_CYCLES.novembro_2026;
  const champPosIdx = cycle.standings.findIndex(
    (s) => s.storeId === (currentUser.storeId || cycle.standings[0].storeId)
  );
  const champStanding = cycle.standings[champPosIdx >= 0 ? champPosIdx : 0];

  return (
    <div className="space-y-3 sm:space-y-5">
      {/* Compact Header Summary + Primary Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <div>
          <h2 className="text-[15px] sm:text-xl font-bold tracking-tight text-[#24272D] dark:text-[#F3F4F6] leading-tight">
            Olá, {currentUser.name.split(' ')[0]}
          </h2>
          <p className="text-[11px] sm:text-xs text-[#6B7280] dark:text-[#8B93A1] mt-0.5">
            <span className="sm:hidden">
              {currentUser.roleLabel} · {currentUser.storeName}
            </span>
            <span className="hidden sm:inline">
              {currentUser.jobTitle} · {currentUser.storeName}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 sm:pb-0">
          {nextExecutable && (
            <button
              type="button"
              onClick={() => {
                if (nextExecutable.status === 'pendente') startTask(nextExecutable.id);
                openExecution(nextExecutable.id);
              }}
              className="min-h-[34px] sm:min-h-[40px] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-[#D52E3A] hover:bg-[#B91F2C] text-white text-[11px] sm:text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              <span>Executar próxima</span>
            </button>
          )}
          {capabilities.canCreateTasks && (
            <button
              type="button"
              onClick={openCreateTaskModal}
              className="min-h-[34px] sm:min-h-[40px] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl liquid-glass-surface text-[11px] sm:text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors hover:border-[#D52E3A]/40"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D52E3A] dark:text-[#E1434F]" aria-hidden="true" />
              <span>Nova tarefa</span>
            </button>
          )}
          {capabilities.canReviewTasks && (
            <button
              type="button"
              onClick={() => navigate('review')}
              className="hidden sm:inline-flex min-h-[40px] px-3.5 py-2 rounded-xl liquid-glass-surface text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
            >
              <ClipboardCheck className="w-4 h-4 text-[#D52E3A] dark:text-[#E1434F]" aria-hidden="true" />
              <span>Conferir ({waitingReviewCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* 2x2 Frosted Liquid Glass KPI Grid — compact on mobile */}
      <section aria-label="Indicadores operacionais">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => navigateTasksFiltered('pendentes')}
            className="text-left px-2.5 py-2 sm:p-4 rounded-xl sm:rounded-2xl liquid-glass-surface hover:border-[#AEB0B3] dark:hover:border-white/20 transition-all"
          >
            <div className="flex items-center justify-between gap-1.5 text-[11px] sm:text-xs font-medium text-[#4B5563] dark:text-[#9CA3AF]">
              <span className="truncate">Pendentes</span>
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6B7280] dark:text-[#8B93A1] shrink-0" aria-hidden="true" />
            </div>
            <div className="mt-0.5 sm:mt-2 text-xl sm:text-[26px] leading-tight font-bold font-mono-num text-[#24272D] dark:text-[#F3F4F6]">
              {pendingCount}
            </div>
            <div className="hidden sm:block mt-0.5 text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
              Aguardando início ou ajuste
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigateTasksFiltered('andamento')}
            className="text-left px-2.5 py-2 sm:p-4 rounded-xl sm:rounded-2xl liquid-glass-surface bg-[#EFF6FF]/75 dark:bg-[#1E293B]/45 border-[#BFDBFE]/80 dark:border-[#3B82F6]/22 hover:border-[#60A5FA] dark:hover:border-[#60A5FA]/45 transition-all"
          >
            <div className="flex items-center justify-between gap-1.5 text-[11px] sm:text-xs font-medium text-[#1E40AF] dark:text-[#93C5FD]">
              <span className="truncate">Em andamento</span>
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" aria-hidden="true" />
            </div>
            <div className="mt-0.5 sm:mt-2 text-xl sm:text-[26px] leading-tight font-bold font-mono-num text-[#1E3A8A] dark:text-[#F3F4F6]">
              {inProgressCount}
            </div>
            <div className="hidden sm:block mt-0.5 text-[11px] text-[#2563EB]/90 dark:text-[#93C5FD]/75">
              Em execução na loja
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigateTasksFiltered('atrasadas')}
            className="text-left px-2.5 py-2 sm:p-4 rounded-xl sm:rounded-2xl liquid-glass-surface bg-[#FFF1F2]/85 dark:bg-[#E1434F]/[0.09] border-[#FECDD3]/90 dark:border-[#E1434F]/25 hover:border-[#FB7185] dark:hover:border-[#E1434F]/50 transition-all"
          >
            <div className="flex items-center justify-between gap-1.5 text-[11px] sm:text-xs font-medium text-[#B91F2C] dark:text-[#FCA5A5]">
              <span className="truncate">Atrasadas</span>
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D52E3A] dark:text-[#F87171] shrink-0" aria-hidden="true" />
            </div>
            <div className="mt-0.5 sm:mt-2 text-xl sm:text-[26px] leading-tight font-bold font-mono-num text-[#B91F2C] dark:text-[#F3F4F6]">
              {overdueCount}
            </div>
            <div className="hidden sm:block mt-0.5 text-[11px] text-[#9F1239] dark:text-[#FCA5A5]/75">
              Prazo vencido
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              capabilities.canReviewTasks ? navigate('review') : navigateTasksFiltered('conferencia')
            }
            className="text-left px-2.5 py-2 sm:p-4 rounded-xl sm:rounded-2xl liquid-glass-surface bg-[#FFFBEB]/80 dark:bg-[#78350F]/14 border-[#FDE68A]/85 dark:border-[#F59E0B]/22 hover:border-[#FBBF24] dark:hover:border-[#F59E0B]/45 transition-all"
          >
            <div className="flex items-center justify-between gap-1.5 text-[11px] sm:text-xs font-medium text-[#92400E] dark:text-[#FDE68A]">
              <span className="truncate">
                {capabilities.canReviewTasks ? 'Conferência' : 'Em conferência'}
              </span>
              <ClipboardCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D97706] dark:text-[#FBBF24] shrink-0" aria-hidden="true" />
            </div>
            <div className="mt-0.5 sm:mt-2 text-xl sm:text-[26px] leading-tight font-bold font-mono-num text-[#78350F] dark:text-[#F3F4F6]">
              {waitingReviewCount}
            </div>
            <div className="hidden sm:block mt-0.5 text-[11px] text-[#B45309] dark:text-[#FDE68A]/75">
              {capabilities.canReviewTasks ? 'Prontas para validar' : 'Enviadas para validação'}
            </div>
          </button>
        </div>
      </section>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start">
        {/* Left: Priority Task Queue */}
        <section className="lg:col-span-8 space-y-2 sm:space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-semibold text-[#24272D] dark:text-[#F3F4F6]">
              Prioridades operacionais
            </h3>
            <button
              type="button"
              onClick={() => navigate('tasks')}
              className="text-[11px] sm:text-xs font-semibold text-[#D52E3A] dark:text-[#FCA5A5] hover:text-[#B91F2C] inline-flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
            </button>
          </div>

          {isLoadingView ? (
            <TaskListSkeleton rows={4} />
          ) : priorityTasks.length === 0 ? (
            <EmptyState
              title="Nenhuma atividade pendente"
              description="Todas as rotinas operacionais deste escopo foram concluídas e conferidas."
              actionLabel={capabilities.canCreateTasks ? 'Criar nova atividade' : 'Ver concluídas'}
              onAction={capabilities.canCreateTasks ? openCreateTaskModal : () => navigate('tasks')}
            />
          ) : (
            <div className="liquid-glass-list rounded-xl sm:rounded-2xl divide-y divide-[#E5E7EB]/85 dark:divide-white/[0.06] overflow-hidden">
              {priorityTasks.map((task) => {
                const overdue = isTaskOverdue(task);
                const canDirectExecute =
                  task.status === 'pendente' ||
                  task.status === 'em_andamento' ||
                  task.status === 'devolvida';
                const canDirectReview =
                  capabilities.canReviewTasks && task.status === 'aguardando_conferencia';

                return (
                  <div
                    key={task.id}
                    className="px-2.5 py-2 sm:px-4 sm:py-3 hover:bg-[#F7F8FA]/80 dark:hover:bg-white/[0.03] transition-colors flex items-center justify-between gap-2.5"
                  >
                    <button
                      type="button"
                      onClick={() => openTaskDetail(task.id)}
                      className="text-left min-w-0 flex-1 py-0.5"
                    >
                      {/* Desktop-only top kicker */}
                      <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#6B7280] dark:text-[#8B93A1] mb-0.5">
                        <span className="font-mono-num font-semibold text-[#24272D] dark:text-[#D1D5DB]">
                          {task.code}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{task.category}</span>
                        <span aria-hidden="true">·</span>
                        <PriorityLabel priority={task.priority} />
                      </div>
                      <div className="text-[12px] sm:text-[13px] font-semibold text-[#24272D] dark:text-[#F3F4F6] leading-[1.3] sm:leading-snug line-clamp-2 sm:line-clamp-none">
                        {task.title}
                      </div>
                      {/* Concise mobile metadata vs complete desktop metadata */}
                      <div className="mt-0.5 sm:mt-1 flex flex-wrap items-center gap-x-1.5 sm:gap-x-2 gap-y-0.5 text-[10.5px] sm:text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
                        <span className="font-medium text-[#4B5563] dark:text-[#9CA3AF]">
                          {task.storeCode}
                        </span>
                        <span className="hidden sm:inline">{task.storeName}</span>
                        <span className="hidden sm:inline" aria-hidden="true">·</span>
                        <span className="hidden sm:inline">{task.assigneeName}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-mono-num ${
                            overdue ? 'text-[#B91F2C] dark:text-[#F87171] font-semibold' : ''
                          }`}
                        >
                          {formatDueShort(task.dueDate)}
                        </span>
                        <span className="sm:hidden" aria-hidden="true">·</span>
                        <span className="sm:hidden inline-flex items-center">
                          <StatusLabel status={task.status} overdue={overdue} />
                        </span>
                      </div>
                    </button>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden sm:block">
                        <StatusLabel status={task.status} overdue={overdue} />
                      </div>

                      {canDirectReview ? (
                        <button
                          type="button"
                          onClick={() => openTaskDetail(task.id)}
                          className="min-h-[32px] sm:min-h-[34px] px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl bg-[#FFFBEB] dark:bg-[#78350F]/30 border border-[#FDE68A] dark:border-[#92400E]/50 text-[#92400E] dark:text-[#FDE68A] text-[11px] sm:text-xs font-semibold whitespace-nowrap"
                        >
                          Conferir
                        </button>
                      ) : canDirectExecute ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (task.status === 'pendente') startTask(task.id);
                            openExecution(task.id);
                          }}
                          className="min-h-[32px] sm:min-h-[34px] px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl bg-[#FFF1F2] dark:bg-[#E1434F]/[0.14] text-[#B91F2C] dark:text-[#FCA5A5] hover:bg-[#FFE4E6] dark:hover:bg-[#E1434F]/25 text-[11px] sm:text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap transition-colors"
                        >
                          {task.status === 'devolvida' ? (
                            <>
                              <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
                              <span>Corrigir</span>
                            </>
                          ) : task.status === 'pendente' ? (
                            <>
                              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
                              <span>Iniciar</span>
                            </>
                          ) : (
                            <span>Continuar</span>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openTaskDetail(task.id)}
                          className="min-h-[32px] sm:min-h-[34px] px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] text-[11px] sm:text-xs font-medium text-[#4B5563] dark:text-[#9CA3AF] hover:bg-[#F7F8FA] dark:hover:bg-white/[0.04]"
                        >
                          Detalhes
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Compact Championship Spotlight + Desktop-rich Store/Alerts */}
        <aside className="lg:col-span-4 space-y-3 sm:space-y-4">
          {/* Championship Spotlight Card (always visible, compact) */}
          <button
            type="button"
            onClick={() => navigate('championship')}
            className="w-full text-left rounded-xl sm:rounded-2xl liquid-glass-surface px-3 py-2.5 sm:p-4 hover:border-[#D52E3A]/45 transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs font-semibold text-[#D52E3A] dark:text-[#FCA5A5] inline-flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                <span>{cycle.name}</span>
              </span>
              <span className="text-[10.5px] sm:text-[11px] font-semibold text-[#6B7280] dark:text-[#8B93A1]">
                Ver pódio
              </span>
            </div>

            <div className="mt-1.5 sm:mt-2 flex items-baseline justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11.5px] sm:text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] truncate">
                  {champStanding.storeCode} · {champStanding.storeName.split(' — ')[0]}
                </div>
                <div className="text-[10.5px] sm:text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
                  {champPosIdx + 1}º lugar · +{champStanding.weeklyDeltaPoints} pts/sem
                </div>
              </div>
              <div className="text-right font-mono-num shrink-0">
                <span className="text-base sm:text-lg font-bold text-[#24272D] dark:text-[#F3F4F6]">
                  {champStanding.totalPoints.toLocaleString('pt-BR')}
                </span>
                <span className="text-[10.5px] sm:text-[11px] text-[#6B7280] dark:text-[#8B93A1] ml-1">pts</span>
              </div>
            </div>
          </button>

          {/* Store Summary (hidden on compact mobile to avoid clutter; accessible via Lojas/Indicadores) */}
          <div className="hidden md:block bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#D52E3A] dark:text-[#E1434F]" aria-hidden="true" />
                <span>
                  {capabilities.canManageStores ? 'Desempenho das unidades' : 'Indicadores da unidade'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => navigate('rankings')}
                className="text-[11px] font-semibold text-[#D52E3A] dark:text-[#FCA5A5]"
              >
                Indicadores
              </button>
            </div>

            <div className="divide-y divide-[#E5E7EB] dark:divide-white/[0.06]">
              {(capabilities.canManageStores
                ? stores.slice(0, 4)
                : stores.filter((s) => s.id === (currentUser.storeId || 'st-04'))
              ).map((store) => (
                <div key={store.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <div className="font-semibold text-[#24272D] dark:text-[#F3F4F6] truncate">
                      {store.code} · {store.name.split(' — ')[0]}
                    </div>
                    <div className="text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
                      {store.openTasks} abertas · {store.overdueTasks} atrasada(s)
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono-num font-bold text-[#15803D] dark:text-[#4ADE80]">
                      {store.slaRate}%
                    </div>
                    <div className="text-[10px] text-[#6B7280] dark:text-[#8B93A1]">no prazo</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Notifications (desktop & tablet only; mobile uses header bell) */}
          <div className="hidden md:block bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6]">
                Avisos recentes
              </h3>
              <button
                type="button"
                onClick={() => navigate('notifications')}
                className="text-[11px] font-semibold text-[#D52E3A] dark:text-[#FCA5A5]"
              >
                Ver todos
              </button>
            </div>

            <div className="divide-y divide-[#E5E7EB] dark:divide-white/[0.06]">
              {visibleNotifications.slice(0, 3).map((not) => (
                <button
                  key={not.id}
                  type="button"
                  onClick={() => (not.taskId ? openTaskDetail(not.taskId) : navigate('notifications'))}
                  className="w-full text-left py-2.5 first:pt-0 last:pb-0 hover:opacity-85 transition-opacity"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] truncate">
                      {not.title}
                    </span>
                    {!not.read && (
                      <span className="text-[10px] font-semibold text-[#D52E3A] dark:text-[#FCA5A5] shrink-0">
                        Novo
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#6B7280] dark:text-[#8B93A1] line-clamp-2 leading-relaxed">
                    {not.message}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex px-3.5 py-3 rounded-2xl liquid-glass-surface text-[11px] text-[#4B5563] dark:text-[#9CA3AF] items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#D52E3A] shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Perfil ativo: <strong>{currentUser.roleLabel}</strong>. Gerentes cumprem as tarefas designadas e enviam evidências; Supervisores e Administradores abrem tarefas e realizam a conferência.
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
};
