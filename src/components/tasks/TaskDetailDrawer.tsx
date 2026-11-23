import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Edit3,
  FileText,
  History,
  MessageSquare,
  Play,
  Send,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDueShort, isTaskOverdue } from '../../utils/taskHelpers';
import { PriorityLabel, StatusLabel } from '../ui/Primitives';

export const TaskDetailDrawer: React.FC = () => {
  const {
    tasks,
    selectedTaskId,
    closeTaskDetail,
    openExecution,
    openEditTaskModal,
    startTask,
    addComment,
    approveTask,
    returnTask,
    capabilities,
    currentUser,
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [returnMode, setReturnMode] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  const task = tasks.find((t) => t.id === selectedTaskId);
  const overdue = task ? isTaskOverdue(task) : false;
  const checkedCount = task ? task.checklist.filter((c) => c.checked).length : 0;
  const canExecute = task
    ? task.status === 'pendente' ||
      task.status === 'em_andamento' ||
      task.status === 'devolvida'
    : false;
  const canReviewThis = task
    ? capabilities.canReviewTasks &&
      task.status === 'aguardando_conferencia' &&
      (currentUser.role !== 'gerente' || task.storeId === currentUser.storeId)
    : false;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !commentText.trim()) return;
    addComment(task.id, commentText);
    setCommentText('');
  };

  const handleReturnSubmit = () => {
    if (!task || !returnReason.trim()) return;
    returnTask(task.id, returnReason);
    setReturnReason('');
    setReturnMode(false);
    closeTaskDetail();
  };

  return (
    <AnimatePresence>
      {task && (
        <motion.div
          key="task-detail-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-40 flex justify-end bg-black/45 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-detail-title"
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl bg-white dark:bg-[#11141B] h-full flex flex-col border-l border-[#E5E7EB] dark:border-white/[0.08] shadow-2xl"
          >
        {/* Top Bar (Liquid Glass) */}
        <div className="px-4 sm:px-6 h-14 liquid-glass-bar flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#8B93A1]">
            <span className="font-mono-num font-semibold text-[#24272D] dark:text-[#F3F4F6]">
              {task.code}
            </span>
            <span aria-hidden="true">·</span>
            <span>{task.category}</span>
          </div>
          <div className="flex items-center gap-1">
            {capabilities.canEditTasks && task.status !== 'aprovada' && (
              <button
                type="button"
                onClick={() => openEditTaskModal(task)}
                className="min-h-[40px] px-2.5 flex items-center gap-1.5 rounded-lg text-xs font-medium text-[#4B5563] dark:text-[#9CA3AF] hover:bg-[#F7F8FA] dark:hover:bg-white/[0.05]"
              >
                <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Editar</span>
              </button>
            )}
            <button
              type="button"
              onClick={closeTaskDetail}
              aria-label="Fechar detalhes da tarefa"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#6B7280] dark:text-[#8B93A1] hover:bg-[#F7F8FA] dark:hover:bg-white/[0.05]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-6">
          {/* Header Block */}
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
              <StatusLabel status={task.status} overdue={overdue} />
              <span className="text-[#D1D5DB] dark:text-white/20" aria-hidden="true">·</span>
              <PriorityLabel priority={task.priority} />
            </div>
            <h2
              id="task-detail-title"
              className="text-lg font-semibold text-[#24272D] dark:text-[#F3F4F6] leading-snug"
            >
              {task.title}
            </h2>
            <p className="mt-2 text-xs sm:text-[13px] text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed">
              {task.description}
            </p>
          </div>

          {/* Return reason callout (if returned) */}
          {task.status === 'devolvida' && task.returnReason && (
            <div className="p-3.5 rounded-xl bg-[#FFF1F2] dark:bg-[#E1434F]/12 border border-[#FECDD3] dark:border-[#E1434F]/30">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#B91F2C] dark:text-[#FCA5A5]">
                <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Devolvida para correção</span>
              </div>
              <p className="mt-1 text-xs text-[#24272D] dark:text-[#F3F4F6] leading-relaxed">
                {task.returnReason}
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 py-3.5 border-y border-[#E5E7EB] dark:border-white/[0.08] text-xs">
            <div>
              <div className="text-[#6B7280] dark:text-[#8B93A1]">Unidade</div>
              <div className="mt-0.5 font-medium text-[#24272D] dark:text-[#F3F4F6]">
                {task.storeCode} · {task.storeName}
              </div>
            </div>
            <div>
              <div className="text-[#6B7280] dark:text-[#8B93A1]">Responsável</div>
              <div className="mt-0.5 font-medium text-[#24272D] dark:text-[#F3F4F6]">
                {task.assigneeName}
              </div>
            </div>
            <div>
              <div className="text-[#6B7280] dark:text-[#8B93A1]">Prazo limite</div>
              <div
                className={`mt-0.5 font-mono-num font-medium ${
                  overdue ? 'text-[#B91F2C] dark:text-[#F87171]' : 'text-[#24272D] dark:text-[#F3F4F6]'
                }`}
              >
                {formatDueShort(task.dueDate)}
              </div>
            </div>
            <div>
              <div className="text-[#6B7280] dark:text-[#8B93A1]">Solicitante</div>
              <div className="mt-0.5 font-medium text-[#24272D] dark:text-[#F3F4F6]">
                {task.creatorName}
              </div>
            </div>
          </div>

          {/* Instructions & Checklist */}
          {task.instructions.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] mb-2">
                Instruções operacionais
              </h3>
              <ol className="space-y-1.5 text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                {task.instructions.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-mono-num text-[#D52E3A] dark:text-[#E1434F] font-semibold">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {task.checklist.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6]">
                  Checklist de verificação
                </h3>
                <span className="text-xs font-mono-num text-[#6B7280] dark:text-[#8B93A1]">
                  {checkedCount}/{task.checklist.length}
                </span>
              </div>
              <div className="divide-y divide-[#E5E7EB] dark:divide-white/[0.06] border border-[#E5E7EB] dark:border-white/[0.08] rounded-xl overflow-hidden">
                {task.checklist.map((item) => (
                  <div
                    key={item.id}
                    className="px-3.5 py-2.5 flex items-center gap-2.5 text-xs bg-[#F7F8FA]/60 dark:bg-[#171B24]/70"
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        item.checked
                          ? 'text-[#15803D] dark:text-[#4ADE80]'
                          : 'text-[#AEB0B3] dark:text-[#4B5563]'
                      }`}
                      aria-hidden="true"
                    />
                    <span
                      className={
                        item.checked
                          ? 'text-[#24272D] dark:text-[#F3F4F6]'
                          : 'text-[#6B7280] dark:text-[#8B93A1]'
                      }
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidences */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6]">
                Evidências anexadas ({task.evidences.length})
              </h3>
              {task.requiresPhoto && (
                <span className="text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
                  Foto obrigatória
                </span>
              )}
            </div>

            {task.evidences.length === 0 ? (
              <div className="py-5 px-4 rounded-xl border border-dashed border-[#D1D5DB] dark:border-white/15 text-center text-xs text-[#6B7280] dark:text-[#8B93A1]">
                Nenhuma evidência anexada até o momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {task.evidences.map((ev) => (
                  <div
                    key={ev.id}
                    className="border border-[#E5E7EB] dark:border-white/[0.08] rounded-xl overflow-hidden bg-[#F7F8FA] dark:bg-[#171B24]"
                  >
                    {ev.type === 'image' && ev.url ? (
                      <button
                        type="button"
                        onClick={() => setZoomImageUrl(ev.url)}
                        className="w-full block aspect-[4/3] bg-[#E5E7EB] dark:bg-[#0D1017] overflow-hidden"
                      >
                        <img
                          src={ev.url}
                          alt={ev.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover hover:scale-[1.02] transition-transform"
                        />
                      </button>
                    ) : (
                      <div className="p-3.5 flex items-center gap-2.5 text-xs text-[#24272D] dark:text-[#F3F4F6]">
                        <FileText className="w-5 h-5 text-[#D52E3A] dark:text-[#E1434F] shrink-0" />
                        <span className="truncate font-medium">{ev.name}</span>
                      </div>
                    )}
                    <div className="px-3 py-2 text-[11px] text-[#6B7280] dark:text-[#8B93A1] border-t border-[#E5E7EB] dark:border-white/[0.06]">
                      <div className="truncate font-medium text-[#24272D] dark:text-[#D1D5DB]">
                        {ev.name}
                      </div>
                      <div className="mt-0.5">
                        {ev.uploadedBy} · {ev.uploadedAt} · {ev.sizeLabel}
                      </div>
                      {ev.note && <div className="mt-1 italic">{ev.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div>
            <h3 className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] flex items-center gap-1.5 mb-2.5">
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Comentários ({task.comments.length})</span>
            </h3>
            <div className="space-y-2.5 mb-3">
              {task.comments.length === 0 ? (
                <p className="text-xs text-[#6B7280] dark:text-[#8B93A1]">
                  Sem comentários registrados nesta atividade.
                </p>
              ) : (
                task.comments.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-xl text-xs border ${
                      c.kind === 'return_reason'
                        ? 'bg-[#FFF1F2] dark:bg-[#E1434F]/[0.1] border-[#FECDD3] dark:border-[#E1434F]/30'
                        : 'bg-[#F7F8FA] dark:bg-[#171B24] border-[#E5E7EB] dark:border-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#24272D] dark:text-[#F3F4F6]">
                        {c.authorName} · {c.authorRole}
                      </span>
                      <span className="text-[11px] text-[#6B7280] dark:text-[#8B93A1] font-mono-num">
                        {c.createdAt}
                      </span>
                    </div>
                    <p className="mt-1 text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
                      {c.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Adicionar observação operacional..."
                className="flex-1 min-h-[40px] px-3 py-2 text-xs rounded-lg bg-[#F7F8FA] dark:bg-[#0D1017] border border-[#E5E7EB] dark:border-white/[0.08] text-[#24272D] dark:text-[#F3F4F6] focus:outline-none focus:border-[#D52E3A] dark:focus:border-[#E1434F]"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                aria-label="Enviar comentário"
                className="min-h-[40px] min-w-[40px] px-3 flex items-center justify-center rounded-lg bg-[#24272D] dark:bg-[#F3F4F6] text-white dark:text-[#090B0F] disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Audit History */}
          <div>
            <h3 className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] flex items-center gap-1.5 mb-2">
              <History className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Histórico de eventos</span>
            </h3>
            <div className="space-y-2 border-l border-[#E5E7EB] dark:border-white/[0.1] ml-1.5 pl-3">
              {task.history.map((h) => (
                <div key={h.id} className="text-xs">
                  <div className="text-[#24272D] dark:text-[#F3F4F6] font-medium">{h.action}</div>
                  <div className="text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
                    {h.actorName} · <span className="font-mono-num">{h.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Return reason inline box when reviewing */}
          {returnMode && (
            <div className="p-3.5 rounded-xl border border-[#FECDD3] dark:border-[#E1434F]/35 bg-[#FFF1F2] dark:bg-[#E1434F]/10 space-y-2.5">
              <label className="block text-xs font-semibold text-[#B91F2C] dark:text-[#FCA5A5]">
                Motivo da devolução para o responsável
              </label>
              <textarea
                rows={3}
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Descreva o que precisa ser corrigido (ex.: foto desfocada, etiqueta desatualizada)..."
                className="w-full p-2.5 text-xs rounded-lg bg-white dark:bg-[#0D1017] border border-[#E5E7EB] dark:border-white/[0.08] text-[#24272D] dark:text-[#F3F4F6] focus:outline-none focus:border-[#D52E3A] dark:focus:border-[#E1434F]"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReturnMode(false)}
                  className="min-h-[36px] px-3 py-1.5 text-xs font-medium text-[#6B7280] dark:text-[#8B93A1]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!returnReason.trim()}
                  onClick={handleReturnSubmit}
                  className="min-h-[36px] px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#D52E3A] text-white disabled:opacity-40"
                >
                  Confirmar devolução
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Action Bar */}
        {(canExecute || canReviewThis) && !returnMode && (
          <div className="px-4 sm:px-6 py-3 pb-safe border-t border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0E1117]/95 dark:backdrop-blur-md flex items-center justify-end gap-2.5 shrink-0">
            {canExecute && (
              <>
                {task.status === 'pendente' && (
                  <button
                    type="button"
                    onClick={() => {
                      startTask(task.id);
                      closeTaskDetail();
                      openExecution(task.id);
                    }}
                    className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-[#D52E3A] hover:bg-[#B91F2C] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Play className="w-4 h-4" aria-hidden="true" />
                    <span>Iniciar execução</span>
                  </button>
                )}
                {(task.status === 'em_andamento' || task.status === 'devolvida') && (
                  <button
                    type="button"
                    onClick={() => {
                      closeTaskDetail();
                      openExecution(task.id);
                    }}
                    className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-[#D52E3A] hover:bg-[#B91F2C] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Camera className="w-4 h-4" aria-hidden="true" />
                    <span>
                      {task.status === 'devolvida' ? 'Corrigir e reenviar' : 'Continuar execução'}
                    </span>
                  </button>
                )}
              </>
            )}

            {canReviewThis && (
              <>
                <button
                  type="button"
                  onClick={() => setReturnMode(true)}
                  className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2.5 rounded-xl border border-[#FECDD3] dark:border-[#D52E3A]/40 text-[#B91F2C] dark:text-[#FCA5A5] text-xs font-semibold hover:bg-[#FFF1F2] dark:hover:bg-[#D52E3A]/15 transition-colors"
                >
                  Devolver
                </button>
                <button
                  type="button"
                  onClick={() => {
                    approveTask(task.id);
                    closeTaskDetail();
                  }}
                  className="flex-1 sm:flex-initial min-h-[44px] px-5 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <ClipboardCheck className="w-4 h-4" aria-hidden="true" />
                  <span>Aprovar conferência</span>
                </button>
              </>
            )}
          </div>
        )}
          </motion.div>

          {/* Lightbox Zoom */}
          {zoomImageUrl && (
            <div
              className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
              onClick={() => setZoomImageUrl(null)}
            >
              <button
                type="button"
                onClick={() => setZoomImageUrl(null)}
                aria-label="Fechar ampliação"
                className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/15 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={zoomImageUrl}
                alt="Evidência ampliada"
                className="max-w-full max-h-[85vh] rounded-xl object-contain"
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
