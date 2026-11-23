import React, { useState } from 'react';
import {
  BarChart3,
  Building2,
  ChevronRight,
  HelpCircle,
  Moon,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sun,
  Trophy,
  WifiOff,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types/operations';
import { Avatar, PWAInstallButton } from '../ui/Primitives';

const ROLES: { role: UserRole; label: string; desc: string }[] = [
  { role: 'admin', label: 'Administrador', desc: 'Acesso total, usuários e parâmetros' },
  { role: 'supervisor', label: 'Supervisor', desc: 'Abre tarefas, confere e acompanha' },
  { role: 'gerente', label: 'Gerente', desc: 'Cumpre tarefas designadas MM-04' },
];

export const ProfileScreen: React.FC = () => {
  const {
    currentUser,
    switchRole,
    theme,
    toggleTheme,
    simulatedOffline,
    setSimulatedOffline,
    simulateLoadError,
    setSimulateLoadError,
    resetDemoData,
    navigate,
    capabilities,
  } = useApp();

  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Account Card */}
      <div className="liquid-glass-surface rounded-2xl p-4 sm:p-5 flex items-center gap-4">
        <Avatar
          src={currentUser.avatarUrl}
          initials={currentUser.initials}
          name={currentUser.name}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-[#24272D] dark:text-[#F3F4F6] truncate">
            {currentUser.name}
          </h2>
          <div className="text-xs text-[#D52E3A] dark:text-[#FCA5A5] font-semibold mt-0.5">
            {currentUser.roleLabel} · {currentUser.jobTitle}
          </div>
          <div className="text-xs text-[#6B7280] dark:text-[#8B93A1] mt-1 truncate">
            {currentUser.storeName} · {currentUser.email}
          </div>
        </div>
      </div>

      {/* Quick Mobile / Tablet Destinations */}
      <div className="bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl divide-y divide-[#E5E7EB] dark:divide-white/[0.06] overflow-hidden lg:hidden">
        <button
          type="button"
          onClick={() => navigate('championship')}
          className="w-full min-h-[48px] px-4 py-3 flex items-center justify-between text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] hover:bg-[#F7F8FA] dark:hover:bg-white/[0.03] transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <Trophy className="w-4 h-4 text-[#D52E3A] dark:text-[#E1434F]" />
            <span>Campeonato de pontuação</span>
          </span>
          <ChevronRight className="w-4 h-4 text-[#6B7280] dark:text-[#8B93A1]" />
        </button>

        <button
          type="button"
          onClick={() => navigate('rankings')}
          className="w-full min-h-[48px] px-4 py-3 flex items-center justify-between text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] hover:bg-[#F7F8FA] dark:hover:bg-white/[0.03] transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <BarChart3 className="w-4 h-4 text-[#D52E3A] dark:text-[#E1434F]" />
            <span>Indicadores operacionais</span>
          </span>
          <ChevronRight className="w-4 h-4 text-[#6B7280] dark:text-[#8B93A1]" />
        </button>

        <button
          type="button"
          onClick={() => navigate('stores')}
          className="w-full min-h-[48px] px-4 py-3 flex items-center justify-between text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] hover:bg-[#F7F8FA] dark:hover:bg-white/[0.03] transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-[#D52E3A] dark:text-[#E1434F]" />
            <span>Lojas e equipes</span>
          </span>
          <ChevronRight className="w-4 h-4 text-[#6B7280] dark:text-[#8B93A1]" />
        </button>

        {capabilities.canManageAdmin && (
          <button
            type="button"
            onClick={() => navigate('admin')}
            className="w-full min-h-[48px] px-4 py-3 flex items-center justify-between text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] hover:bg-[#F7F8FA] dark:hover:bg-white/[0.03] transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#D52E3A] dark:text-[#E1434F]" />
              <span>Administração da rede</span>
            </span>
            <ChevronRight className="w-4 h-4 text-[#6B7280] dark:text-[#8B93A1]" />
          </button>
        )}
      </div>

      {/* Demo Role Switcher (3 profiles only: Admin, Supervisor, Gerente) */}
      <section className="bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl p-4 sm:p-5 space-y-3">
        <div>
          <h3 className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6]">
            Perfil demonstrativo (controle de acesso)
          </h3>
          <p className="text-[11px] text-[#6B7280] dark:text-[#8B93A1] mt-0.5">
            Alterne entre Administrador, Supervisor e Gerente para validar permissões e fluxos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {ROLES.map((r) => {
            const active = currentUser.role === r.role;
            return (
              <button
                key={r.role}
                type="button"
                onClick={() => switchRole(r.role)}
                className={`min-h-[48px] p-3 rounded-xl border text-left transition-colors ${
                  active
                    ? 'bg-[#FFF1F2] dark:bg-[#E1434F]/[0.12] border-[#D52E3A] dark:border-[#E1434F]/50 text-[#B91F2C] dark:text-[#FCA5A5]'
                    : 'bg-[#F5F6F8] dark:bg-[#0D1017] border-[#E5E7EB] dark:border-white/[0.08] text-[#24272D] dark:text-[#F3F4F6] hover:dark:bg-[#161A23]'
                }`}
              >
                <div className="text-xs font-semibold">{r.label}</div>
                <div className="text-[11px] opacity-80 mt-0.5">{r.desc}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Preferences & PWA */}
      <section className="bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl divide-y divide-[#E5E7EB] dark:divide-white/[0.06] overflow-hidden">
        <div className="px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-[#D52E3A]" />
            ) : (
              <Moon className="w-4 h-4 text-[#FCA5A5]" />
            )}
            <div>
              <div className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6]">
                Aparência
              </div>
              <div className="text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
                Tema atual: {theme === 'light' ? 'Claro' : 'Escuro'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] bg-transparent dark:bg-[#171B24] text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] hover:bg-[#F7F8FA] dark:hover:bg-[#1F2531] transition-colors"
          >
            Alternar tema
          </button>
        </div>

        <div className="px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-[#D52E3A] dark:text-[#E1434F]" />
            <div>
              <div className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6]">
                Aplicativo instalável (PWA)
              </div>
              <div className="text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
                Suporte a Android, iPhone (Safari) e Desktop
              </div>
            </div>
          </div>
          <PWAInstallButton compact />
        </div>

        <div className="px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 text-[#D97706] dark:text-[#FBBF24]" />
            <div>
              <div className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6]">
                Simular conectividade instável (teste)
              </div>
              <div className="text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
                Testa enfileiramento offline sem desconectar seu navegador
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSimulatedOffline(!simulatedOffline)}
            className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
              simulatedOffline
                ? 'bg-[#D52E3A] text-white'
                : 'border border-[#E5E7EB] dark:border-white/[0.08] text-[#4B5563] dark:text-[#D1D5DB] hover:bg-[#F7F8FA] dark:hover:bg-white/[0.04]'
            }`}
          >
            {simulatedOffline ? 'Offline ativo' : 'Simular'}
          </button>
        </div>

        <div className="px-4 py-3.5 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6]">
              Simular falha de carregamento (teste)
            </div>
            <div className="text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
              Exibe tela de recuperação de erro no Dashboard e Tarefas
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSimulateLoadError(!simulateLoadError)}
            className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
              simulateLoadError
                ? 'bg-[#D52E3A] text-white'
                : 'border border-[#E5E7EB] dark:border-white/[0.08] text-[#4B5563] dark:text-[#D1D5DB] hover:bg-[#F7F8FA] dark:hover:bg-white/[0.04]'
            }`}
          >
            {simulateLoadError ? 'Erro ativo' : 'Testar erro'}
          </button>
        </div>

        <div className="px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-4 h-4 text-[#6B7280] dark:text-[#8B93A1]" />
            <div>
              <div className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6]">
                Restaurar dados iniciais
              </div>
              <div className="text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
                Reinicia tarefas e notificações do protótipo
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={resetDemoData}
            className="min-h-[36px] px-3 py-1 rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] text-xs font-semibold text-[#4B5563] dark:text-[#D1D5DB] hover:bg-[#F7F8FA] dark:hover:bg-white/[0.04] transition-colors"
          >
            Restaurar
          </button>
        </div>
      </section>

      {/* Help Section */}
      <div className="bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setHelpOpen((v) => !v)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] hover:bg-[#F7F8FA] dark:hover:bg-white/[0.03] transition-colors"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#D52E3A] dark:text-[#E1434F]" />
            <span>Ajuda rápida do fluxo operacional</span>
          </span>
          <span className="text-[#6B7280] dark:text-[#8B93A1]">{helpOpen ? 'Ocultar' : 'Expandir'}</span>
        </button>
        {helpOpen && (
          <div className="px-4 pb-4 text-xs text-[#4B5563] dark:text-[#9CA3AF] space-y-2 border-t border-[#E5E7EB] dark:border-white/[0.06] pt-3 leading-relaxed">
            <p>
              <strong className="text-[#24272D] dark:text-[#D1D5DB]">1. Planejamento:</strong> Administradores e Supervisores abrem atividades com prazo, unidade, responsável e exigência de foto.
            </p>
            <p>
              <strong className="text-[#24272D] dark:text-[#D1D5DB]">2. Execução em loja:</strong> O Gerente de Loja cumpre apenas as tarefas designadas para ele, registra fotos ou arquivos de evidência e envia para conferência.
            </p>
            <p>
              <strong className="text-[#24272D] dark:text-[#D1D5DB]">3. Conferência e Campeonato:</strong> Supervisores e Administradores conferem as evidências para aprovar ou devolver para correção, acompanhando a evolução das unidades no Campeonato.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
