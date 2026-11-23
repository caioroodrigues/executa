import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Inbox,
  PlayCircle,
  RefreshCw,
  RotateCcw,
  Share,
  X,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { TaskPriority, TaskStatus } from '../../types/operations';
import { PRIORITY_META, STATUS_META } from '../../utils/taskHelpers';

export const Avatar: React.FC<{
  src?: string;
  initials: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ src, initials, name, size = 'md' }) => {
  const [imgFailed, setImgFailed] = useState(false);

  const dims =
    size === 'sm'
      ? 'w-7 h-7 text-[11px]'
      : size === 'lg'
        ? 'w-12 h-12 text-sm'
        : 'w-9 h-9 text-xs';

  if (src && !imgFailed) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className={`${dims} rounded-full object-cover shrink-0 border border-[#E5E7EB] dark:border-white/[0.12]`}
      />
    );
  }

  return (
    <div
      aria-label={name}
      className={`${dims} rounded-full shrink-0 flex items-center justify-center font-semibold bg-[#FFF1F2] text-[#B91F2C] dark:bg-[#E1434F]/18 dark:text-[#FCA5A5] border border-[#FBCFE8]/50 dark:border-[#E1434F]/30`}
    >
      {initials}
    </div>
  );
};

export const StatusLabel: React.FC<{ status: TaskStatus; overdue?: boolean }> = ({
  status,
  overdue,
}) => {
  if (overdue && status !== 'aprovada' && status !== 'aguardando_conferencia') {
    return (
      <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-[#B91F2C] dark:text-[#F87171] whitespace-nowrap shrink-0">
        <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" aria-hidden="true" />
        <span>Atrasada</span>
      </span>
    );
  }

  const meta = STATUS_META[status];
  const Icon =
    status === 'aprovada'
      ? CheckCircle2
      : status === 'aguardando_conferencia'
        ? Clock
        : status === 'em_andamento'
          ? PlayCircle
          : status === 'devolvida'
            ? RotateCcw
            : Clock;

  return (
    <span className={`inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-medium whitespace-nowrap shrink-0 ${meta.colorClass}`}>
      <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" aria-hidden="true" />
      <span>{meta.shortLabel}</span>
    </span>
  );
};

export const PriorityLabel: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  const meta = PRIORITY_META[priority];
  return (
    <span className={`text-[11px] sm:text-xs font-medium whitespace-nowrap shrink-0 ${meta.colorClass}`}>
      Prioridade {meta.label}
    </span>
  );
};

export const TaskListSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="divide-y divide-[#E5E7EB] dark:divide-white/[0.06] liquid-glass-list rounded-2xl overflow-hidden">
    {Array.from({ length: rows }).map((_, idx) => (
      <div key={idx} className="px-3 py-2.5 sm:p-4 animate-pulse space-y-1.5 sm:space-y-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="h-3.5 sm:h-4 w-2/3 bg-[#E5E7EB] dark:bg-white/[0.08] rounded" />
          <div className="h-3 w-16 sm:w-20 bg-[#E5E7EB] dark:bg-white/[0.08] rounded" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-2.5 sm:h-3 w-16 sm:w-24 bg-[#F3F4F6] dark:bg-white/[0.05] rounded" />
          <div className="h-2.5 sm:h-3 w-20 sm:w-28 bg-[#F3F4F6] dark:bg-white/[0.05] rounded" />
        </div>
      </div>
    ))}
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl">
    <div className="w-11 h-11 rounded-full bg-[#F7F8FA] dark:bg-[#171B24] border border-transparent dark:border-white/[0.06] flex items-center justify-center text-[#6B7280] dark:text-[#8B93A1] mb-3">
      <Inbox className="w-5 h-5" aria-hidden="true" />
    </div>
    <h3 className="text-sm font-semibold text-[#24272D] dark:text-[#F3F4F6]">{title}</h3>
    <p className="mt-1 text-xs text-[#6B7280] dark:text-[#8B93A1] max-w-sm leading-relaxed">
      {description}
    </p>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="mt-4 min-h-[40px] px-4 py-2 text-xs font-semibold rounded-lg bg-[#D52E3A] hover:bg-[#B91F2C] text-white transition-colors"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry: () => void;
}> = ({ title = 'Não foi possível carregar os dados', message, onRetry }) => (
  <div className="flex flex-col items-center justify-center text-center py-10 px-6 bg-white dark:bg-[#11141B] border border-[#FECACA] dark:border-[#E1434F]/35 rounded-2xl">
    <div className="w-10 h-10 rounded-full bg-[#FFF1F2] dark:bg-[#E1434F]/15 flex items-center justify-center text-[#B91F2C] dark:text-[#F87171] mb-3">
      <AlertCircle className="w-5 h-5" aria-hidden="true" />
    </div>
    <h3 className="text-sm font-semibold text-[#24272D] dark:text-[#F3F4F6]">{title}</h3>
    <p className="mt-1 text-xs text-[#6B7280] dark:text-[#8B93A1] max-w-sm">{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="mt-4 inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-xs font-semibold rounded-lg bg-[#D52E3A] hover:bg-[#B91F2C] text-white transition-colors"
    >
      <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
      <span>Tentar novamente</span>
    </button>
  </div>
);

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`inline-flex items-center justify-center gap-2 font-semibold rounded-lg bg-[#D52E3A] hover:bg-[#B91F2C] text-white transition-colors whitespace-nowrap shrink-0 ${
          compact ? 'min-h-[36px] px-3 py-1.5 text-xs' : 'min-h-[42px] px-4 py-2 text-xs w-full'
        }`}
      >
        <Download className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Instalar App</span>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowGuide(true)}
        className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg border border-[#E5E7EB] dark:border-white/[0.08] text-[#24272D] dark:text-[#F3F4F6] hover:bg-[#F7F8FA] dark:hover:bg-white/[0.04] transition-colors whitespace-nowrap shrink-0 ${
          compact ? 'min-h-[36px] px-3 py-1.5 text-xs' : 'min-h-[42px] px-4 py-2 text-xs w-full'
        }`}
      >
        <Download className="w-3.5 h-3.5 shrink-0 text-[#D52E3A] dark:text-[#E1434F]" aria-hidden="true" />
        <span>{isIOS ? 'Instalar no iPhone' : 'Instalar PWA'}</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-guide-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 id="pwa-guide-title" className="text-base font-semibold text-[#24272D] dark:text-[#F3F4F6]">
                  Instalar Minas Mais Executa
                </h3>
                <p className="mt-1 text-xs text-[#6B7280] dark:text-[#8B93A1]">
                  Acesse em tela cheia, com cache offline e atalho na tela inicial.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Fechar instruções"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#6B7280] dark:text-[#8B93A1] hover:bg-[#F7F8FA] dark:hover:bg-white/[0.05]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <ol className="mt-4 space-y-2.5 text-xs text-[#24272D] dark:text-[#D1D5DB]">
                <li className="flex items-start gap-2">
                  <span className="font-mono-num font-semibold text-[#D52E3A] dark:text-[#E1434F]">1.</span>
                  <span>
                    Toque no botão <strong className="inline-flex items-center gap-1"><Share className="w-3 h-3" /> Compartilhar</strong> na barra do Safari.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono-num font-semibold text-[#D52E3A] dark:text-[#E1434F]">2.</span>
                  <span>Role as opções e toque em <strong>Adicionar à Tela de Início</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono-num font-semibold text-[#D52E3A] dark:text-[#E1434F]">3.</span>
                  <span>Confirme em <strong>Adicionar</strong> para abrir como aplicativo nativo.</span>
                </li>
              </ol>
            ) : (
              <ol className="mt-4 space-y-2.5 text-xs text-[#24272D] dark:text-[#D1D5DB]">
                <li className="flex items-start gap-2">
                  <span className="font-mono-num font-semibold text-[#D52E3A] dark:text-[#E1434F]">1.</span>
                  <span>No Chrome ou Edge, clique no ícone de instalação na barra de endereço ou no menu do navegador.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono-num font-semibold text-[#D52E3A] dark:text-[#E1434F]">2.</span>
                  <span>Selecione <strong>Instalar Minas Mais Executa</strong> para habilitar o uso em janela dedicada.</span>
                </li>
              </ol>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full min-h-[42px] rounded-lg bg-[#24272D] dark:bg-[#F3F4F6] text-white dark:text-[#090B0F] text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};
