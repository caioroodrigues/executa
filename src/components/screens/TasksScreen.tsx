import React, { useMemo, useState } from 'react';
import {
  Camera,
  Paperclip,
  Play,
  Plus,
  RotateCcw,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskStatus } from '../../types/operations';
import { formatDueShort, isTaskOverdue, PRIORITY_META } from '../../utils/taskHelpers';
import {
  EmptyState,
  ErrorState,
  PriorityLabel,
  StatusLabel,
  TaskListSkeleton,
} from '../ui/Primitives';

type FilterTab = 'todas' | 'pendentes' | 'andamento' | 'conferencia' | 'devolvidas' | 'atrasadas' | 'aprovadas';
type SortBy = 'prazo' | 'prioridade' | 'loja';

export const TasksScreen: React.FC = () => {
  const {
    visibleTasks,
    stores,
    capabilities,
    openTaskDetail,
    openExecution,
    openCreateTaskModal,
    startTask,
    isLoadingView,
    simulateLoadError,
    retryViewLoad,
    taskFilterPreset: statusFilter,
    setTaskFilterPreset: setStatusFilter,
  } = useApp();

  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState<string>('todas');
  const [sortBy, setSortBy] = useState<SortBy>('prazo');

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visibleTasks
      .filter((t) => {
        if (storeFilter !== 'todas' && t.storeId !== storeFilter) return false;
        if (statusFilter === 'pendentes' && t.status !== 'pendente') return false;
        if (statusFilter === 'andamento' && t.status !== 'em_andamento') return false;
        if (statusFilter === 'conferencia' && t.status !== 'aguardando_conferencia') return false;
        if (statusFilter === 'devolvidas' && t.status !== 'devolvida') return false;
        if (statusFilter === 'aprovadas' && t.status !== 'aprovada') return false;
        if (statusFilter === 'atrasadas' && !isTaskOverdue(t)) return false;

        if (!q) return true;
        return (
          t.title.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          t.storeName.toLowerCase().includes(q) ||
          t.storeCode.toLowerCase().includes(q) ||
          t.assigneeName.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'prioridade') {
          return PRIORITY_META[b.priority].weight - PRIORITY_META[a.priority].weight;
        }
        if (sortBy === 'loja') {
          return a.storeCode.localeCompare(b.storeCode);
        }
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [visibleTasks, storeFilter, statusFilter, search, sortBy]);

  if (simulateLoadError) {
    return (
      <ErrorState
        message="Erro ao sincronizar a listagem de tarefas. Tente atualizar novamente."
        onRetry={retryViewLoad}
      />
    );
  }

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: 'todas', label: 'Todas' },
    { id: 'pendentes', label: 'Pendentes' },
    { id: 'andamento', label: 'Em curso' },
    { id: 'devolvidas', label: 'Devolvidas' },
    { id: 'atrasadas', label: 'Atrasadas' },
    { id: 'conferencia', label: 'Conferência' },
    { id: 'aprovadas', label: 'Aprovadas' },
  ];

  const renderAction = (taskStatus: TaskStatus, taskId: string) => {
    if (taskStatus === 'pendente') {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            startTask(taskId);
            openExecution(taskId);
          }}
          className="min-h-[32px] sm:min-h-[34px] px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl bg-[#D52E3A] hover:bg-[#B91F2C] text-white text-[11px] sm:text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap"
        >
          <Play className="w-3 h-3" aria-hidden="true" />
          <span>Iniciar</span>
        </button>
      );
    }
    if (taskStatus === 'em_andamento') {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openExecution(taskId);
          }}
          className="min-h-[32px] sm:min-h-[34px] px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl bg-[#FFF1F2] dark:bg-[#D52E3A]/18 text-[#B91F2C] dark:text-[#FCA5A5] text-[11px] sm:text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap"
        >
          <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
          <span>Executar</span>
        </button>
      );
    }
    if (taskStatus === 'devolvida') {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openExecution(taskId);
          }}
          className="min-h-[32px] sm:min-h-[34px] px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl bg-[#FFF1F2] dark:bg-[#D52E3A]/20 text-[#B91F2C] dark:text-[#FCA5A5] text-[11px] sm:text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap"
        >
          <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
          <span>Corrigir</span>
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          openTaskDetail(taskId);
        }}
        className="min-h-[32px] sm:min-h-[34px] px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] text-[11px] sm:text-xs font-medium text-[#4B5563] dark:text-[#9CA3AF] hover:bg-[#F7F8FA] dark:hover:bg-white/[0.04] whitespace-nowrap"
      >
        Abrir
      </button>
    );
  };

  return (
    <div className="space-y-2.5 sm:space-y-4">
      {/* Toolbar: Search + Compact Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-2.5">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6B7280] dark:text-[#8B93A1] absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tarefa ou loja..."
              className="w-full min-h-[36px] sm:min-h-[40px] pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 rounded-xl liquid-glass-surface text-[11.5px] sm:text-xs text-[#24272D] dark:text-[#F3F4F6] focus:outline-none focus:border-[#D52E3A] dark:focus:border-[#E1434F]"
            />
          </div>

          {capabilities.canCreateTasks && (
            <button
              type="button"
              onClick={openCreateTaskModal}
              aria-label="Criar nova tarefa"
              className="md:hidden min-h-[36px] px-2.5 rounded-xl bg-[#D52E3A] hover:bg-[#B91F2C] text-white text-[11.5px] font-semibold inline-flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Nova</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 md:pb-0">
          {capabilities.canManageStores && (
            <select
              aria-label="Filtrar por loja"
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="min-h-[34px] sm:min-h-[40px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl liquid-glass-surface text-[11px] sm:text-xs text-[#24272D] dark:text-[#F3F4F6]"
            >
              <option value="todas">Todas as lojas</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name.split(' — ')[0]}
                </option>
              ))}
            </select>
          )}

          <select
            aria-label="Ordenar tarefas"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="min-h-[34px] sm:min-h-[40px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl liquid-glass-surface text-[11px] sm:text-xs text-[#24272D] dark:text-[#F3F4F6]"
          >
            <option value="prazo">Ordenar: Prazo</option>
            <option value="prioridade">Ordenar: Prioridade</option>
            <option value="loja">Ordenar: Loja</option>
          </select>

          {capabilities.canCreateTasks && (
            <button
              type="button"
              onClick={openCreateTaskModal}
              className="hidden md:inline-flex min-h-[40px] px-3.5 py-2 rounded-xl bg-[#D52E3A] hover:bg-[#B91F2C] text-white text-xs font-semibold items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Criar tarefa</span>
            </button>
          )}
        </div>
      </div>

      {/* Compact Segmented Status Filter (Liquid Glass) */}
      <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 liquid-glass-segment rounded-xl overflow-x-auto">
        {filterTabs.map((tab) => {
          const active = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`min-h-[30px] sm:min-h-[34px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                active
                  ? 'bg-white dark:bg-[#1F2531] text-[#24272D] dark:text-[#F3F4F6] font-semibold shadow-xs dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'text-[#6B7280] dark:text-[#8B93A1] hover:text-[#24272D] dark:hover:text-[#F3F4F6]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Results Count (desktop/tablet) */}
      <div className="hidden sm:block text-[11px] text-[#6B7280] dark:text-[#8B93A1] font-mono-num">
        {filteredTasks.length} atividade(s) encontrada(s)
      </div>

      {/* Content */}
      {isLoadingView ? (
        <TaskListSkeleton rows={5} />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="Nenhuma tarefa para os filtros aplicados"
          description="Tente limpar a busca ou selecionar outro status para visualizar atividades."
          actionLabel="Limpar filtros"
          onAction={() => {
            setSearch('');
            setStatusFilter('todas');
            setStoreFilter('todas');
          }}
        />
      ) : (
        <>
          {/* Mobile & Tablet Streamlined Compact List */}
          <div className="lg:hidden liquid-glass-list rounded-xl sm:rounded-2xl divide-y divide-[#E5E7EB]/85 dark:divide-white/[0.06] overflow-hidden">
            {filteredTasks.map((task) => {
              const overdue = isTaskOverdue(task);
              return (
                <div
                  key={task.id}
                  onClick={() => openTaskDetail(task.id)}
                  className="px-2.5 py-2 sm:px-4 sm:py-3 hover:bg-[#F7F8FA]/80 dark:hover:bg-white/[0.03] transition-colors cursor-pointer flex items-center justify-between gap-2.5"
                >
                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#6B7280] dark:text-[#8B93A1] mb-0.5">
                      <span className="font-mono-num font-semibold text-[#24272D] dark:text-[#D1D5DB]">
                        {task.code}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{task.category}</span>
                      <span aria-hidden="true">·</span>
                      <PriorityLabel priority={task.priority} />
                    </div>
                    <h3 className="text-[12px] sm:text-[13px] font-semibold text-[#24272D] dark:text-[#F3F4F6] leading-[1.3] sm:leading-snug line-clamp-2">
                      {task.title}
                    </h3>
                    <div className="mt-0.5 sm:mt-1 flex flex-wrap items-center gap-x-1.5 sm:gap-x-2 gap-y-0.5 text-[10.5px] sm:text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
                      <span className="font-medium text-[#4B5563] dark:text-[#9CA3AF] shrink-0">
                        {task.storeCode}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-mono-num truncate ${
                          overdue ? 'text-[#B91F2C] dark:text-[#F87171] font-semibold' : ''
                        }`}
                      >
                        {formatDueShort(task.dueDate)}
                      </span>
                      {task.evidences.length > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-0.5 shrink-0">
                            <Paperclip className="w-2.5 h-2.5 sm:w-3 sm:h-3" aria-hidden="true" />
                            <span className="font-mono-num">{task.evidences.length}</span>
                          </span>
                        </>
                      )}
                      <span className="sm:hidden" aria-hidden="true">·</span>
                      <span className="sm:hidden inline-flex items-center">
                        <StatusLabel status={task.status} overdue={overdue} />
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="hidden sm:block">
                      <StatusLabel status={task.status} overdue={overdue} />
                    </div>
                    {renderAction(task.status, task.id)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop High-Density Corporate Table */}
          <div className="hidden lg:block bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] dark:border-white/[0.08] bg-[#F5F6F8] dark:bg-[#161A23] text-[11px] font-semibold text-[#6B7280] dark:text-[#8B93A1]">
                  <th className="py-2.5 px-4">Atividade</th>
                  <th className="py-2.5 px-3">Unidade</th>
                  <th className="py-2.5 px-3">Responsável</th>
                  <th className="py-2.5 px-3">Prioridade</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Prazo</th>
                  <th className="py-2.5 px-3 text-right">Evid.</th>
                  <th className="py-2.5 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] dark:divide-white/[0.06] text-xs">
                {filteredTasks.map((task) => {
                  const overdue = isTaskOverdue(task);
                  return (
                    <tr
                      key={task.id}
                      onClick={() => openTaskDetail(task.id)}
                      className="hover:bg-[#F7F8FA]/80 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 max-w-sm">
                        <div className="flex items-center gap-2 text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
                          <span className="font-mono-num font-semibold text-[#24272D] dark:text-[#D1D5DB]">
                            {task.code}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{task.category}</span>
                        </div>
                        <div className="font-semibold text-[#24272D] dark:text-[#F3F4F6] truncate mt-0.5">
                          {task.title}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-[#4B5563] dark:text-[#D1D5DB]">
                        {task.storeCode} · {task.storeName}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-[#4B5563] dark:text-[#D1D5DB]">
                        {task.assigneeName}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <PriorityLabel priority={task.priority} />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusLabel status={task.status} overdue={overdue} />
                      </td>
                      <td
                        className={`py-3 px-3 whitespace-nowrap font-mono-num ${
                          overdue
                            ? 'text-[#B91F2C] dark:text-[#F87171] font-semibold'
                            : 'text-[#4B5563] dark:text-[#D1D5DB]'
                        }`}
                      >
                        {formatDueShort(task.dueDate)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num text-[#6B7280] dark:text-[#8B93A1]">
                        {task.evidences.length}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {renderAction(task.status, task.id)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
