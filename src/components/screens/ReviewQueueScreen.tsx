import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle2,
  ClipboardCheck,
  FileText,
  RotateCcw,
  ZoomIn,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDueShort } from '../../utils/taskHelpers';
import { EmptyState, PriorityLabel, StatusLabel } from '../ui/Primitives';

export const ReviewQueueScreen: React.FC = () => {
  const {
    tasks,
    currentUser,
    approveTask,
    returnTask,
    openTaskDetail,
  } = useApp();

  const [tab, setTab] = useState<'fila' | 'historico'>('fila');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const scopedTasks = useMemo(() => {
    return tasks.filter((t) =>
      currentUser.role === 'gerente' ? t.storeId === currentUser.storeId : true
    );
  }, [tasks, currentUser]);

  const queue = useMemo(
    () => scopedTasks.filter((t) => t.status === 'aguardando_conferencia'),
    [scopedTasks]
  );

  const reviewedHistory = useMemo(
    () => scopedTasks.filter((t) => t.status === 'aprovada' || t.status === 'devolvida'),
    [scopedTasks]
  );

  const list = tab === 'fila' ? queue : reviewedHistory;
  const activeTask = list.find((t) => t.id === selectedId) || list[0] || null;

  const handleApprove = () => {
    if (!activeTask) return;
    approveTask(activeTask.id, approvalNote);
    setApprovalNote('');
    setShowReturnForm(false);
  };

  const handleReturn = () => {
    if (!activeTask || !returnReason.trim()) return;
    returnTask(activeTask.id, returnReason);
    setReturnReason('');
    setShowReturnForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#24272D] dark:text-[#F3F4F6]">
            Central de Conferência
          </h2>
          <p className="hidden sm:block text-xs text-[#6B7280] dark:text-[#8B93A1]">
            Analise evidências enviadas pelas unidades antes de encerrar ou solicitar correção.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 liquid-glass-segment rounded-xl self-start">
          <button
            type="button"
            onClick={() => {
              setTab('fila');
              setSelectedId(null);
            }}
            className={`min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              tab === 'fila'
                ? 'bg-white dark:bg-[#1F2531] text-[#24272D] dark:text-[#F3F4F6] font-semibold shadow-xs dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'text-[#6B7280] dark:text-[#8B93A1] hover:text-[#24272D] dark:hover:text-[#F3F4F6]'
            }`}
          >
            Aguardando ({queue.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('historico');
              setSelectedId(null);
            }}
            className={`min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              tab === 'historico'
                ? 'bg-white dark:bg-[#1F2531] text-[#24272D] dark:text-[#F3F4F6] font-semibold shadow-xs dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'text-[#6B7280] dark:text-[#8B93A1] hover:text-[#24272D] dark:hover:text-[#F3F4F6]'
            }`}
          >
            Conferidas ({reviewedHistory.length})
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title={tab === 'fila' ? 'Fila de conferência zerada' : 'Nenhuma conferência registrada'}
          description={
            tab === 'fila'
              ? 'Todas as tarefas enviadas neste escopo já foram analisadas.'
              : 'As tarefas aprovadas ou devolvidas aparecerão aqui.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
          {/* Left Queue */}
          <div className="lg:col-span-5 liquid-glass-list rounded-xl sm:rounded-2xl divide-y divide-[#E5E7EB]/85 dark:divide-white/[0.06] overflow-hidden">
            {list.map((item) => {
              const selected = activeTask?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(item.id);
                    setShowReturnForm(false);
                  }}
                  className={`w-full text-left px-3 py-2 sm:p-3.5 transition-colors ${
                    selected
                      ? 'bg-[#FFF1F2]/75 dark:bg-[#E1434F]/[0.11]'
                      : 'hover:bg-[#F7F8FA]/80 dark:hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10.5px] sm:text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
                    <span className="font-mono-num font-semibold text-[#24272D] dark:text-[#D1D5DB]">
                      {item.code} · {item.storeCode}
                    </span>
                    <StatusLabel status={item.status} />
                  </div>
                  <div className="mt-0.5 sm:mt-1 text-[12px] sm:text-[13px] font-semibold text-[#24272D] dark:text-[#F3F4F6] leading-[1.3] sm:leading-snug line-clamp-2">
                    {item.title}
                  </div>
                  <div className="mt-0.5 sm:mt-1 text-[10.5px] sm:text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
                    <span className="hidden sm:inline">{item.assigneeName} · </span>
                    {item.evidences.length} evidência(s) ·{' '}
                    <span className="font-mono-num">
                      {item.submittedAt || formatDueShort(item.dueDate)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Inspector */}
          {activeTask && (
            <div className="lg:col-span-7 bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E5E7EB] dark:border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#8B93A1]">
                    <span className="font-mono-num font-semibold text-[#24272D] dark:text-[#F3F4F6]">
                      {activeTask.code}
                    </span>
                    <span>·</span>
                    <span>
                      {activeTask.storeCode} {activeTask.storeName}
                    </span>
                    <span>·</span>
                    <PriorityLabel priority={activeTask.priority} />
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-[#24272D] dark:text-[#F3F4F6]">
                    {activeTask.title}
                  </h3>
                  <div className="mt-1 text-xs text-[#6B7280] dark:text-[#8B93A1]">
                    Executado por <strong className="text-[#24272D] dark:text-[#D1D5DB]">{activeTask.assigneeName}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openTaskDetail(activeTask.id)}
                  className="text-xs font-semibold text-[#D52E3A] dark:text-[#FCA5A5] shrink-0"
                >
                  Ver ficha completa
                </button>
              </div>

              {/* Evidences Preview */}
              <div>
                <h4 className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] mb-2">
                  Evidências enviadas ({activeTask.evidences.length})
                </h4>
                {activeTask.evidences.length === 0 ? (
                  <p className="text-xs text-[#6B7280] dark:text-[#8B93A1]">
                    Atividade concluída sem anexos fotográficos (não exigido).
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeTask.evidences.map((ev) => (
                      <div
                        key={ev.id}
                        className="rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] overflow-hidden bg-[#F7F8FA] dark:bg-[#0D1017]"
                      >
                        {ev.type === 'image' && ev.url ? (
                          <button
                            type="button"
                            onClick={() => setLightboxUrl(ev.url)}
                            className="relative w-full aspect-[4/3] block group"
                          >
                            <img
                              src={ev.url}
                              alt={ev.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/75 text-white text-[10px] font-medium inline-flex items-center gap-1">
                              <ZoomIn className="w-3 h-3" /> Ampliar
                            </span>
                          </button>
                        ) : (
                          <div className="p-4 flex items-center gap-2 text-xs text-[#24272D] dark:text-[#F3F4F6]">
                            <FileText className="w-5 h-5 text-[#D52E3A] dark:text-[#E1434F] shrink-0" />
                            <span className="truncate font-medium">{ev.name}</span>
                          </div>
                        )}
                        <div className="px-3 py-2 text-[11px] text-[#6B7280] dark:text-[#8B93A1] border-t border-[#E5E7EB] dark:border-white/[0.06]">
                          <div className="truncate font-medium text-[#24272D] dark:text-[#D1D5DB]">
                            {ev.name}
                          </div>
                          {ev.note && <div className="mt-0.5 italic">{ev.note}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Checklist Summary */}
              {activeTask.checklist.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] mb-1.5">
                    Itens conferidos na execução
                  </h4>
                  <ul className="space-y-1 text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                    {activeTask.checklist.map((c) => (
                      <li key={c.id} className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 shrink-0 ${
                            c.checked ? 'text-[#15803D] dark:text-[#4ADE80]' : 'text-[#AEB0B3] dark:text-[#4B5563]'
                          }`}
                        />
                        <span>{c.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions when awaiting review */}
              {activeTask.status === 'aguardando_conferencia' && (
                <div className="pt-3 border-t border-[#E5E7EB] dark:border-white/[0.08] space-y-3">
                  {showReturnForm ? (
                    <div className="p-3 rounded-xl bg-[#FFF1F2] dark:bg-[#E1434F]/12 border border-[#FECDD3] dark:border-[#E1434F]/30 space-y-2">
                      <label className="block text-xs font-semibold text-[#B91F2C] dark:text-[#FCA5A5]">
                        Motivo da devolução (obrigatório)
                      </label>
                      <textarea
                        rows={2}
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        placeholder="Informe o ajuste necessário para o gerente da unidade..."
                        className="w-full p-2.5 text-xs rounded-lg bg-white dark:bg-[#0D1017] border border-[#E5E7EB] dark:border-white/[0.08] text-[#24272D] dark:text-[#F3F4F6] focus:outline-none focus:border-[#D52E3A] dark:focus:border-[#E1434F]"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowReturnForm(false)}
                          className="min-h-[36px] px-3 text-xs text-[#6B7280] dark:text-[#8B93A1]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={!returnReason.trim()}
                          onClick={handleReturn}
                          className="min-h-[36px] px-4 py-1.5 rounded-lg bg-[#D52E3A] text-white text-xs font-semibold disabled:opacity-40"
                        >
                          Confirmar devolução
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={approvalNote}
                        onChange={(e) => setApprovalNote(e.target.value)}
                        placeholder="Comentário opcional de aprovação..."
                        className="w-full min-h-[40px] px-3 py-2 text-xs rounded-lg bg-[#F7F8FA] dark:bg-[#0D1017] border border-[#E5E7EB] dark:border-white/[0.08] text-[#24272D] dark:text-[#F3F4F6] focus:outline-none focus:border-[#D52E3A] dark:focus:border-[#E1434F]"
                      />
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setShowReturnForm(true)}
                          className="flex-1 min-h-[42px] px-4 py-2 rounded-xl border border-[#FECDD3] dark:border-[#E1434F]/35 text-[#B91F2C] dark:text-[#FCA5A5] text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-[#FFF1F2] dark:hover:bg-[#E1434F]/10 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Devolver</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleApprove}
                          className="flex-1 min-h-[42px] px-4 py-2 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                          <span>Aprovar</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightboxUrl(null)}
          >
            <motion.img
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              src={lightboxUrl}
              alt="Evidência ampliada"
              className="max-w-full max-h-[85vh] rounded-xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
