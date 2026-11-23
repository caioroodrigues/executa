import React, { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { registerSW } from 'virtual:pwa-register';
import { AppShell } from './components/layout/AppShell';
import { AdminScreen } from './components/screens/AdminScreen';
import { CampeonatoScreen } from './components/screens/CampeonatoScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { NotificationsScreen } from './components/screens/NotificationsScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { RankingsScreen } from './components/screens/RankingsScreen';
import { ReviewQueueScreen } from './components/screens/ReviewQueueScreen';
import { StoresTeamsScreen } from './components/screens/StoresTeamsScreen';
import { TasksScreen } from './components/screens/TasksScreen';
import { ExecutionDrawer } from './components/tasks/ExecutionDrawer';
import { TaskDetailDrawer } from './components/tasks/TaskDetailDrawer';
import { TaskFormModal } from './components/tasks/TaskFormModal';
import { AppProvider, useApp } from './context/AppContext';

const LIQUID_EASE = [0.16, 1, 0.3, 1] as const;

const ActiveViewport: React.FC = () => {
  const { activeRoute, capabilities } = useApp();

  const renderScreen = () => {
    switch (activeRoute) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'tasks':
        return <TasksScreen />;
      case 'review':
        return capabilities.canReviewTasks ? <ReviewQueueScreen /> : <DashboardScreen />;
      case 'championship':
        return <CampeonatoScreen />;
      case 'stores':
        return <StoresTeamsScreen />;
      case 'rankings':
        return <RankingsScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'admin':
        return <AdminScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeRoute}
        initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -6, filter: 'blur(3px)' }}
        transition={{ duration: 0.18, ease: LIQUID_EASE }}
      >
        {renderScreen()}
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  const [swUpdateAvailable, setSwUpdateAvailable] = useState<(() => void) | null>(null);

  useEffect(() => {
    try {
      const updateSW = registerSW({
        onNeedRefresh() {
          setSwUpdateAvailable(() => () => updateSW(true));
        },
        onOfflineReady() {
          // Offline cache ready silently
        },
      });
    } catch {
      // Service worker registration gracefully skipped in unsupported contexts
    }
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <AppProvider>
        <AppShell>
          <ActiveViewport />
        </AppShell>
        <TaskDetailDrawer />
        <ExecutionDrawer />
        <TaskFormModal />

        {swUpdateAvailable && (
          <div className="fixed top-16 right-4 z-50 rounded-2xl liquid-glass-surface px-4 py-3 shadow-lg flex items-center gap-3 text-xs">
            <span>Nova versão disponível.</span>
            <button
              type="button"
              onClick={() => swUpdateAvailable()}
              className="px-2.5 py-1 rounded-lg bg-[#D52E3A] text-white font-semibold"
            >
              Atualizar
            </button>
          </div>
        )}
      </AppProvider>
    </MotionConfig>
  );
}
