import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    api, User, RecurringTask, Expense, Income, Goal, Debt, Subscription,
    ShoppingItem, AgendaEvent, Notification, Notice, Reward, PersonalHabit,
    Hobby, WishlistItem, PersonalTransaction, WorkoutSession, MealLog,
    StudySession, CycleDay, UserSettings, LeaderboardEntry,
    CreateTaskDto, CreateExpenseDto, CreateIncomeDto, CreateGoalDto,
    CreateShoppingItemDto, CreateEventDto, CreateNoticeDto, CreateHabitDto,
    CreateHobbyDto, CreateWishlistItemDto, CreatePersonalTransactionDto,
    CreateWorkoutDto, CreateMealDto, CreateStudySessionDto, CreateCycleDayDto,
    CreateDebtDto, CreateSubscriptionDto
} from '../services/api';
import { signalRService, RealTimeNotification } from '../services/signalr';
import { ENV } from '../config/env';

export type ContextMode = 'nos' | 'eu';

// Real-time notification for toast display
export interface ToastNotification {
    id: string;
    message: string;
    type: 'success' | 'info' | 'warning';
    timestamp: Date;
}

const REALTIME_NOTIFICATION_META: Record<
    RealTimeNotification['type'],
    { title: string; type: string }
> = {
    TaskCompleted: { title: 'Tarefa concluída', type: 'task' },
    RewardRedeemed: { title: 'Recompensa resgatada', type: 'achievement' },
    NewExpense: { title: 'Nova despesa', type: 'expense' },
    GoalProgress: { title: 'Atualização de meta', type: 'achievement' },
    ShoppingItemAdded: { title: 'Lista de compras', type: 'event' },
    NewNotice: { title: 'Novo aviso', type: 'event' },
    DirectNotification: { title: 'Notificação', type: 'event' },
};

interface AppContextType {
    // State
    isLoading: boolean;
    error: string | null;
    contextMode: ContextMode;
    setContextMode: (mode: ContextMode) => void;

    // Users
    users: User[];
    currentUser: User | null;
    setCurrentUserById: (userId: number) => void;
    deleteUserById: (userId: number, requesterId: number) => Promise<void>;
    updateFamilyProfile: (userId: number, familyRole: 'master' | 'admin' | 'member', familyRelation?: string) => Promise<void>;
    leaderboard: LeaderboardEntry[];
    refreshUsers: (preferredUserId?: number) => Promise<User[]>;

    // Tasks
    tasks: RecurringTask[];
    refreshTasks: () => Promise<void>;
    addTask: (task: CreateTaskDto) => Promise<void>;
    updateTask: (id: number, updates: Partial<RecurringTask>) => Promise<void>;
    deleteTask: (id: number) => Promise<void>;
    completeTask: (id: number, userId?: number) => Promise<void>;

    // Finance
    expenses: Expense[];
    incomes: Income[];
    debts: Debt[];
    featuredDebts: Debt[];
    subscriptions: Subscription[];
    goals: Goal[];
    familyBalance: number;
    refreshFinance: () => Promise<void>;
    addExpense: (expense: CreateExpenseDto) => Promise<void>;
    deleteExpense: (id: number) => Promise<void>;
    addIncome: (income: CreateIncomeDto) => Promise<void>;
    addDebt: (debt: CreateDebtDto) => Promise<void>;
    payDebtInstallment: (id: number) => Promise<void>;
    addSubscription: (sub: CreateSubscriptionDto) => Promise<void>;
    addGoal: (goal: CreateGoalDto) => Promise<void>;
    addContributionToGoal: (goalId: number, amount: number, note?: string) => Promise<void>;

    // Shopping
    shopping: ShoppingItem[];
    refreshShopping: () => Promise<void>;
    addShoppingItem: (item: CreateShoppingItemDto) => Promise<void>;
    toggleShoppingItem: (id: number) => Promise<void>;
    deleteShoppingItem: (id: number) => Promise<void>;

    // Events
    familyEvents: AgendaEvent[];
    personalEvents: AgendaEvent[];
    refreshEvents: () => Promise<void>;
    addEvent: (event: CreateEventDto) => Promise<void>;
    updateEvent: (id: number, event: Partial<AgendaEvent>) => Promise<void>;
    deleteEvent: (id: number) => Promise<void>;

    // Notifications & Notices
    notifications: Notification[];
    notices: Notice[];
    refreshNotifications: () => Promise<void>;
    markNotificationRead: (id: number) => Promise<void>;
    addNotice: (notice: CreateNoticeDto) => Promise<void>;
    deleteNotice: (id: number) => Promise<void>;

    // Rewards
    rewards: Reward[];
    refreshRewards: () => Promise<void>;
    redeemReward: (rewardId: number) => Promise<void>;

    // Personal/EU Mode
    habits: PersonalHabit[];
    hobbies: Hobby[];
    wishlist: WishlistItem[];
    personalFinance: PersonalTransaction[];
    workouts: WorkoutSession[];
    meals: MealLog[];
    studySessions: StudySession[];
    cycleLog: CycleDay[];
    userSettings: UserSettings;
    personalBalance: number;
    refreshPersonal: () => Promise<void>;
    addHabit: (habit: CreateHabitDto) => Promise<void>;
    incrementHabit: (id: number) => Promise<void>;
    deleteHabit: (id: number) => Promise<void>;
    addHobby: (hobby: CreateHobbyDto) => Promise<void>;
    updateHobbyProgress: (id: number, progress: number) => Promise<void>;
    deleteHobby: (id: number) => Promise<void>;
    addWishlistItem: (item: CreateWishlistItemDto) => Promise<void>;
    updateWishlistSaved: (id: number, amount: number) => Promise<void>;
    deleteWishlistItem: (id: number) => Promise<void>;
    addPersonalTransaction: (t: CreatePersonalTransactionDto) => Promise<void>;
    deletePersonalTransaction: (id: number) => Promise<void>;
    addWorkoutSession: (w: CreateWorkoutDto) => Promise<void>;
    addMealLog: (m: CreateMealDto) => Promise<void>;
    addStudySession: (s: CreateStudySessionDto) => Promise<void>;
    addCycleDay: (d: CreateCycleDayDto) => Promise<void>;
    updateUserSettings: (s: Partial<UserSettings>) => Promise<void>;
    getProjectedInstances: (task: RecurringTask, limit?: number) => Array<{
        id: string;
        date: string;
        assignedTo: User;
    }>;

    // Real-time notifications
    toasts: ToastNotification[];
    dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const SYNC_INTERVAL_MS = ENV.USE_SIGNALR ? 60000 : 30000;
    const SIGNALR_FULL_RESYNC_MS = 5 * 60 * 1000;
    // Core State
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [contextMode, setContextMode] = useState<ContextMode>('nos');

    // Users
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

    // Tasks
    const [tasks, setTasks] = useState<RecurringTask[]>([]);

    // Finance
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);

    // Shopping & Events
    const [shopping, setShopping] = useState<ShoppingItem[]>([]);
    const [events, setEvents] = useState<AgendaEvent[]>([]);

    // Notifications
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notices, setNotices] = useState<Notice[]>([]);

    // Rewards
    const [rewards, setRewards] = useState<Reward[]>([]);

    // Personal/EU Mode
    const [habits, setHabits] = useState<PersonalHabit[]>([]);
    const [hobbies, setHobbies] = useState<Hobby[]>([]);
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [personalFinance, setPersonalFinance] = useState<PersonalTransaction[]>([]);
    const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
    const [meals, setMeals] = useState<MealLog[]>([]);
    const [studySessions, setStudySessions] = useState<StudySession[]>([]);
    const [cycleLog, setCycleLog] = useState<CycleDay[]>([]);
    const [userSettings, setUserSettings] = useState<UserSettings>({
        trackCycle: false,
        dailyWaterGoal: 2000,
        dailyCalorieGoal: 2000,
    });

    // Real-time toast notifications
    const [toasts, setToasts] = useState<ToastNotification[]>([]);
    const recentRealtimeEventsRef = useRef<Map<string, number>>(new Map());
    const realtimeRefreshThrottleRef = useRef<Map<string, number>>(new Map());
    const refreshInFlightRef = useRef<Map<string, Promise<unknown>>>(new Map());
    const lastPollingSyncRef = useRef(0);

    const runRefreshOnce = useCallback(async <T,>(key: string, work: () => Promise<T>): Promise<T> => {
        const existing = refreshInFlightRef.current.get(key) as Promise<T> | undefined;
        if (existing) return existing;

        const promise = work().finally(() => {
            if (refreshInFlightRef.current.get(key) === promise) {
                refreshInFlightRef.current.delete(key);
            }
        });

        refreshInFlightRef.current.set(key, promise);
        return promise;
    }, []);

    // Helper to add toast
    const addToast = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'info') => {
        const toast: ToastNotification = {
            id: Date.now().toString(),
            message,
            type,
            timestamp: new Date()
        };
        setToasts(prev => [...prev, toast]);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, 5000);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Computed
    const familyBalance = useMemo(() =>
        incomes.reduce((sum, i) => sum + i.amount, 0) -
        expenses.reduce((sum, e) => sum + e.amount, 0),
    [incomes, expenses]);
    const personalBalance = useMemo(() =>
        personalFinance.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0),
    [personalFinance]);
    const familyEvents = useMemo(() => events.filter(e => e.isFamily), [events]);
    const personalEvents = useMemo(() => events.filter(e => !e.isFamily), [events]);
    const featuredDebts = useMemo(() => debts.filter(d => d.paidInstallments < d.totalInstallments), [debts]);

    // ==================== REFRESH FUNCTIONS ====================

    const refreshUsers = useCallback(async (preferredUserId?: number) => {
        return runRefreshOnce('users', async () => {
            try {
                const [usersData, leaderboardData] = await Promise.all([
                    api.getUsers(),
                    api.getLeaderboard()
                ]);
                setUsers(usersData);
                setLeaderboard(leaderboardData);
                if (usersData.length > 0) {
                    const preferred = preferredUserId
                        ? usersData.find(u => u.id === preferredUserId)
                        : undefined;

                    if (preferred) {
                        setCurrentUser(preferred);
                    } else if (!currentUser) {
                        setCurrentUser(usersData[0]);
                    }
                } else {
                    setCurrentUser(null);
                }
                return usersData;
            } catch (err) {
                setError('Failed to load users');
                console.error(err);
                return [];
            }
        });
    }, [currentUser, runRefreshOnce]);

    const setCurrentUserById = useCallback((userId: number) => {
        setCurrentUser(prev => {
            if (prev?.id === userId) return prev;
            const match = users.find(u => u.id === userId);
            return match ?? prev;
        });
    }, [users]);

    const deleteUserById = useCallback(async (userId: number, requesterId: number) => {
        await api.deleteUser(userId, requesterId);
        const usersData = await refreshUsers();
        if (currentUser?.id === userId) {
            setCurrentUser(usersData[0] ?? null);
        }
    }, [refreshUsers, currentUser?.id]);

    const updateFamilyProfile = useCallback(async (
        userId: number,
        familyRole: 'master' | 'admin' | 'member',
        familyRelation?: string
    ) => {
        if (!currentUser) return;
        await api.updateFamilyProfile(userId, currentUser.id, familyRole, familyRelation);
        await refreshUsers(currentUser.id);
    }, [currentUser, refreshUsers]);

    const refreshTasks = useCallback(async () => {
        await runRefreshOnce('tasks', async () => {
            try {
                const data = await api.getTasks();
                setTasks(data);
            } catch (err) {
                console.error('Failed to load tasks:', err);
            }
        });
    }, [runRefreshOnce]);

    const refreshFinance = useCallback(async () => {
        await runRefreshOnce('finance', async () => {
            try {
                const [expensesData, incomesData, debtsData, subsData, goalsData] = await Promise.all([
                    api.getExpenses(),
                    api.getIncomes(),
                    api.getDebts(),
                    api.getSubscriptions(),
                    api.getGoals()
                ]);
                setExpenses(expensesData);
                setIncomes(incomesData);
                setDebts(debtsData);
                setSubscriptions(subsData);
                setGoals(goalsData);
            } catch (err) {
                console.error('Failed to load finance:', err);
            }
        });
    }, [runRefreshOnce]);

    const refreshShopping = useCallback(async () => {
        await runRefreshOnce('shopping', async () => {
            try {
                const data = await api.getShopping();
                setShopping(data);
            } catch (err) {
                console.error('Failed to load shopping:', err);
            }
        });
    }, [runRefreshOnce]);

    const refreshEvents = useCallback(async () => {
        await runRefreshOnce('events', async () => {
            try {
                const data = await api.getEvents();
                setEvents(data);
            } catch (err) {
                console.error('Failed to load events:', err);
            }
        });
    }, [runRefreshOnce]);

    const refreshNotifications = useCallback(async () => {
        await runRefreshOnce('notifications', async () => {
            try {
                const [notifs, noticesData] = await Promise.all([
                    api.getNotifications(currentUser?.id),
                    api.getNotices()
                ]);
                setNotifications(prev => {
                    const localRealtime = prev.filter(n => n.id < 0);
                    const merged = [...localRealtime, ...notifs];
                    const dedup = new Set<string>();
                    return merged
                        .filter((n) => {
                            const key = `${n.type}|${n.title}|${n.message}|${n.createdAt}`;
                            if (dedup.has(key)) return false;
                            dedup.add(key);
                            return true;
                        })
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 80);
                });
                setNotices(noticesData);
            } catch (err) {
                console.error('Failed to load notifications:', err);
            }
        });
    }, [currentUser, runRefreshOnce]);

    const refreshRewards = useCallback(async () => {
        await runRefreshOnce('rewards', async () => {
            try {
                const data = await api.getRewards();
                setRewards(data);
            } catch (err) {
                console.error('Failed to load rewards:', err);
            }
        });
    }, [runRefreshOnce]);

    const refreshPersonal = useCallback(async () => {
        if (!currentUser) return;
        await runRefreshOnce('personal', async () => {
            try {
                const [habitsData, hobbiesData, wishlistData, transData, workoutsData,
                    mealsData, studyData, cycleData, settingsData] = await Promise.all([
                        api.getHabits(currentUser.id),
                        api.getHobbies(currentUser.id),
                        api.getWishlist(currentUser.id),
                        api.getPersonalTransactions(currentUser.id),
                        api.getWorkouts(currentUser.id),
                        api.getMeals(currentUser.id),
                        api.getStudySessions(currentUser.id),
                        api.getCycleDays(currentUser.id),
                        api.getUserSettings(currentUser.id)
                    ]);
                setHabits(habitsData);
                setHobbies(hobbiesData);
                setWishlist(wishlistData);
                setPersonalFinance(transData);
                setWorkouts(workoutsData);
                setMeals(mealsData);
                setStudySessions(studyData);
                setCycleLog(cycleData);
                setUserSettings(settingsData);
            } catch (err) {
                console.error('Failed to load personal data:', err);
            }
        });
    }, [currentUser, runRefreshOnce]);

    const getProjectedInstances = useCallback((task: RecurringTask, limit = 20) => {
        const assignees = task.assignments?.map(a => a.user).filter(Boolean) ?? [];
        if (assignees.length === 0) return [];

        const instances: Array<{ id: string; date: string; assignedTo: User }> = [];
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        for (let i = 0; i < limit; i++) {
            const date = new Date(start);
            if (task.frequency === 'daily') {
                date.setDate(start.getDate() + i);
            } else if (task.frequency === 'weekly') {
                date.setDate(start.getDate() + (i * 7));
            } else {
                date.setDate(start.getDate() + (i * 30));
            }

            const assignedTo = assignees[i % assignees.length];
            const isoDate = date.toISOString().slice(0, 10);
            instances.push({
                id: `${task.id}-${i}`,
                date: isoDate,
                assignedTo
            });
        }

        return instances;
    }, []);

    // ==================== INITIAL LOAD ====================

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                await refreshUsers();
                // Unblock UI quickly; continue loading secondary sections in background.
                setIsLoading(false);
                void Promise.all([
                    refreshTasks(),
                    refreshFinance(),
                    refreshShopping(),
                    refreshEvents(),
                    refreshNotifications(),
                    refreshRewards()
                ]).catch((error) => {
                    console.error('Background initial load failed:', error);
                });
            } catch (err) {
                setError('Failed to load data');
                console.error(err);
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Load personal and user-scoped notifications when active user changes
    useEffect(() => {
        if (currentUser) {
            refreshPersonal();
            refreshNotifications();
        }
    }, [currentUser, refreshPersonal, refreshNotifications]);

    // ==================== SIGNALR REAL-TIME CONNECTION ====================

    useEffect(() => {
        if (!ENV.USE_SIGNALR) return;
        if (isLoading || !currentUser?.id) return;

        signalRService.connect(currentUser.id).catch((err) => {
            console.warn('SignalR connection failed (backend may be offline):', err);
        });
    }, [isLoading, currentUser?.id]);

    useEffect(() => {
        if (!ENV.USE_SIGNALR) return;
        const refreshWithThrottle = (key: string, fn: () => Promise<void>, minIntervalMs = 2500) => {
            const now = Date.now();
            const lastRun = realtimeRefreshThrottleRef.current.get(key) ?? 0;
            if (now - lastRun < minIntervalMs) return;
            realtimeRefreshThrottleRef.current.set(key, now);
            void fn();
        };

        // Subscribe to real-time notifications
        const unsubscribe = signalRService.subscribe((notification) => {
            const dedupKey = `${notification.type}:${notification.message}`;
            const now = Date.now();
            const lastSeen = recentRealtimeEventsRef.current.get(dedupKey) ?? 0;
            if (now - lastSeen < 4000) {
                return;
            }
            if (recentRealtimeEventsRef.current.size > 200) {
                recentRealtimeEventsRef.current.clear();
            }
            recentRealtimeEventsRef.current.set(dedupKey, now);

            // Show toast for all notifications
            addToast(notification.message, 'info');

            const realtimeMeta = REALTIME_NOTIFICATION_META[notification.type];
            setNotifications(prev => [
                {
                    id: -Math.floor(Date.now() + Math.random() * 1000),
                    title: realtimeMeta?.title || 'Notificação',
                    message: notification.message,
                    isRead: false,
                    type: realtimeMeta?.type || 'event',
                    createdAt: notification.timestamp || new Date().toISOString(),
                },
                ...prev
            ].slice(0, 80));

            // Refresh relevant data based on notification type
            switch (notification.type) {
                case 'TaskCompleted':
                    refreshWithThrottle('tasks', refreshTasks);
                    refreshWithThrottle('users', () => refreshUsers().then(() => undefined));
                    break;
                case 'RewardRedeemed':
                    refreshWithThrottle('users', () => refreshUsers().then(() => undefined));
                    refreshWithThrottle('rewards', refreshRewards);
                    break;
                case 'NewExpense':
                    refreshWithThrottle('finance', refreshFinance);
                    break;
                case 'GoalProgress':
                    refreshWithThrottle('finance', refreshFinance);
                    break;
                case 'ShoppingItemAdded':
                    refreshWithThrottle('shopping', refreshShopping);
                    break;
                case 'NewNotice':
                    refreshWithThrottle('notifications', refreshNotifications);
                    break;
                case 'DirectNotification':
                    refreshWithThrottle('notifications', refreshNotifications);
                    break;
            }
        });

        // Cleanup subscription only
        return () => {
            unsubscribe();
        };
    }, [currentUser?.id, addToast, refreshTasks, refreshUsers, refreshRewards, refreshFinance, refreshShopping, refreshNotifications]);

    useEffect(() => {
        if (!ENV.USE_SIGNALR) return;
        return () => {
            signalRService.disconnect();
        };
    }, []);

    // ==================== POLLING SYNC (BLOCKS) ====================
    useEffect(() => {
        if (isLoading || !currentUser?.id) return;

        let active = true;
        let inFlight = false;
        let block = 0;

        const runBlock = async () => {
            if (!active || inFlight) return;
            if (ENV.USE_SIGNALR && signalRService.connected) {
                const now = Date.now();
                if (now - lastPollingSyncRef.current < SIGNALR_FULL_RESYNC_MS) {
                    return;
                }
            }

            inFlight = true;
            try {
                switch (block % 4) {
                    case 0:
                        if (ENV.USE_SIGNALR && signalRService.connected) {
                            await refreshNotifications();
                        } else {
                            await Promise.all([refreshUsers(), refreshNotifications()]);
                        }
                        break;
                    case 1:
                        await Promise.all([refreshTasks(), refreshShopping()]);
                        break;
                    case 2:
                        await Promise.all([refreshFinance(), refreshRewards()]);
                        break;
                    default:
                        await refreshEvents();
                        break;
                }
                lastPollingSyncRef.current = Date.now();
                block++;
            } catch (error) {
                console.warn('Polling sync failed:', error);
            } finally {
                inFlight = false;
            }
        };

        const intervalId = setInterval(runBlock, SYNC_INTERVAL_MS);
        void runBlock();

        return () => {
            active = false;
            clearInterval(intervalId);
        };
    }, [
        isLoading,
        currentUser?.id,
        refreshUsers,
        refreshNotifications,
        refreshTasks,
        refreshShopping,
        refreshFinance,
        refreshRewards,
        refreshEvents,
        SIGNALR_FULL_RESYNC_MS,
    ]);

    // ==================== ACTION FUNCTIONS ======================================

    // Tasks
    const addTask = async (task: CreateTaskDto) => {
        const created = await api.createTask(task);
        setTasks(prev => [created, ...prev]);
        void refreshTasks();
    };

    const updateTask = async (id: number, updates: Partial<RecurringTask>) => {
        await api.updateTask(id, updates);
        setTasks(prev => prev.map(task => (
            task.id === id ? { ...task, ...updates } : task
        )));
        void refreshTasks();
    };

    const deleteTask = async (id: number) => {
        await api.deleteTask(id);
        setTasks(prev => prev.filter(task => task.id !== id));
        void refreshTasks();
    };

    const completeTask = async (id: number, userId?: number) => {
        if (!currentUser && !userId) return;
        const actorId = userId ?? currentUser!.id;
        await api.completeTask(id, actorId);
        setTasks(prev => prev.map(task => task.id === id
            ? {
                ...task,
                isDone: true,
                completedByUserId: actorId,
                lastCompleted: new Date().toISOString(),
            }
            : task
        ));
        void Promise.all([refreshTasks(), refreshUsers()]);
    };

    // Expenses
    const addExpense = async (expense: CreateExpenseDto) => {
        const created = await api.createExpense(expense);
        setExpenses(prev => [created, ...prev]);
        void refreshFinance();
    };

    const deleteExpense = async (id: number) => {
        await api.deleteExpense(id);
        setExpenses(prev => prev.filter(expense => expense.id !== id));
        void refreshFinance();
    };

    // Incomes
    const addIncome = async (income: CreateIncomeDto) => {
        const created = await api.createIncome(income);
        setIncomes(prev => [created, ...prev]);
        void refreshFinance();
    };

    // Debts
    const addDebt = async (debt: CreateDebtDto) => {
        const created = await api.createDebt(debt);
        setDebts(prev => [created, ...prev]);
        void refreshFinance();
    };

    const payDebtInstallment = async (id: number) => {
        const response = await api.payDebtInstallment(id);
        setDebts(prev => prev.map(debt => debt.id === id
            ? { ...debt, paidInstallments: response.paidInstallments }
            : debt
        ));
        void refreshFinance();
    };

    // Subscriptions
    const addSubscription = async (sub: CreateSubscriptionDto) => {
        const created = await api.createSubscription(sub);
        setSubscriptions(prev => [created, ...prev]);
        void refreshFinance();
    };

    // Goals
    const addGoal = async (goal: CreateGoalDto) => {
        const created = await api.createGoal(goal);
        setGoals(prev => [created, ...prev]);
        void refreshFinance();
    };

    const addContributionToGoal = async (goalId: number, amount: number, note?: string) => {
        const contribution = await api.contributeToGoal(goalId, amount, note, currentUser?.id);
        setGoals(prev => prev.map(goal => goal.id === goalId
            ? { ...goal, currentAmount: contribution.currentAmount }
            : goal
        ));
        void refreshFinance();
    };

    // Shopping
    const addShoppingItem = async (item: CreateShoppingItemDto) => {
        const created = await api.createShoppingItem(item);
        setShopping(prev => [created, ...prev]);
        void refreshShopping();
    };

    const toggleShoppingItem = async (id: number) => {
        setShopping(prev => prev.map(item =>
            item.id === id ? { ...item, isBought: !item.isBought } : item
        ));
        try {
            const response = await api.toggleShoppingItem(id);
            setShopping(prev => prev.map(item =>
                item.id === id ? { ...item, isBought: response.isBought } : item
            ));
        } catch (error) {
            setShopping(prev => prev.map(item =>
                item.id === id ? { ...item, isBought: !item.isBought } : item
            ));
            throw error;
        } finally {
            void refreshShopping();
        }
    };

    const deleteShoppingItem = async (id: number) => {
        await api.deleteShoppingItem(id);
        setShopping(prev => prev.filter(item => item.id !== id));
        void refreshShopping();
    };

    // Events
    const addEvent = async (event: CreateEventDto) => {
        const created = await api.createEvent(event);
        setEvents(prev => [created, ...prev]);
        void refreshEvents();
    };

    const updateEvent = async (id: number, event: Partial<AgendaEvent>) => {
        await api.updateEvent(id, event);
        setEvents(prev => prev.map(item => (
            item.id === id ? { ...item, ...event } : item
        )));
        void refreshEvents();
    };

    const deleteEvent = async (id: number) => {
        await api.deleteEvent(id);
        setEvents(prev => prev.filter(event => event.id !== id));
        void refreshEvents();
    };

    // Notifications
    const markNotificationRead = async (id: number) => {
        setNotifications(prev => prev.map(notification =>
            notification.id === id ? { ...notification, isRead: true } : notification
        ));
        if (id <= 0) return;
        await api.markNotificationRead(id);
        void refreshNotifications();
    };

    // Notices
    const addNotice = async (notice: CreateNoticeDto) => {
        const created = await api.createNotice(notice);
        setNotices(prev => [created, ...prev]);
        void refreshNotifications();
    };

    const deleteNotice = async (id: number) => {
        await api.deleteNotice(id);
        setNotices(prev => prev.filter(notice => notice.id !== id));
        void refreshNotifications();
    };

    // Rewards
    const redeemReward = async (rewardId: number) => {
        if (!currentUser) return;
        await api.redeemReward(rewardId, currentUser.id);
        void Promise.all([refreshUsers(), refreshRewards()]);
    };

    // Personal - Habits
    const addHabit = async (habit: CreateHabitDto) => {
        const created = await api.createHabit(habit);
        setHabits(prev => [created, ...prev]);
        void refreshPersonal();
    };

    const incrementHabit = async (id: number) => {
        await api.incrementHabit(id);
        void refreshPersonal();
    };

    const deleteHabit = async (id: number) => {
        await api.deleteHabit(id);
        setHabits(prev => prev.filter(habit => habit.id !== id));
        void refreshPersonal();
    };

    // Personal - Hobbies
    const addHobby = async (hobby: CreateHobbyDto) => {
        const created = await api.createHobby(hobby);
        setHobbies(prev => [created, ...prev]);
        void refreshPersonal();
    };

    const updateHobbyProgress = async (id: number, progress: number) => {
        const updated = await api.updateHobby(id, progress);
        setHobbies(prev => prev.map(hobby => (
            hobby.id === id ? updated : hobby
        )));
        void refreshPersonal();
    };

    const deleteHobby = async (id: number) => {
        await api.deleteHobby(id);
        setHobbies(prev => prev.filter(hobby => hobby.id !== id));
        void refreshPersonal();
    };

    // Personal - Wishlist
    const addWishlistItem = async (item: CreateWishlistItemDto) => {
        const created = await api.createWishlistItem(item);
        setWishlist(prev => [created, ...prev]);
        void refreshPersonal();
    };

    const updateWishlistSaved = async (id: number, amount: number) => {
        const updated = await api.updateWishlistSaved(id, amount);
        setWishlist(prev => prev.map(item => (
            item.id === id ? updated : item
        )));
        void refreshPersonal();
    };

    const deleteWishlistItem = async (id: number) => {
        await api.deleteWishlistItem(id);
        setWishlist(prev => prev.filter(item => item.id !== id));
        void refreshPersonal();
    };

    // Personal - Transactions
    const addPersonalTransaction = async (t: CreatePersonalTransactionDto) => {
        const created = await api.createPersonalTransaction(t);
        setPersonalFinance(prev => [created, ...prev]);
        void refreshPersonal();
    };

    const deletePersonalTransaction = async (id: number) => {
        await api.deletePersonalTransaction(id);
        setPersonalFinance(prev => prev.filter(transaction => transaction.id !== id));
        void refreshPersonal();
    };

    // Personal - Workouts, Meals, Study, Cycle
    const addWorkoutSession = async (w: CreateWorkoutDto) => {
        const created = await api.createWorkout(w);
        setWorkouts(prev => [created, ...prev]);
        void refreshPersonal();
    };

    const addMealLog = async (m: CreateMealDto) => {
        const created = await api.createMeal(m);
        setMeals(prev => [created, ...prev]);
        void refreshPersonal();
    };

    const addStudySession = async (s: CreateStudySessionDto) => {
        const created = await api.createStudySession(s);
        setStudySessions(prev => [created, ...prev]);
        void refreshPersonal();
    };

    const addCycleDay = async (d: CreateCycleDayDto) => {
        const created = await api.createCycleDay(d);
        setCycleLog(prev => [created, ...prev]);
        void refreshPersonal();
    };

    // Settings
    const updateUserSettings = async (s: Partial<UserSettings>) => {
        if (!currentUser) return;
        await api.updateUserSettings(currentUser.id, s);
        setUserSettings(prev => ({ ...prev, ...s }));
    };

    return (
        <AppContext.Provider value={{
            isLoading,
            error,
            contextMode,
            setContextMode,

            users,
            currentUser,
            setCurrentUserById,
            deleteUserById,
            updateFamilyProfile,
            leaderboard,
            refreshUsers,

            tasks,
            refreshTasks,
            addTask,
            updateTask,
            deleteTask,
            completeTask,

            expenses,
            incomes,
            debts,
            featuredDebts,
            subscriptions,
            goals,
            familyBalance,
            refreshFinance,
            addExpense,
            deleteExpense,
            addIncome,
            addDebt,
            payDebtInstallment,
            addSubscription,
            addGoal,
            addContributionToGoal,

            shopping,
            refreshShopping,
            addShoppingItem,
            toggleShoppingItem,
            deleteShoppingItem,

            familyEvents,
            personalEvents,
            refreshEvents,
            addEvent,
            updateEvent,
            deleteEvent,

            notifications,
            notices,
            refreshNotifications,
            markNotificationRead,
            addNotice,
            deleteNotice,

            rewards,
            refreshRewards,
            redeemReward,

            habits,
            hobbies,
            wishlist,
            personalFinance,
            workouts,
            meals,
            studySessions,
            cycleLog,
            userSettings,
            personalBalance,
            refreshPersonal,
            addHabit,
            incrementHabit,
            deleteHabit,
            addHobby,
            updateHobbyProgress,
            deleteHobby,
            addWishlistItem,
            updateWishlistSaved,
            deleteWishlistItem,
            addPersonalTransaction,
            deletePersonalTransaction,
            addWorkoutSession,
            addMealLog,
            addStudySession,
            addCycleDay,
            updateUserSettings,
            getProjectedInstances,

            // Real-time
            toasts,
            dismissToast,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
};
