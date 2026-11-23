import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEMO_STORES,
  DEMO_USERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PARAMETERS,
  INITIAL_TASKS,
} from '../data/mockOperations';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  AppNotification,
  AppRoute,
  OperationalTask,
  StoreUnit,
  SystemParameter,
  TaskCategory,
  TaskEvidence,
  TaskPriority,
  UserProfile,
  UserRole,
} from '../types/operations';
import { formatNowStamp, getRoleCapabilities, RoleCapabilities } from '../utils/taskHelpers';

export interface ToastItem {
  id: string;
  title: string;
  tone: 'success' | 'warning' | 'error' | 'info';
}

export interface NewTaskPayload {
  title: string;
  description: string;
  category: TaskCategory;
  storeId: string;
  assigneeId: string;
  priority: TaskPriority;
  dueDate: string;
  requiresPhoto: boolean;
  instructions: string[];
  checklistLabels: string[];
}

interface AppContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentUser: UserProfile;
  switchRole: (role: UserRole) => void;
  capabilities: RoleCapabilities;
  activeRoute: AppRoute;
  navigate: (route: AppRoute) => void;
  taskFilterPreset: 'todas' | 'pendentes' | 'andamento' | 'conferencia' | 'devolvidas' | 'atrasadas' | 'aprovadas';
  setTaskFilterPreset: (f: 'todas' | 'pendentes' | 'andamento' | 'conferencia' | 'devolvidas' | 'atrasadas' | 'aprovadas') => void;
  navigateTasksFiltered: (f: 'todas' | 'pendentes' | 'andamento' | 'conferencia' | 'devolvidas' | 'atrasadas' | 'aprovadas') => void;
  isLoadingView: boolean;
  simulateLoadError: boolean;
  setSimulateLoadError: (val: boolean) => void;
  retryViewLoad: () => void;
  isOnline: boolean;
  simulatedOffline: boolean;
  setSimulatedOffline: (val: boolean) => void;
  pendingOfflineSyncCount: number;
  tasks: OperationalTask[];
  visibleTasks: OperationalTask[];
  stores: StoreUnit[];
  users: UserProfile[];
  notifications: AppNotification[];
  visibleNotifications: AppNotification[];
  unreadCount: number;
  parameters: SystemParameter[];
  selectedTaskId: string | null;
  openTaskDetail: (taskId: string) => void;
  closeTaskDetail: () => void;
  executionTaskId: string | null;
  openExecution: (taskId: string) => void;
  closeExecution: () => void;
  isTaskModalOpen: boolean;
  editingTask: OperationalTask | null;
  openCreateTaskModal: () => void;
  openEditTaskModal: (task: OperationalTask) => void;
  closeTaskModal: () => void;
  startTask: (taskId: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  addEvidence: (taskId: string, evidence: Omit<TaskEvidence, 'id' | 'uploadedAt' | 'uploadedBy'>) => void;
  removeEvidence: (taskId: string, evidenceId: string) => void;
  submitForReview: (taskId: string, note?: string) => void;
  approveTask: (taskId: string, note?: string) => void;
  returnTask: (taskId: string, reason: string) => void;
  addComment: (taskId: string, text: string) => void;
  createTask: (payload: NewTaskPayload) => void;
  updateTask: (taskId: string, payload: NewTaskPayload) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toggleUserActive: (userId: string) => void;
  addDemoUser: (name: string, role: UserRole, storeId: string | null, jobTitle: string) => void;
  updateParameter: (id: string, value: string) => void;
  resetDemoData: () => void;
  toast: ToastItem | null;
  dismissToast: () => void;
  showToast: (title: string, tone?: ToastItem['tone']) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mm_executa_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });

  const [users, setUsers] = useState<UserProfile[]>(DEMO_USERS);
  const [currentRole, setCurrentRole] = useState<UserRole>('gerente');
  const [activeRoute, setActiveRoute] = useState<AppRoute>('dashboard');
  const [taskFilterPreset, setTaskFilterPreset] = useState<'todas' | 'pendentes' | 'andamento' | 'conferencia' | 'devolvidas' | 'atrasadas' | 'aprovadas'>('todas');
  const [tasks, setTasks] = useState<OperationalTask[]>(INITIAL_TASKS);
  const [stores] = useState<StoreUnit[]>(DEMO_STORES);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [parameters, setParameters] = useState<SystemParameter[]>(INITIAL_PARAMETERS);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [executionTaskId, setExecutionTaskId] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<OperationalTask | null>(null);

  const [isLoadingView, setIsLoadingView] = useState(false);
  const [simulateLoadError, setSimulateLoadError] = useState(false);
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [pendingOfflineSyncCount, setPendingOfflineSyncCount] = useState(0);
  const [toast, setToast] = useState<ToastItem | null>(null);

  const browserOnline = useOnlineStatus();
  const isOnline = browserOnline && !simulatedOffline;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('mm_executa_theme', theme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#090B0F' : '#D52E3A');
    }
  }, [theme]);

  const showToast = useCallback((title: string, tone: ToastItem['tone'] = 'info') => {
    const id = `toast-${Date.now()}`;
    setToast({ id, title, tone });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3600);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  // When coming back online with queued offline actions, simulate graceful sync notification
  useEffect(() => {
    if (isOnline && pendingOfflineSyncCount > 0) {
      const count = pendingOfflineSyncCount;
      setPendingOfflineSyncCount(0);
      showToast(`Conexão restabelecida: ${count} atualização(ões) sincronizada(s).`, 'success');
    }
  }, [isOnline, pendingOfflineSyncCount, showToast]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const currentUser = useMemo(() => {
    return users.find((u) => u.role === currentRole && u.active) || users[0];
  }, [users, currentRole]);

  const capabilities = useMemo(() => getRoleCapabilities(currentUser.role), [currentUser.role]);

  const navigate = useCallback(
    (route: AppRoute) => {
      if (route === 'admin' && currentUser.role !== 'admin') {
        showToast('Acesso restrito ao perfil Administrador.', 'warning');
        return;
      }
      if (route === 'review' && !capabilities.canReviewTasks) {
        showToast('Conferência restrita a Supervisor e Administrador.', 'warning');
        return;
      }
      setActiveRoute(route);
      if (route !== 'tasks') {
        setTaskFilterPreset('todas');
      }
      setSelectedTaskId(null);
      setExecutionTaskId(null);
    },
    [capabilities.canReviewTasks, currentUser.role, showToast]
  );

  const navigateTasksFiltered = useCallback(
    (f: 'todas' | 'pendentes' | 'andamento' | 'conferencia' | 'devolvidas' | 'atrasadas' | 'aprovadas') => {
      setTaskFilterPreset(f);
      setActiveRoute('tasks');
      setSelectedTaskId(null);
      setExecutionTaskId(null);
    },
    []
  );

  const switchRole = useCallback(
    (role: UserRole) => {
      setIsLoadingView(true);
      setCurrentRole(role);
      setSelectedTaskId(null);
      setExecutionTaskId(null);

      if (role !== 'admin' && activeRoute === 'admin') {
        setActiveRoute('dashboard');
      }
      if (role === 'gerente' && activeRoute === 'review') {
        setActiveRoute('dashboard');
      }

      const target = users.find((u) => u.role === role);
      setTimeout(() => {
        setIsLoadingView(false);
        if (target) {
          showToast(`Perfil ativo: ${target.roleLabel} (${target.name})`, 'info');
        }
      }, 220);
    },
    [activeRoute, showToast, users]
  );

  const retryViewLoad = useCallback(() => {
    setIsLoadingView(true);
    setTimeout(() => {
      setSimulateLoadError(false);
      setIsLoadingView(false);
      showToast('Dados operacionais atualizados.', 'success');
    }, 350);
  }, [showToast]);

  // Scope tasks cleanly by role (Gerente sees and executes only tasks assigned to them)
  const visibleTasks = useMemo(() => {
    if (currentUser.role === 'admin' || currentUser.role === 'supervisor') {
      return tasks;
    }
    return tasks.filter((t) => t.assigneeId === currentUser.id);
  }, [tasks, currentUser]);

  const visibleNotifications = useMemo(() => {
    return notifications.filter((n) => n.targetRoles.includes(currentUser.role));
  }, [notifications, currentUser.role]);

  const unreadCount = useMemo(() => {
    return visibleNotifications.filter((n) => !n.read).length;
  }, [visibleNotifications]);

  const markOfflineChangeIfNeeded = useCallback(() => {
    if (!isOnline) {
      setPendingOfflineSyncCount((c) => c + 1);
    }
  }, [isOnline]);

  const startTask = useCallback(
    (taskId: string) => {
      const stamp = formatNowStamp();
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: 'em_andamento',
                startedAt: t.startedAt || new Date().toISOString(),
                history: [
                  ...t.history,
                  { id: `h-${Date.now()}`, action: 'Execução iniciada', actorName: currentUser.name, timestamp: stamp },
                ],
              }
            : t
        )
      );
      markOfflineChangeIfNeeded();
      showToast(isOnline ? 'Execução iniciada.' : 'Execução salva localmente (modo offline).', 'success');
    },
    [currentUser.name, isOnline, markOfflineChangeIfNeeded, showToast]
  );

  const toggleChecklistItem = useCallback(
    (taskId: string, itemId: string) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                checklist: t.checklist.map((c) => (c.id === itemId ? { ...c, checked: !c.checked } : c)),
              }
            : t
        )
      );
      markOfflineChangeIfNeeded();
    },
    [markOfflineChangeIfNeeded]
  );

  const addEvidence = useCallback(
    (taskId: string, evidence: Omit<TaskEvidence, 'id' | 'uploadedAt' | 'uploadedBy'>) => {
      const stamp = formatNowStamp();
      const newEv: TaskEvidence = {
        ...evidence,
        id: `ev-${Date.now()}`,
        uploadedAt: stamp,
        uploadedBy: currentUser.name,
      };
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: t.status === 'pendente' ? 'em_andamento' : t.status,
                evidences: [...t.evidences, newEv],
                history: [
                  ...t.history,
                  {
                    id: `h-${Date.now()}`,
                    action: `Evidência anexada (${evidence.name})`,
                    actorName: currentUser.name,
                    timestamp: stamp,
                  },
                ],
              }
            : t
        )
      );
      markOfflineChangeIfNeeded();
      showToast(isOnline ? 'Evidência anexada com sucesso.' : 'Evidência salva na fila offline.', 'success');
    },
    [currentUser.name, isOnline, markOfflineChangeIfNeeded, showToast]
  );

  const removeEvidence = useCallback((taskId: string, evidenceId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, evidences: t.evidences.filter((e) => e.id !== evidenceId) } : t
      )
    );
  }, []);

  const submitForReview = useCallback(
    (taskId: string, note?: string) => {
      const stamp = formatNowStamp();
      const targetTask = tasks.find((t) => t.id === taskId);
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const nextComments = note?.trim()
            ? [
                ...t.comments,
                {
                  id: `cm-${Date.now()}`,
                  authorId: currentUser.id,
                  authorName: currentUser.name,
                  authorRole: currentUser.roleLabel,
                  text: note.trim(),
                  createdAt: stamp,
                },
              ]
            : t.comments;
          return {
            ...t,
            status: 'aguardando_conferencia',
            returnReason: undefined,
            submittedAt: stamp,
            comments: nextComments,
            history: [
              ...t.history,
              {
                id: `h-${Date.now()}`,
                action: 'Enviada para conferência',
                actorName: currentUser.name,
                timestamp: stamp,
              },
            ],
          };
        })
      );

      if (targetTask) {
        setNotifications((prev) => [
          {
            id: `not-${Date.now()}`,
            title: 'Nova tarefa para conferência',
            message: `${targetTask.storeCode} ${targetTask.storeName} enviou ${targetTask.code} (${targetTask.title}).`,
            type: 'conferencia',
            taskId,
            createdAt: 'Agora',
            read: false,
            targetRoles: ['supervisor', 'admin'],
          },
          ...prev,
        ]);
      }

      markOfflineChangeIfNeeded();
      setExecutionTaskId(null);
      showToast(
        isOnline ? 'Tarefa enviada para conferência.' : 'Envio enfileirado para sincronização offline.',
        'success'
      );
    },
    [currentUser, isOnline, markOfflineChangeIfNeeded, showToast, tasks]
  );

  const approveTask = useCallback(
    (taskId: string, note?: string) => {
      const stamp = formatNowStamp();
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            status: 'aprovada',
            reviewedAt: stamp,
            reviewedBy: currentUser.name,
            returnReason: undefined,
            comments: note?.trim()
              ? [
                  ...t.comments,
                  {
                    id: `cm-${Date.now()}`,
                    authorId: currentUser.id,
                    authorName: currentUser.name,
                    authorRole: currentUser.roleLabel,
                    text: note.trim(),
                    createdAt: stamp,
                    kind: 'approval_note',
                  },
                ]
              : t.comments,
            history: [
              ...t.history,
              {
                id: `h-${Date.now()}`,
                action: 'Aprovada na conferência',
                actorName: currentUser.name,
                timestamp: stamp,
              },
            ],
          };
        })
      );
      markOfflineChangeIfNeeded();
      showToast('Tarefa aprovada e concluída.', 'success');
    },
    [currentUser, markOfflineChangeIfNeeded, showToast]
  );

  const returnTask = useCallback(
    (taskId: string, reason: string) => {
      const stamp = formatNowStamp();
      const targetTask = tasks.find((t) => t.id === taskId);
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            status: 'devolvida',
            reviewedAt: stamp,
            reviewedBy: currentUser.name,
            returnReason: reason.trim(),
            comments: [
              ...t.comments,
              {
                id: `cm-${Date.now()}`,
                authorId: currentUser.id,
                authorName: currentUser.name,
                authorRole: currentUser.roleLabel,
                text: `Devolvida para ajuste: ${reason.trim()}`,
                createdAt: stamp,
                kind: 'return_reason',
              },
            ],
            history: [
              ...t.history,
              {
                id: `h-${Date.now()}`,
                action: 'Devolvida para correção',
                actorName: currentUser.name,
                timestamp: stamp,
              },
            ],
          };
        })
      );

      if (targetTask) {
        setNotifications((prev) => [
          {
            id: `not-${Date.now()}`,
            title: 'Tarefa devolvida para correção',
            message: `${targetTask.code} (${targetTask.title}) devolvida por ${currentUser.name}: ${reason.trim()}`,
            type: 'devolucao',
            taskId,
            createdAt: 'Agora',
            read: false,
            targetRoles: ['gerente', 'supervisor', 'admin'],
          },
          ...prev,
        ]);
      }

      markOfflineChangeIfNeeded();
      showToast('Tarefa devolvida ao responsável com justificativa.', 'warning');
    },
    [currentUser, markOfflineChangeIfNeeded, showToast, tasks]
  );

  const addComment = useCallback(
    (taskId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const stamp = formatNowStamp();
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                comments: [
                  ...t.comments,
                  {
                    id: `cm-${Date.now()}`,
                    authorId: currentUser.id,
                    authorName: currentUser.name,
                    authorRole: currentUser.roleLabel,
                    text: trimmed,
                    createdAt: stamp,
                  },
                ],
              }
            : t
        )
      );
      markOfflineChangeIfNeeded();
    },
    [currentUser, markOfflineChangeIfNeeded]
  );

  const createTask = useCallback(
    (payload: NewTaskPayload) => {
      const store = stores.find((s) => s.id === payload.storeId) || stores[0];
      const assignee = users.find((u) => u.id === payload.assigneeId) || users[2];
      const stamp = formatNowStamp();
      const nextCodeNum = 4086 + tasks.length;
      const newTask: OperationalTask = {
        id: `tsk-${Date.now()}`,
        code: `OP-${nextCodeNum}`,
        title: payload.title.trim(),
        description: payload.description.trim(),
        instructions: payload.instructions.filter((i) => i.trim().length > 0),
        category: payload.category,
        storeId: store.id,
        storeCode: store.code,
        storeName: store.name.split(' — ')[0],
        assigneeId: assignee.id,
        assigneeName: assignee.name,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        priority: payload.priority,
        status: 'pendente',
        dueDate: payload.dueDate,
        requiresPhoto: payload.requiresPhoto,
        checklist: payload.checklistLabels
          .filter((l) => l.trim().length > 0)
          .map((label, idx) => ({
            id: `chk-${Date.now()}-${idx}`,
            label: label.trim(),
            checked: false,
          })),
        evidences: [],
        comments: [],
        history: [
          {
            id: `h-${Date.now()}`,
            action: 'Tarefa criada e atribuída',
            actorName: currentUser.name,
            timestamp: stamp,
          },
        ],
      };

      setTasks((prev) => [newTask, ...prev]);
      setNotifications((prev) => [
        {
          id: `not-${Date.now()}`,
          title: 'Nova atividade atribuída',
          message: `${newTask.code}: ${newTask.title} (${newTask.storeCode}) atribuída a ${assignee.name}.`,
          type: 'sistema',
          taskId: newTask.id,
          createdAt: 'Agora',
          read: false,
          targetRoles: ['gerente', 'supervisor', 'admin'],
        },
        ...prev,
      ]);
      markOfflineChangeIfNeeded();
      setIsTaskModalOpen(false);
      showToast(`Tarefa ${newTask.code} criada com sucesso.`, 'success');
    },
    [currentUser, markOfflineChangeIfNeeded, showToast, stores, tasks.length, users]
  );

  const updateTask = useCallback(
    (taskId: string, payload: NewTaskPayload) => {
      const store = stores.find((s) => s.id === payload.storeId) || stores[0];
      const assignee = users.find((u) => u.id === payload.assigneeId) || users[2];
      const stamp = formatNowStamp();
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            title: payload.title.trim(),
            description: payload.description.trim(),
            category: payload.category,
            storeId: store.id,
            storeCode: store.code,
            storeName: store.name.split(' — ')[0],
            assigneeId: assignee.id,
            assigneeName: assignee.name,
            priority: payload.priority,
            dueDate: payload.dueDate,
            requiresPhoto: payload.requiresPhoto,
            instructions: payload.instructions.filter((i) => i.trim().length > 0),
            history: [
              ...t.history,
              {
                id: `h-${Date.now()}`,
                action: 'Detalhes ou prazo atualizados',
                actorName: currentUser.name,
                timestamp: stamp,
              },
            ],
          };
        })
      );
      markOfflineChangeIfNeeded();
      setIsTaskModalOpen(false);
      setEditingTask(null);
      showToast('Alterações salvas na tarefa.', 'success');
    },
    [currentUser.name, markOfflineChangeIfNeeded, showToast, stores, users]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Notificações marcadas como lidas.', 'info');
  }, [showToast]);

  const toggleUserActive = useCallback(
    (userId: string) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u))
      );
      showToast('Status do usuário atualizado.', 'info');
    },
    [showToast]
  );

  const addDemoUser = useCallback(
    (name: string, role: UserRole, storeId: string | null, jobTitle: string) => {
      const store = stores.find((s) => s.id === storeId);
      const roleMap: Record<UserRole, string> = {
        admin: 'Administrador',
        supervisor: 'Supervisor',
        gerente: 'Gerente',
      };
      const parts = name.trim().split(' ');
      const initials =
        parts.length > 1
          ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
          : name.slice(0, 2).toUpperCase();
      const created: UserProfile = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        role,
        roleLabel: roleMap[role],
        jobTitle: jobTitle.trim() || roleMap[role],
        email: `${name.trim().toLowerCase().replace(/\s+/g, '.')}@minasmais.demo`,
        phone: '(31) 99000-0000',
        storeId,
        storeName: store ? `${store.code} ${store.name.split(' — ')[0]}` : 'Matriz / Regional',
        region: store ? store.region : 'Rede Completa',
        initials,
        active: true,
      };
      setUsers((prev) => [created, ...prev]);
      showToast(`Usuário ${created.name} adicionado.`, 'success');
    },
    [showToast, stores]
  );

  const updateParameter = useCallback(
    (id: string, value: string) => {
      setParameters((prev) => prev.map((p) => (p.id === id ? { ...p, value } : p)));
      showToast('Parâmetro operacional atualizado.', 'success');
    },
    [showToast]
  );

  const resetDemoData = useCallback(() => {
    setTasks(INITIAL_TASKS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setParameters(INITIAL_PARAMETERS);
    setUsers(DEMO_USERS);
    setSimulatedOffline(false);
    setSimulateLoadError(false);
    setPendingOfflineSyncCount(0);
    showToast('Dados demonstrativos restaurados.', 'info');
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentUser,
        switchRole,
        capabilities,
        activeRoute,
        navigate,
        taskFilterPreset,
        setTaskFilterPreset,
        navigateTasksFiltered,
        isLoadingView,
        simulateLoadError,
        setSimulateLoadError,
        retryViewLoad,
        isOnline,
        simulatedOffline,
        setSimulatedOffline,
        pendingOfflineSyncCount,
        tasks,
        visibleTasks,
        stores,
        users,
        notifications,
        visibleNotifications,
        unreadCount,
        parameters,
        selectedTaskId,
        openTaskDetail: (id) => setSelectedTaskId(id),
        closeTaskDetail: () => setSelectedTaskId(null),
        executionTaskId,
        openExecution: (id) => setExecutionTaskId(id),
        closeExecution: () => setExecutionTaskId(null),
        isTaskModalOpen,
        editingTask,
        openCreateTaskModal: () => {
          if (!capabilities.canCreateTasks) return;
          setEditingTask(null);
          setIsTaskModalOpen(true);
        },
        openEditTaskModal: (task) => {
          if (!capabilities.canEditTasks) return;
          setEditingTask(task);
          setIsTaskModalOpen(true);
        },
        closeTaskModal: () => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        },
        startTask,
        toggleChecklistItem,
        addEvidence,
        removeEvidence,
        submitForReview,
        approveTask,
        returnTask,
        addComment,
        createTask,
        updateTask,
        markNotificationRead,
        markAllNotificationsRead,
        toggleUserActive,
        addDemoUser,
        updateParameter,
        resetDemoData,
        toast,
        dismissToast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return ctx;
}
