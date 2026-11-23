import React, { useState } from 'react';
import {
  BarChart3,
  Bell,
  Building2,
  CheckSquare,
  ChevronDown,
  ClipboardCheck,
  LayoutDashboard,
  Moon,
  Plus,
  Settings2,
  ShieldCheck,
  Sun,
  Trophy,
  User,
  WifiOff,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppRoute, UserRole } from '../../types/operations';
import { Avatar, PWAInstallButton } from '../ui/Primitives';

interface NavItem {
  route: AppRoute;
  label: string;
  shortLabel: string;
  icon: React.FC<{ className?: string }>;
  badge?: number;
  roles: UserRole[];
}

const ROUTE_TITLES: Record<AppRoute, string> = {
  dashboard: 'Visão Operacional',
  tasks: 'Atividades',
  review: 'Conferência',
  championship: 'Campeonato',
  stores: 'Lojas e Equipes',
  rankings: 'Indicadores',
  notifications: 'Notificações',
  profile: 'Perfil e Preferências',
  admin: 'Administração',
};

const ROLE_OPTIONS: { role: UserRole; label: string; hint: string }[] = [
  { role: 'admin', label: 'Administrador', hint: 'Rede completa e cadastros' },
  { role: 'supervisor', label: 'Supervisor', hint: 'Regional e conferências' },
  { role: 'gerente', label: 'Gerente', hint: 'Cumprimento de tarefas MM-04' },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    theme,
    toggleTheme,
    currentUser,
    switchRole,
    capabilities,
    activeRoute,
    navigate,
    tasks,
    unreadCount,
    isOnline,
    pendingOfflineSyncCount,
    openCreateTaskModal,
    toast,
    dismissToast,
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const pendingReviewCount = tasks.filter((t) => {
    if (t.status !== 'aguardando_conferencia') return false;
    if (currentUser.role === 'gerente') return t.storeId === currentUser.storeId;
    return true;
  }).length;

  const navItems: NavItem[] = [
    {
      route: 'dashboard',
      label: 'Início',
      shortLabel: 'Início',
      icon: LayoutDashboard,
      roles: ['admin', 'supervisor', 'gerente'],
    },
    {
      route: 'tasks',
      label: 'Tarefas',
      shortLabel: 'Tarefas',
      icon: CheckSquare,
      roles: ['admin', 'supervisor', 'gerente'],
    },
    {
      route: 'review',
      label: 'Conferência',
      shortLabel: 'Conferir',
      icon: ClipboardCheck,
      badge: pendingReviewCount,
      roles: ['admin', 'supervisor'],
    },
    {
      route: 'championship',
      label: 'Campeonato',
      shortLabel: 'Copa',
      icon: Trophy,
      roles: ['admin', 'supervisor', 'gerente'],
    },
    {
      route: 'rankings',
      label: 'Indicadores',
      shortLabel: 'Indic.',
      icon: BarChart3,
      roles: ['admin', 'supervisor', 'gerente'],
    },
    {
      route: 'stores',
      label: 'Lojas e equipes',
      shortLabel: 'Lojas',
      icon: Building2,
      roles: ['admin', 'supervisor', 'gerente'],
    },
    {
      route: 'notifications',
      label: 'Notificações',
      shortLabel: 'Avisos',
      icon: Bell,
      badge: unreadCount,
      roles: ['admin', 'supervisor', 'gerente'],
    },
    {
      route: 'admin',
      label: 'Administração',
      shortLabel: 'Admin',
      icon: ShieldCheck,
      roles: ['admin'],
    },
    {
      route: 'profile',
      label: 'Perfil',
      shortLabel: 'Perfil',
      icon: User,
      roles: ['admin', 'supervisor', 'gerente'],
    },
  ];

  const allowedDesktopNav = navItems.filter((item) => item.roles.includes(currentUser.role));

  // Floating bottom dock: Conferir shown only for Supervisor and Administrador
  const mobileBottomItems: NavItem[] = capabilities.canReviewTasks
    ? [
        navItems[0], // Início
        navItems[1], // Tarefas
        navItems[2], // Conferir
        navItems[3], // Campeonato (Copa)
        navItems[8], // Perfil
      ]
    : [
        navItems[0], // Início
        navItems[1], // Tarefas
        navItems[3], // Campeonato (Copa)
        navItems[8], // Perfil
      ];

  return (
    <div className="min-h-screen bg-[#F5F6F8] dark:bg-[#090B0F] text-[#24272D] dark:text-[#F3F4F6] flex flex-col lg:flex-row">
      {/* Desktop Compact Sidebar (lg+) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[248px] lg:shrink-0 lg:sticky lg:top-0 lg:h-screen bg-white/92 dark:bg-[#0E1117]/95 backdrop-blur-md border-r border-[#E5E7EB] dark:border-white/[0.08]">
        {/* Brand typographic mark */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-[#E5E7EB]/80 dark:border-white/[0.07]">
          <button
            type="button"
            onClick={() => navigate('dashboard')}
            className="text-left focus-visible:outline-2 focus-visible:outline-[#D52E3A] rounded"
          >
            <div className="flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-[15px] font-bold tracking-tight text-[#D52E3A] dark:text-[#E1434F]">
                Minas Mais
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-[#24272D] dark:text-[#F3F4F6]">
                Executa
              </span>
            </div>
          </button>
        </div>

        {/* Role Switcher for Demo RBAC (3 profiles: Admin, Supervisor, Gerente) */}
        <div className="px-3 pt-3 pb-2.5 border-b border-[#E5E7EB]/80 dark:border-white/[0.07] relative">
          <button
            type="button"
            onClick={() => setRoleMenuOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-[#F5F6F8] dark:bg-[#171B24] dark:border dark:border-white/[0.06] hover:bg-[#ECEEF2] dark:hover:bg-[#1D222D] transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                src={currentUser.avatarUrl}
                initials={currentUser.initials}
                name={currentUser.name}
                size="sm"
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] truncate">
                  {currentUser.roleLabel}
                </div>
                <div className="text-[11px] text-[#6B7280] dark:text-[#8B93A1] truncate">
                  {currentUser.name}
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
          </button>

          {roleMenuOpen && (
            <div className="absolute left-3 right-3 top-[66px] z-40 rounded-xl liquid-glass-surface bg-white dark:bg-[#171B24] shadow-xl p-1.5">
              <div className="px-2.5 py-1.5 text-[11px] font-medium text-[#6B7280] dark:text-[#8B93A1]">
                Alternar perfil demonstrativo
              </div>
              {ROLE_OPTIONS.map((opt) => {
                const active = opt.role === currentUser.role;
                return (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => {
                      switchRole(opt.role);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      active
                        ? 'bg-[#FFF1F2] text-[#B91F2C] dark:bg-[#E1434F]/14 dark:text-[#FCA5A5] font-semibold'
                        : 'text-[#24272D] dark:text-[#F3F4F6] hover:bg-[#F5F6F8] dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <div>
                      <div>{opt.label}</div>
                      <div className="text-[11px] font-normal text-[#6B7280] dark:text-[#8B93A1]">
                        {opt.hint}
                      </div>
                    </div>
                    {active && <span className="text-[11px] font-semibold">Ativo</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5" aria-label="Navegação principal">
          {allowedDesktopNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.route;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => navigate(item.route)}
                className={`w-full min-h-[40px] px-3 py-2 rounded-xl flex items-center justify-between text-[13px] transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#FFF1F2] text-[#B91F2C] dark:bg-[#E1434F]/12 dark:text-[#FCA5A5] dark:ring-1 dark:ring-[#E1434F]/25 font-semibold'
                    : 'text-[#4B5563] dark:text-[#9CA3AF] hover:bg-[#F5F6F8] dark:hover:bg-white/[0.04] hover:text-[#24272D] dark:hover:text-[#F3F4F6] font-medium'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="font-mono-num text-[11px] font-semibold text-[#D52E3A] dark:text-[#FCA5A5]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Create CTA + PWA Install */}
        <div className="p-3 border-t border-[#E5E7EB]/80 dark:border-white/[0.07] space-y-2">
          {capabilities.canCreateTasks && (
            <button
              type="button"
              onClick={openCreateTaskModal}
              className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#D52E3A] hover:bg-[#B91F2C] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Nova tarefa</span>
            </button>
          )}
          <PWAInstallButton />
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Redesigned Liquid Glass Header — distinct Mobile/Tablet vs Desktop composition */}
        <header className="sticky top-0 z-30 pt-safe liquid-glass-bar">
          {/* Mobile & Tablet Header (< lg): Spacious, zero truncation at 320px-430px */}
          <div className="lg:hidden h-[48px] sm:h-[54px] px-3 sm:px-5 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => navigate('dashboard')}
              className="flex items-center gap-1.5 min-w-0 shrink-0 focus-visible:outline-2 focus-visible:outline-[#D52E3A] rounded"
            >
              <span
                className="w-2 h-5 rounded-full bg-[#D52E3A] shrink-0"
                aria-hidden="true"
              />
              <span className="text-[15px] font-bold tracking-tight text-[#D52E3A] whitespace-nowrap">
                Minas Mais
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-[#24272D] dark:text-[#F3F4F6] whitespace-nowrap">
                Executa
              </span>
            </button>

            <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
              {!isOnline && (
                <span
                  title="Sem conexão — modo offline ativo"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E] dark:bg-[#78350F]/50 dark:text-[#FCD34D] shrink-0"
                >
                  <WifiOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {pendingOfflineSyncCount > 0 && (
                    <span className="font-mono-num">{pendingOfflineSyncCount}</span>
                  )}
                </span>
              )}

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#4B5563] dark:text-[#9CA3AF] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {theme === 'light' ? (
                  <Moon className="w-[18px] h-[18px]" aria-hidden="true" />
                ) : (
                  <Sun className="w-[18px] h-[18px]" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('notifications')}
                aria-label={`Notificações (${unreadCount} não lidas)`}
                className="relative min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#4B5563] dark:text-[#9CA3AF] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <Bell className="w-[18px] h-[18px]" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#D52E3A] text-white text-[9px] font-mono-num font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#0E1117]">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('profile')}
                aria-label={`Perfil ativo: ${currentUser.name} (${currentUser.roleLabel})`}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <Avatar
                  src={currentUser.avatarUrl}
                  initials={currentUser.initials}
                  name={currentUser.name}
                  size="sm"
                />
              </button>
            </div>
          </div>

          {/* Desktop Top Header (lg+): Dedicated corporate composition */}
          <div className="hidden lg:flex h-14 px-6 max-w-[1280px] mx-auto items-center justify-between gap-6">
            <div className="flex items-baseline gap-2.5 min-w-0">
              <h1 className="text-base font-semibold text-[#24272D] dark:text-[#F3F4F6] whitespace-nowrap">
                {ROUTE_TITLES[activeRoute]}
              </h1>
              <span className="text-xs text-[#6B7280] dark:text-[#8B93A1] truncate">
                · {capabilities.scopeLabel}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isOnline && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E] dark:bg-[#78350F]/45 dark:text-[#FCD34D] whitespace-nowrap">
                  <WifiOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Sem conexão</span>
                  {pendingOfflineSyncCount > 0 && (
                    <span className="font-mono-num">({pendingOfflineSyncCount})</span>
                  )}
                </span>
              )}

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#4B5563] dark:text-[#9CA3AF] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {theme === 'light' ? (
                  <Moon className="w-[18px] h-[18px]" aria-hidden="true" />
                ) : (
                  <Sun className="w-[18px] h-[18px]" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('notifications')}
                aria-label={`Notificações (${unreadCount} não lidas)`}
                className="relative min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#4B5563] dark:text-[#9CA3AF] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <Bell className="w-[18px] h-[18px]" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#D52E3A] text-white text-[10px] font-mono-num font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#0E1117]">
                    {unreadCount}
                  </span>
                )}
              </button>

              <div className="h-5 w-px bg-[#E5E7EB] dark:bg-white/[0.1] mx-1" aria-hidden="true" />

              <button
                type="button"
                onClick={() => navigate('profile')}
                className="min-h-[40px] px-2 py-1 rounded-xl flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <Avatar
                  src={currentUser.avatarUrl}
                  initials={currentUser.initials}
                  name={currentUser.name}
                  size="sm"
                />
                <div className="text-left leading-tight">
                  <div className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] whitespace-nowrap">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-[#6B7280] dark:text-[#8B93A1] whitespace-nowrap">
                    {currentUser.roleLabel}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Tablet Horizontal Nav Strip (md only) */}
          <div className="hidden md:flex lg:hidden items-center gap-1 px-4 pb-2 overflow-x-auto border-t border-[#E5E7EB]/60 dark:border-white/[0.06] pt-1.5">
            {allowedDesktopNav.map((item) => {
              const isActive = activeRoute === item.route;
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => navigate(item.route)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#FFF1F2] text-[#B91F2C] dark:bg-[#E1434F]/14 dark:text-[#FCA5A5] dark:ring-1 dark:ring-[#E1434F]/25 font-semibold'
                      : 'text-[#4B5563] dark:text-[#9CA3AF] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {item.label}
                  {typeof item.badge === 'number' && item.badge > 0 ? ` (${item.badge})` : ''}
                </button>
              );
            })}
            {capabilities.canCreateTasks && (
              <button
                type="button"
                onClick={openCreateTaskModal}
                className="ml-auto px-3 py-1.5 rounded-lg bg-[#D52E3A] text-white text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Nova</span>
              </button>
            )}
            {currentUser.role === 'admin' && (
              <button
                type="button"
                onClick={() => navigate('admin')}
                aria-label="Administração"
                className="p-1.5 rounded-lg text-[#4B5563] dark:text-[#9CA3AF]"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Main Scrollable Viewport */}
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-3 sm:px-4 lg:px-6 pt-2.5 sm:pt-4 lg:pt-5 pb-20 sm:pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Floating Liquid Glass Bottom Dock (< md) */}
      <nav
        aria-label="Navegação inferior"
        className="md:hidden fixed left-3 right-3 bottom-safe-offset z-30 rounded-[20px] liquid-glass-dock px-1"
      >
        <div
          className={`grid ${
            mobileBottomItems.length === 5 ? 'grid-cols-5' : 'grid-cols-4'
          } h-[54px] items-center`}
        >
          {mobileBottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.route;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => navigate(item.route)}
                className={`relative h-[44px] mx-0.5 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                  isActive
                    ? 'bg-[#FFF1F2]/95 dark:bg-[#E1434F]/14 text-[#D52E3A] dark:text-[#FCA5A5] dark:ring-1 dark:ring-[#E1434F]/25 font-semibold'
                    : 'text-[#6B7280] dark:text-[#8B93A1] font-medium hover:text-[#24272D] dark:hover:text-[#F3F4F6]'
                }`}
              >
                <div className="relative">
                  <Icon className="w-[19px] h-[19px]" aria-hidden="true" />
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#D52E3A] text-white text-[9px] font-mono-num font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] leading-tight tracking-tight truncate max-w-[58px]">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Global Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 md:bottom-5 right-4 left-4 sm:left-auto sm:w-88 z-50 rounded-2xl bg-[#24272D]/95 dark:bg-[#171B24]/95 dark:border dark:border-white/[0.12] backdrop-blur-md text-white dark:text-[#F3F4F6] px-4 py-3 shadow-xl flex items-center justify-between gap-3 text-xs font-medium"
        >
          <span className="leading-snug">{toast.title}</span>
          <button
            type="button"
            onClick={dismissToast}
            className="text-[11px] opacity-75 hover:opacity-100 shrink-0 underline"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
};
