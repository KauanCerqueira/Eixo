import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
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

export type ContextMode = 'nos' | 'eu';

// Real-time notification for toast display
export interface ToastNotification {
    id: string;
    message: string;
    type: 'success' | 'info' | 'warning';
    timestamp: Date;
}

interface AppContextType {
    // State
    isLoading: boolean;
    error: string | null;
    contextMode: ContextMode;
    setContextMode: (mode: ContextMode) => void;

    // Users
    users: User[];
    currentUser: User | null;
    leaderboard: LeaderboardEntry[];
    refreshUsers: () => Promise<void>;

    // Tasks
    tasks: RecurringTask[];
    refreshTasks: () => Promise<void>;
    addTask: (task: CreateTaskDto) => Promise<void>;
    updateTask: (id: number, updates: Partial<RecurringTask>) => Promise<void>;
    deleteTask: (id: number) => Promise<void>;
    completeTask: (id: number) => Promise<void>;

    // Finance
    expenses: Expense[];
    incomes: Income[];
    debts: Debt[];
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
    addContributionToGoal: (goalId: number, amount: number) => Promise<void>;

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

    // Real-time notifications
    toasts: ToastNotification[];
    dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
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
    const familyBalance = incomes.reduce((sum, i) => sum + i.amount, 0) -
        expenses.reduce((sum, e) => sum + e.amount, 0);
    const personalBalance = personalFinance
        .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
    const familyEvents = events.filter(e => e.isFamily);
    const personalEvents = events.filter(e => !e.isFamily);

    // ==================== REFRESH FUNCTIONS ====================

    const refreshUsers = useCallback(async () => {
        try {
            const [usersData, leaderboardData] = await Promise.all([
                api.getUsers(),
                api.getLeaderboard()
            ]);
            setUsers(usersData);
            setLeaderboard(leaderboardData);
            if (usersData.length > 0 && !currentUser) {
                setCurrentUser(usersData[0]);
            }
        } catch (err) {
            setError('Failed to load users');
            console.error(err);
        }
    }, [currentUser]);

    const refreshTasks = useCallback(async () => {
        try {
            const data = await api.getTasks();
            setTasks(data);
        } catch (err) {
            console.error('Failed to load tasks:', err);
        }
    }, []);

    const refreshFinance = useCallback(async () => {
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
    }, []);

    const refreshShopping = useCallback(async () => {
        try {
            const data = await api.getShopping();
            setShopping(data);
        } catch (err) {
            console.error('Failed to load shopping:', err);
        }
    }, []);

    const refreshEvents = useCallback(async () => {
        try {
            const data = await api.getEvents();
            setEvents(data);
        } catch (err) {
            console.error('Failed to load events:', err);
        }
    }, []);

    const refreshNotifications = useCallback(async () => {
        try {
            const [notifs, noticesData] = await Promise.all([
                api.getNotifications(currentUser?.id),
                api.getNotices()
            ]);
            setNotifications(notifs);
            setNotices(noticesData);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        }
    }, [currentUser]);

    const refreshRewards = useCallback(async () => {
        try {
            const data = await api.getRewards();
            setRewards(data);
        } catch (err) {
            console.error('Failed to load rewards:', err);
        }
    }, []);

    const refreshPersonal = useCallback(async () => {
        if (!currentUser) return;
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
    }, [currentUser]);

    // ==================== INITIAL LOAD ====================

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                await refreshUsers();
                await Promise.all([
                    refreshTasks(),
                    refreshFinance(),
                    refreshShopping(),
                    refreshEvents(),
                    refreshNotifications(),
                    refreshRewards()
                ]);
            } catch (err) {
                setError('Failed to load data');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Load personal data when user changes
    useEffect(() => {
        if (currentUser) {
            refreshPersonal();
        }
    }, [currentUser, refreshPersonal]);

    // ==================== SIGNALR REAL-TIME CONNECTION ====================

    useEffect(() => {
        // Connect to SignalR hub
        const connectSignalR = async () => {
            try {
                await signalRService.connect(currentUser?.id);
            } catch (err) {
                console.warn('SignalR connection failed (backend may be offline):', err);
            }
        };

        if (!isLoading) {
            connectSignalR();
        }

        // Subscribe to real-time notifications
        const unsubscribe = signalRService.subscribe((notification) => {
            // Show toast for all notifications
            addToast(notification.message, 'info');

            // Refresh relevant data based on notification type
            switch (notification.type) {
                case 'TaskCompleted':
                    refreshTasks();
                    refreshUsers();
                    break;
                case 'RewardRedeemed':
                    refreshUsers();
                    refreshRewards();
                    break;
                case 'NewExpense':
                    refreshFinance();
                    break;
                case 'GoalProgress':
                    refreshFinance();
                    break;
                case 'ShoppingItemAdded':
                    refreshShopping();
                    break;
                case 'NewNotice':
                    refreshNotifications();
                    break;
                case 'DirectNotification':
                    refreshNotifications();
                    break;
            }
        });

        // Cleanup on unmount
        return () => {
            unsubscribe();
            signalRService.disconnect();
        };
    }, [isLoading, currentUser, addToast, refreshTasks, refreshUsers, refreshRewards, refreshFinance, refreshShopping, refreshNotifications]);

    // ==================== ACTION FUNCTIONS ======================================

    // Tasks
    const addTask = async (task: CreateTaskDto) => {
        await api.createTask(task);
        await refreshTasks();
    };

    const updateTask = async (id: number, updates: Partial<RecurringTask>) => {
        await api.updateTask(id, updates);
        await refreshTasks();
    };

    const deleteTask = async (id: number) => {
        await api.deleteTask(id);
        await refreshTasks();
    };

    const completeTask = async (id: number) => {
        if (!currentUser) return;
        await api.completeTask(id, currentUser.id);
        await Promise.all([refreshTasks(), refreshUsers()]);
    };

    // Expenses
    const addExpense = async (expense: CreateExpenseDto) => {
        await api.createExpense(expense);
        await refreshFinance();
    };

    const deleteExpense = async (id: number) => {
        await api.deleteExpense(id);
        await refreshFinance();
    };

    // Incomes
    const addIncome = async (income: CreateIncomeDto) => {
        await api.createIncome(income);
        await refreshFinance();
    };

    // Debts
    const addDebt = async (debt: CreateDebtDto) => {
        await api.createDebt(debt);
        await refreshFinance();
    };

    const payDebtInstallment = async (id: number) => {
        await api.payDebtInstallment(id);
        await refreshFinance();
    };

    // Subscriptions
    const addSubscription = async (sub: CreateSubscriptionDto) => {
        await api.createSubscription(sub);
        await refreshFinance();
    };

    // Goals
    const addGoal = async (goal: CreateGoalDto) => {
        await api.createGoal(goal);
        await refreshFinance();
    };

    const addContributionToGoal = async (goalId: number, amount: number) => {
        await api.contributeToGoal(goalId, amount);
        await refreshFinance();
    };

    // Shopping
    const addShoppingItem = async (item: CreateShoppingItemDto) => {
        await api.createShoppingItem(item);
        await refreshShopping();
    };

    const toggleShoppingItem = async (id: number) => {
        await api.toggleShoppingItem(id);
        await refreshShopping();
    };

    const deleteShoppingItem = async (id: number) => {
        await api.deleteShoppingItem(id);
        await refreshShopping();
    };

    // Events
    const addEvent = async (event: CreateEventDto) => {
        await api.createEvent(event);
        await refreshEvents();
    };

    const deleteEvent = async (id: number) => {
        await api.deleteEvent(id);
        await refreshEvents();
    };

    // Notifications
    const markNotificationRead = async (id: number) => {
        await api.markNotificationRead(id);
        await refreshNotifications();
    };

    // Notices
    const addNotice = async (notice: CreateNoticeDto) => {
        await api.createNotice(notice);
        await refreshNotifications();
    };

    const deleteNotice = async (id: number) => {
        await api.deleteNotice(id);
        await refreshNotifications();
    };

    // Rewards
    const redeemReward = async (rewardId: number) => {
        if (!currentUser) return;
        await api.redeemReward(rewardId, currentUser.id);
        await Promise.all([refreshUsers(), refreshRewards()]);
    };

    // Personal - Habits
    const addHabit = async (habit: CreateHabitDto) => {
        await api.createHabit(habit);
        await refreshPersonal();
    };

    const incrementHabit = async (id: number) => {
        await api.incrementHabit(id);
        await refreshPersonal();
    };

    const deleteHabit = async (id: number) => {
        await api.deleteHabit(id);
        await refreshPersonal();
    };

    // Personal - Hobbies
    const addHobby = async (hobby: CreateHobbyDto) => {
        await api.createHobby(hobby);
        await refreshPersonal();
    };

    const updateHobbyProgress = async (id: number, progress: number) => {
        await api.updateHobby(id, progress);
        await refreshPersonal();
    };

    const deleteHobby = async (id: number) => {
        await api.deleteHobby(id);
        await refreshPersonal();
    };

    // Personal - Wishlist
    const addWishlistItem = async (item: CreateWishlistItemDto) => {
        await api.createWishlistItem(item);
        await refreshPersonal();
    };

    const updateWishlistSaved = async (id: number, amount: number) => {
        await api.updateWishlistSaved(id, amount);
        await refreshPersonal();
    };

    const deleteWishlistItem = async (id: number) => {
        await api.deleteWishlistItem(id);
        await refreshPersonal();
    };

    // Personal - Transactions
    const addPersonalTransaction = async (t: CreatePersonalTransactionDto) => {
        await api.createPersonalTransaction(t);
        await refreshPersonal();
    };

    const deletePersonalTransaction = async (id: number) => {
        await api.deletePersonalTransaction(id);
        await refreshPersonal();
    };

    // Personal - Workouts, Meals, Study, Cycle
    const addWorkoutSession = async (w: CreateWorkoutDto) => {
        await api.createWorkout(w);
        await refreshPersonal();
    };

    const addMealLog = async (m: CreateMealDto) => {
        await api.createMeal(m);
        await refreshPersonal();
    };

    const addStudySession = async (s: CreateStudySessionDto) => {
        await api.createStudySession(s);
        await refreshPersonal();
    };

    const addCycleDay = async (d: CreateCycleDayDto) => {
        await api.createCycleDay(d);
        await refreshPersonal();
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
