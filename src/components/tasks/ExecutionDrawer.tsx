import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  Camera,
  Check,
  FileText,
  ImagePlus,
  Paperclip,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDueShort } from '../../utils/taskHelpers';

export const ExecutionDrawer: React.FC = () => {
  const {
    tasks,
    executionTaskId,
    closeExecution,
    toggleChecklistItem,
    addEvidence,
    removeEvidence,
    submitForReview,
    showToast,
  } = useApp();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingName, setUploadingName] = useState<string>('');
  const [executionNote, setExecutionNote] = useState('');

  const task = tasks.find((t) => t.id === executionTaskId);
  const checkedCount = task ? task.checklist.filter((c) => c.checked).length : 0;
  const allChecked = task
    ? task.checklist.length === 0 || checkedCount === task.checklist.length
    : false;
  const hasPhoto = task ? task.evidences.some((e) => e.type === 'image') : false;
  const canSubmit = task
    ? allChecked && (!task.requiresPhoto || task.evidences.length > 0)
    : false;

  const simulateUploadAndAttach = (
    name: string,
    type: 'image' | 'file',
    url: string,
    sizeLabel: string
  ) => {
    if (!task) return;
    setUploadingName(name);
    setUploadProgress(15);

    setTimeout(() => setUploadProgress(55), 160);
    setTimeout(() => setUploadProgress(88), 320);
    setTimeout(() => {
      addEvidence(task.id, {
        type,
        name,
        url,
        sizeLabel,
      });
      setUploadProgress(null);
      setUploadingName('');
    }, 520);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, forceType: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = forceType === 'image' || file.type.startsWith('image/');
    const sizeKB = Math.round(file.size / 1024);
    const sizeLabel = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${Math.max(12, sizeKB)} KB`;

    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        simulateUploadAndAttach(
          file.name,
          'image',
          typeof reader.result === 'string' ? reader.result : '',
          sizeLabel
        );
      };
      reader.readAsDataURL(file);
    } else {
      simulateUploadAndAttach(file.name, 'file', '', sizeLabel);
    }
    e.target.value = '';
  };

  const handleAttachSamplePhoto = () => {
    if (!task) return;
    const sampleUrl =
      task.category === 'Cadeia Fria'
        ? '/src/assets/images/evidence_termolabeis_1795463769532.jpg'
        : '/src/assets/images/evidence_gondola_1795463769349.jpg';
    const sampleName =
      task.category === 'Cadeia Fria'
        ? 'foto_visor_termolabeis.jpg'
        : 'foto_gondola_conferida.jpg';
    simulateUploadAndAttach(sampleName, 'image', sampleUrl, '1.5 MB');
  };

  const handleSubmit = () => {
    if (!task) return;
    if (!allChecked) {
      showToast('Conclua todos os itens do checklist antes de enviar.', 'warning');
      return;
    }
    if (task.requiresPhoto && task.evidences.length === 0) {
      showToast('Anexe ao menos uma foto de evidência para esta atividade.', 'warning');
      return;
    }
    submitForReview(task.id, executionNote);
  };

  return (
    <AnimatePresence>
      {task && (
        <motion.div
          key="execution-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="execution-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full sm:max-w-lg h-[92vh] sm:h-auto sm:max-h-[90vh] bg-white dark:bg-[#11141B] rounded-t-3xl sm:rounded-2xl border border-[#E5E7EB] dark:border-white/[0.08] flex flex-col overflow-hidden shadow-2xl"
          >
        {/* Grab handle on mobile */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-[#D1D5DB] dark:bg-white/20" />
        </div>

        {/* Header (Liquid Glass) */}
        <div className="px-4 sm:px-6 py-3 liquid-glass-bar flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="text-[11px] font-mono-num text-[#6B7280] dark:text-[#8B93A1]">
              {task.code} · {task.storeCode} · Prazo {formatDueShort(task.dueDate)}
            </div>
            <h2
              id="execution-title"
              className="text-sm sm:text-base font-semibold text-[#24272D] dark:text-[#F3F4F6] truncate"
            >
              Execução da atividade
            </h2>
          </div>
          <button
            type="button"
            onClick={closeExecution}
            aria-label="Fechar execução"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#6B7280] dark:text-[#8B93A1] hover:bg-[#F7F8FA] dark:hover:bg-white/[0.05]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-[#24272D] dark:text-[#F3F4F6]">
              {task.title}
            </h3>
            {task.status === 'devolvida' && task.returnReason && (
              <div className="mt-2.5 p-3 rounded-xl bg-[#FFF1F2] dark:bg-[#E1434F]/12 border border-[#FECDD3] dark:border-[#E1434F]/30 text-xs text-[#B91F2C] dark:text-[#FCA5A5] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Ajuste solicitado: {task.returnReason}</span>
              </div>
            )}
          </div>

          {/* Interactive Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6]">
                1. Etapas de verificação
              </span>
              <span className="text-xs font-mono-num text-[#6B7280] dark:text-[#8B93A1]">
                {checkedCount}/{task.checklist.length} concluídas
              </span>
            </div>
            <div className="divide-y divide-[#E5E7EB] dark:divide-white/[0.06] border border-[#E5E7EB] dark:border-white/[0.08] rounded-xl overflow-hidden">
              {task.checklist.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleChecklistItem(task.id, item.id)}
                  className="w-full min-h-[46px] px-3.5 py-2.5 flex items-center gap-3 text-left bg-white dark:bg-[#11141B] hover:bg-[#F7F8FA] dark:hover:bg-white/[0.03] transition-colors"
                >
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                      item.checked
                        ? 'bg-[#D52E3A] border-[#D52E3A] text-white'
                        : 'border-[#D1D5DB] dark:border-white/20'
                    }`}
                  >
                    {item.checked && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                  </span>
                  <span
                    className={`text-xs leading-snug ${
                      item.checked
                        ? 'text-[#24272D] dark:text-[#F3F4F6] font-medium'
                        : 'text-[#4B5563] dark:text-[#9CA3AF]'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Evidence Capture & Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6]">
                2. Evidências {task.requiresPhoto ? '(obrigatório)' : '(opcional)'}
              </span>
              {task.requiresPhoto && !hasPhoto && (
                <span className="text-[11px] font-medium text-[#B91F2C] dark:text-[#FCA5A5]">
                  Foto necessária
                </span>
              )}
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileChange(e, 'image')}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e, 'file')}
              className="hidden"
            />

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="min-h-[48px] px-3 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] bg-[#F7F8FA] dark:bg-[#171B24] hover:border-[#D52E3A] dark:hover:border-[#E1434F] text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] flex items-center justify-center gap-2 transition-colors"
              >
                <Camera className="w-4 h-4 text-[#D52E3A] dark:text-[#E1434F]" aria-hidden="true" />
                <span>Tirar foto</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[48px] px-3 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] bg-[#F7F8FA] dark:bg-[#171B24] hover:border-[#D52E3A] dark:hover:border-[#E1434F] text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] flex items-center justify-center gap-2 transition-colors"
              >
                <Paperclip className="w-4 h-4 text-[#6B7280] dark:text-[#8B93A1]" aria-hidden="true" />
                <span>Anexar arquivo</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleAttachSamplePhoto}
              className="mt-2 w-full min-h-[38px] px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#D52E3A] dark:hover:text-[#FCA5A5] hover:bg-[#FFF1F2]/60 dark:hover:bg-[#E1434F]/10 flex items-center justify-center gap-1.5 transition-colors"
            >
              <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Usar foto de inspeção de loja (demonstração rápida)</span>
            </button>

            {/* Upload Progress Bar */}
            {uploadProgress !== null && (
              <div className="mt-3 p-3 rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] bg-[#F7F8FA] dark:bg-[#171B24]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="truncate font-medium text-[#24272D] dark:text-[#F3F4F6]">
                    Enviando {uploadingName}...
                  </span>
                  <span className="font-mono-num text-[#D52E3A] dark:text-[#FCA5A5] font-semibold">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#E5E7EB] dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#D52E3A] transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Attached List */}
            {task.evidences.length > 0 && (
              <div className="mt-3 space-y-2">
                {task.evidences.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2.5 rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] flex items-center justify-between gap-3 bg-white dark:bg-[#0D1017]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {ev.type === 'image' && ev.url ? (
                        <img
                          src={ev.url}
                          alt={ev.name}
                          className="w-11 h-11 rounded-lg object-cover shrink-0 border border-[#E5E7EB] dark:border-white/[0.08]"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-[#FFF1F2] dark:bg-[#E1434F]/15 flex items-center justify-center text-[#D52E3A] dark:text-[#FCA5A5] shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-[#24272D] dark:text-[#F3F4F6] truncate">
                          {ev.name}
                        </div>
                        <div className="text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
                          {ev.sizeLabel} · {ev.uploadedAt}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEvidence(task.id, ev.id)}
                      aria-label={`Remover ${ev.name}`}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[#6B7280] dark:text-[#8B93A1] hover:text-[#B91F2C] dark:hover:text-[#FCA5A5] hover:bg-[#FFF1F2] dark:hover:bg-[#E1434F]/15"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Note */}
          <div>
            <label
              htmlFor="exec-note"
              className="block text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] mb-1.5"
            >
              3. Observação para conferência (opcional)
            </label>
            <textarea
              id="exec-note"
              rows={2}
              value={executionNote}
              onChange={(e) => setExecutionNote(e.target.value)}
              placeholder="Ex.: Leitura conferida às 11h40, tudo conforme padrão."
              className="w-full p-3 text-xs rounded-xl bg-[#F7F8FA] dark:bg-[#0D1017] border border-[#E5E7EB] dark:border-white/[0.08] text-[#24272D] dark:text-[#F3F4F6] focus:outline-none focus:border-[#D52E3A] dark:focus:border-[#E1434F]"
            />
          </div>
        </div>

        {/* Bottom Submit CTA */}
        <div className="px-4 sm:px-6 py-3 pb-safe border-t border-[#E5E7EB] dark:border-white/[0.08] bg-white dark:bg-[#0E1117]/95 dark:backdrop-blur-md flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={closeExecution}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] text-xs font-semibold text-[#4B5563] dark:text-[#D1D5DB] hover:bg-[#F7F8FA] dark:hover:bg-white/[0.04]"
          >
            Salvar rascunho
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`flex-1 min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              canSubmit
                ? 'bg-[#D52E3A] hover:bg-[#B91F2C] text-white'
                : 'bg-[#E5E7EB] dark:bg-[#1F2531] text-[#6B7280] dark:text-[#8B93A1]'
            }`}
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>Enviar para conferência</span>
          </button>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
