import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskCategory, TaskPriority } from '../../types/operations';

const CATEGORIES: TaskCategory[] = [
  'Cadeia Fria',
  'Controle Sanitário',
  'Precificação',
  'Dermocosméticos',
  'Caixa e Cofre',
  'Validade e PVPS',
  'Boas Práticas',
];

export const TaskFormModal: React.FC = () => {
  const {
    isTaskModalOpen,
    editingTask,
    closeTaskModal,
    createTask,
    updateTask,
    stores,
    users,
    currentUser,
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Precificação');
  const [storeId, setStoreId] = useState('st-04');
  const [assigneeId, setAssigneeId] = useState('usr-ger');
  const [priority, setPriority] = useState<TaskPriority>('media');
  const [dueDate, setDueDate] = useState('2026-11-23T18:00');
  const [requiresPhoto, setRequiresPhoto] = useState(true);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [checklistLabels, setChecklistLabels] = useState<string[]>([
    'Conferência visual realizada conforme padrão Minas Mais',
  ]);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setCategory(editingTask.category);
      setStoreId(editingTask.storeId);
      setAssigneeId(editingTask.assigneeId);
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate.slice(0, 16));
      setRequiresPhoto(editingTask.requiresPhoto);
      setInstructions(editingTask.instructions.length ? editingTask.instructions : ['']);
      setChecklistLabels(
        editingTask.checklist.length ? editingTask.checklist.map((c) => c.label) : ['']
      );
    } else {
      setTitle('');
      setDescription('');
      setCategory('Precificação');
      setStoreId(currentUser.storeId || 'st-04');
      setAssigneeId('usr-ger');
      setPriority('media');
      setDueDate('2026-11-23T18:00');
      setRequiresPhoto(true);
      setInstructions(['Conferir item no ponto de venda e registrar observações.']);
      setChecklistLabels([
        'Padrão operacional verificado',
        'Registro realizado sem divergências',
      ]);
    }
  }, [editingTask, isTaskModalOpen, currentUser.storeId]);

  const isStoreLocked = currentUser.role === 'gerente' && !!currentUser.storeId;
  const assignableUsers = users.filter((u) => u.active && u.role !== 'admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title,
      description: description || 'Atividade operacional atribuída pelo painel Minas Mais Executa.',
      category,
      storeId,
      assigneeId,
      priority,
      dueDate: dueDate.length === 16 ? `${dueDate}:00` : dueDate,
      requiresPhoto,
      instructions,
      checklistLabels,
    };

    if (editingTask) {
      updateTask(editingTask.id, payload);
    } else {
      createTask(payload);
    }
  };

  return (
    <AnimatePresence>
      {isTaskModalOpen && (
        <motion.div
          key="task-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-modal-title"
        >
          <motion.form
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSubmit}
            className="w-full sm:max-w-lg h-[92vh] sm:h-auto sm:max-h-[90vh] bg-white dark:bg-[#11141B] rounded-t-3xl sm:rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] flex flex-col overflow-hidden shadow-2xl"
          >
        <div className="px-5 py-3.5 liquid-glass-bar flex items-center justify-between">
          <h2 id="task-modal-title" className="text-sm sm:text-base font-semibold text-[#24272D] dark:text-[#F3F4F6]">
            {editingTask ? `Editar tarefa ${editingTask.code}` : 'Nova tarefa operacional'}
          </h2>
          <button
            type="button"
            onClick={closeTaskModal}
            aria-label="Fechar modal"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#6B7280] dark:text-[#8B93A1] hover:bg-[#F7F8FA] dark:hover:bg-white/[0.05]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#24272D] dark:text-[#F3F4F6] mb-1">
              Título da atividade *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Reposição e precificação — Ponta de gôndola vitaminas"
              className="w-full min-h-[42px] px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0D1017] border border-[#E5E7EB] dark:border-white/[0.08] text-[#24272D] dark:text-[#F3F4F6] focus:outline-none focus:border-[#D52E3A] dark:focus:border-[#E1434F]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#24272D] dark:text-[#F3F4F6] mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full min-h-[42px] px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0D1017] border border-[#E5E7EB] dark:border-white/[0.08] text-[#24272D] dark:text-[#F3F4F6]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#24272D] dark:text-[#F3F4F6] mb-1">
                Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full min-h-[42px] px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0D1017] border border-[#E5E7EB] dark:border-white/[0.08] text-[#24272D] dark:text-[#F3F4F6]"
              >
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#24272D] dark:text-[#F3F4F6] mb-1">
                Loja / Unidade
              </label>
              <select
                value={storeId}
                disabled={isStoreLocked}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0D1017] border border-[#E5E7EB] dark:border-white/[0.08] text-[#24272D] dark:text-[#F3F4F6] disabled:opacity-65"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name.split(' — ')[0]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#24272D] dark:text-[#F3F4F6] mb-1">
                Responsável
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0D1017] border border-[#E5E7EB] dark:border-white/[0.08] text-[#24272D] dark:text-[#F3F4F6]"
              >
                {assignableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.roleLabel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#24272D] dark:text-[#F3F4F6] mb-1">
              Prazo limite
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0D1017] border border-[#E5E7EB] dark:border-white/[0.08] text-[#24272D] dark:text-[#F3F4F6] font-mono-num"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#24272D] dark:text-[#F3F4F6] mb-1">
              Descrição operacional
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhe o objetivo e o critério de aceitação na conferência..."
              className="w-full p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#0D1017] border border-[#E5E7EB] dark:border-white/[0.08] text-[#24272D] dark:text-[#F3F4F6] focus:outline-none focus:border-[#D52E3A] dark:focus:border-[#E1434F]"
            />
          </div>

          <label className="flex items-center gap-2.5 py-1 cursor-pointer">
            <input
              type="checkbox"
              checked={requiresPhoto}
              onChange={(e) => setRequiresPhoto(e.target.checked)}
              className="w-4 h-4 accent-[#D52E3A] rounded"
            />
            <span className="font-medium text-[#24272D] dark:text-[#F3F4F6]">
              Exigir foto ou evidência anexada para enviar à conferência
            </span>
          </label>

          {!editingTask && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-[#24272D] dark:text-[#F3F4F6]">
                  Itens do checklist
                </label>
                <button
                  type="button"
                  onClick={() => setChecklistLabels((prev) => [...prev, ''])}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D52E3A] dark:text-[#FCA5A5]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar item</span>
                </button>
              </div>
              <div className="space-y-2">
                {checklistLabels.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) =>
                        setChecklistLabels((prev) =>
                          prev.map((v, i) => (i === idx ? e.target.value : v))
                        )
                      }
                      placeholder={`Item ${idx + 1}`}
                      className="flex-1 min-h-[38px] px-3 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#0D1017] border border-[#E5E7EB] dark:border-white/[0.08] text-[#24272D] dark:text-[#F3F4F6] focus:outline-none focus:border-[#D52E3A] dark:focus:border-[#E1434F]"
                    />
                    {checklistLabels.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setChecklistLabels((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="min-h-[38px] min-w-[38px] flex items-center justify-center text-[#6B7280] dark:text-[#8B93A1] hover:text-[#B91F2C] dark:hover:text-[#FCA5A5]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3 pb-safe border-t border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0E1117]/95 dark:backdrop-blur-md flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeTaskModal}
            className="min-h-[42px] px-4 py-2 rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] text-xs font-semibold text-[#4B5563] dark:text-[#D1D5DB] hover:bg-[#F7F8FA] dark:hover:bg-white/[0.04]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="min-h-[42px] px-5 py-2 rounded-xl bg-[#D52E3A] hover:bg-[#B91F2C] text-white text-xs font-semibold"
          >
            {editingTask ? 'Salvar alterações' : 'Criar e atribuir'}
          </button>
        </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
