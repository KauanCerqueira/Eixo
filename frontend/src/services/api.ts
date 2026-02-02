import { ENV } from '../config/env';

// API Configuration and Base Service
const API_BASE_URL = ENV.API_BASE;

class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            // Handle empty responses (204 No Content)
            if (response.status === 204) {
                return {} as T;
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // ==================== USERS ====================

    async getUsers() {
        return this.request<User[]>('/users');
    }

    async getUser(id: number) {
        return this.request<User>(`/users/${id}`);
    }

    async getLeaderboard() {
        return this.request<LeaderboardEntry[]>('/users/leaderboard');
    }

    async getUserSettings(userId: number) {
        return this.request<UserSettings>(`/users/${userId}/settings`);
    }

    async updateUserSettings(userId: number, settings: Partial<UserSettings>) {
        return this.request<void>(`/users/${userId}/settings`, {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    }

    // ==================== TASKS ====================

    async getTasks() {
        return this.request<RecurringTask[]>('/tasks');
    }

    async createTask(task: CreateTaskDto) {
        return this.request<RecurringTask>('/tasks', {
            method: 'POST',
            body: JSON.stringify(task),
        });
    }

    async updateTask(id: number, updates: Partial<RecurringTask>) {
        return this.request<void>(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async deleteTask(id: number) {
        return this.request<void>(`/tasks/${id}`, { method: 'DELETE' });
    }

    async completeTask(id: number, userId: number, wasLate = false, daysLate = 0) {
        return this.request<{ pointsEarned: number }>(`/tasks/${id}/complete`, {
            method: 'POST',
            body: JSON.stringify({ userId, wasLate, daysLate }),
        });
    }

    // ==================== EXPENSES ====================

    async getExpenses() {
        return this.request<Expense[]>('/expenses');
    }

    async createExpense(expense: CreateExpenseDto) {
        return this.request<Expense>('/expenses', {
            method: 'POST',
            body: JSON.stringify(expense),
        });
    }

    async deleteExpense(id: number) {
        return this.request<void>(`/expenses/${id}`, { method: 'DELETE' });
    }

    // ==================== INCOMES ====================

    async getIncomes() {
        return this.request<Income[]>('/incomes');
    }

    async createIncome(income: CreateIncomeDto) {
        return this.request<Income>('/incomes', {
            method: 'POST',
            body: JSON.stringify(income),
        });
    }

    async deleteIncome(id: number) {
        return this.request<void>(`/incomes/${id}`, { method: 'DELETE' });
    }

    // ==================== DEBTS ====================

    async getDebts() {
        return this.request<Debt[]>('/debts');
    }

    async createDebt(debt: CreateDebtDto) {
        return this.request<Debt>('/debts', {
            method: 'POST',
            body: JSON.stringify(debt),
        });
    }

    async payDebtInstallment(id: number) {
        return this.request<{ paidInstallments: number; remaining: number }>(`/debts/${id}/pay`, {
            method: 'POST',
        });
    }

    async deleteDebt(id: number) {
        return this.request<void>(`/debts/${id}`, { method: 'DELETE' });
    }

    // ==================== SUBSCRIPTIONS ====================

    async getSubscriptions() {
        return this.request<Subscription[]>('/subscriptions');
    }

    async createSubscription(sub: CreateSubscriptionDto) {
        return this.request<Subscription>('/subscriptions', {
            method: 'POST',
            body: JSON.stringify(sub),
        });
    }

    async deleteSubscription(id: number) {
        return this.request<void>(`/subscriptions/${id}`, { method: 'DELETE' });
    }

    // ==================== GOALS ====================

    async getGoals() {
        return this.request<Goal[]>('/goals');
    }

    async createGoal(goal: CreateGoalDto) {
        return this.request<Goal>('/goals', {
            method: 'POST',
            body: JSON.stringify(goal),
        });
    }

    async contributeToGoal(id: number, amount: number, note?: string) {
        return this.request<{ currentAmount: number; progress: number }>(`/goals/${id}/contribute`, {
            method: 'POST',
            body: JSON.stringify({ amount, note }),
        });
    }

    async deleteGoal(id: number) {
        return this.request<void>(`/goals/${id}`, { method: 'DELETE' });
    }

    // ==================== SHOPPING ====================

    async getShopping() {
        return this.request<ShoppingItem[]>('/shopping');
    }

    async createShoppingItem(item: CreateShoppingItemDto) {
        return this.request<ShoppingItem>('/shopping', {
            method: 'POST',
            body: JSON.stringify(item),
        });
    }

    async toggleShoppingItem(id: number) {
        return this.request<{ isBought: boolean }>(`/shopping/${id}/toggle`, {
            method: 'PUT',
        });
    }

    async deleteShoppingItem(id: number) {
        return this.request<void>(`/shopping/${id}`, { method: 'DELETE' });
    }

    // ==================== EVENTS ====================

    async getEvents() {
        return this.request<AgendaEvent[]>('/events');
    }

    async createEvent(event: CreateEventDto) {
        return this.request<AgendaEvent>('/events', {
            method: 'POST',
            body: JSON.stringify(event),
        });
    }

    async deleteEvent(id: number) {
        return this.request<void>(`/events/${id}`, { method: 'DELETE' });
    }

    // ==================== NOTIFICATIONS ====================

    async getNotifications(userId?: number) {
        const query = userId ? `?userId=${userId}` : '';
        return this.request<Notification[]>(`/notifications${query}`);
    }

    async markNotificationRead(id: number) {
        return this.request<void>(`/notifications/${id}/read`, { method: 'PUT' });
    }

    // ==================== NOTICES ====================

    async getNotices() {
        return this.request<Notice[]>('/notices');
    }

    async createNotice(notice: CreateNoticeDto) {
        return this.request<Notice>('/notices', {
            method: 'POST',
            body: JSON.stringify(notice),
        });
    }

    async deleteNotice(id: number) {
        return this.request<void>(`/notices/${id}`, { method: 'DELETE' });
    }

    // ==================== REWARDS ====================

    async getRewards() {
        return this.request<Reward[]>('/rewards');
    }

    async redeemReward(rewardId: number, userId: number) {
        return this.request<{ remainingPoints: number; message: string }>(`/rewards/${rewardId}/redeem`, {
            method: 'POST',
            body: JSON.stringify({ userId }),
        });
    }

    // ==================== PERSONAL (EU MODE) ====================

    async getPersonalTransactions(userId: number) {
        return this.request<PersonalTransaction[]>(`/personal/transactions?userId=${userId}`);
    }

    async createPersonalTransaction(transaction: CreatePersonalTransactionDto) {
        return this.request<PersonalTransaction>('/personal/transactions', {
            method: 'POST',
            body: JSON.stringify(transaction),
        });
    }

    async deletePersonalTransaction(id: number) {
        return this.request<void>(`/personal/transactions/${id}`, { method: 'DELETE' });
    }

    async getHabits(userId: number) {
        return this.request<PersonalHabit[]>(`/personal/habits?userId=${userId}`);
    }

    async createHabit(habit: CreateHabitDto) {
        return this.request<PersonalHabit>('/personal/habits', {
            method: 'POST',
            body: JSON.stringify(habit),
        });
    }

    async incrementHabit(id: number) {
        return this.request<{ current: number; target: number }>(`/personal/habits/${id}/increment`, {
            method: 'PUT',
        });
    }

    async deleteHabit(id: number) {
        return this.request<void>(`/personal/habits/${id}`, { method: 'DELETE' });
    }

    async getHobbies(userId: number) {
        return this.request<Hobby[]>(`/personal/hobbies?userId=${userId}`);
    }

    async createHobby(hobby: CreateHobbyDto) {
        return this.request<Hobby>('/personal/hobbies', {
            method: 'POST',
            body: JSON.stringify(hobby),
        });
    }

    async updateHobby(id: number, progress?: number, newNote?: string) {
        return this.request<Hobby>(`/personal/hobbies/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ progress, newNote }),
        });
    }

    async deleteHobby(id: number) {
        return this.request<void>(`/personal/hobbies/${id}`, { method: 'DELETE' });
    }

    async getWishlist(userId: number) {
        return this.request<WishlistItem[]>(`/personal/wishlist?userId=${userId}`);
    }

    async createWishlistItem(item: CreateWishlistItemDto) {
        return this.request<WishlistItem>('/personal/wishlist', {
            method: 'POST',
            body: JSON.stringify(item),
        });
    }

    async updateWishlistSaved(id: number, addToSaved: number) {
        return this.request<WishlistItem>(`/personal/wishlist/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ addToSaved }),
        });
    }

    async deleteWishlistItem(id: number) {
        return this.request<void>(`/personal/wishlist/${id}`, { method: 'DELETE' });
    }

    async getWorkouts(userId: number) {
        return this.request<WorkoutSession[]>(`/personal/workouts?userId=${userId}`);
    }

    async createWorkout(workout: CreateWorkoutDto) {
        return this.request<WorkoutSession>('/personal/workouts', {
            method: 'POST',
            body: JSON.stringify(workout),
        });
    }

    async getMeals(userId: number, date?: string) {
        const query = date ? `&date=${date}` : '';
        return this.request<MealLog[]>(`/personal/meals?userId=${userId}${query}`);
    }

    async createMeal(meal: CreateMealDto) {
        return this.request<MealLog>('/personal/meals', {
            method: 'POST',
            body: JSON.stringify(meal),
        });
    }

    async getStudySessions(userId: number) {
        return this.request<StudySession[]>(`/personal/study?userId=${userId}`);
    }

    async createStudySession(session: CreateStudySessionDto) {
        return this.request<StudySession>('/personal/study', {
            method: 'POST',
            body: JSON.stringify(session),
        });
    }

    async getCycleDays(userId: number) {
        return this.request<CycleDay[]>(`/personal/cycle?userId=${userId}`);
    }

    async createCycleDay(cycleDay: CreateCycleDayDto) {
        return this.request<CycleDay>('/personal/cycle', {
            method: 'POST',
            body: JSON.stringify(cycleDay),
        });
    }
}

// Export singleton instance
export const api = new ApiService();

// Types for API DTOs
export interface User {
    id: number;
    name: string;
    initials: string;
    color: string;
    points: number;
    xp: number;
    level: number;
    streak: number;
    tasksCompleted: number;
}

export interface LeaderboardEntry {
    id: number;
    name: string;
    initials: string;
    color: string;
    points: number;
    xp: number;
    level: number;
    streak: number;
    tasksCompleted: number;
}

export interface UserSettings {
    id?: number;
    userId?: number;
    trackCycle: boolean;
    dailyWaterGoal: number;
    dailyCalorieGoal: number;
    weight?: number;
    height?: number;
    birthDate?: string;
    bio?: string;
    focusHealth?: number;
    focusCareer?: number;
    focusSocial?: number;
    focusSpirit?: number;
}

export interface RecurringTask {
    id: number;
    title: string;
    category: string;
    frequency: string;
    type: string;
    scheduledDate?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    pointsOnTime: number;
    pointsLatePerDay: number;
    isDone: boolean;
    lastCompleted?: string;
    completedByUserId?: number;
    distributionStrategy: string;
    currentAssigneeIndex: number;
    assignments?: { userId: number; user: User; order: number }[];
}

export interface Expense {
    id: number;
    title: string;
    amount: number;
    category: string;
    paidByUserId: number;
    paidBy?: User;
    date: string;
    splits?: { userId: number; user?: User; shareAmount: number }[];
}

export interface Income {
    id: number;
    title: string;
    amount: number;
    category: string;
    receivedByUserId: number;
    receivedBy?: User;
    date: string;
}

export interface Debt {
    id: number;
    title: string;
    description?: string;
    totalAmount: number;
    installmentAmount: number;
    totalInstallments: number;
    paidInstallments: number;
    dueDateDay: number;
    ownerUserId: number;
    owner?: User;
}

export interface Subscription {
    id: number;
    title: string;
    amount: number;
    dueDateDay: number;
    category: string;
    isActive: boolean;
}

export interface Goal {
    id: number;
    title: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    type: string;
    unit: string;
}

export interface ShoppingItem {
    id: number;
    name: string;
    quantity: string;
    isBought: boolean;
    addedByUserId: number;
    addedBy?: User;
}

export interface AgendaEvent {
    id: number;
    title: string;
    date: string;
    time?: string;
    isFamily: boolean;
    type: string;
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    isRead: boolean;
    type: string;
    createdAt: string;
}

export interface Notice {
    id: number;
    text: string;
    authorId: number;
    author?: User;
    type: string;
    createdAt: string;
}

export interface Reward {
    id: number;
    title: string;
    cost: number;
    icon: string;
    description?: string;
}

export interface PersonalTransaction {
    id: number;
    userId: number;
    title: string;
    amount: number;
    type: string;
    category: string;
    description?: string;
    date: string;
}

export interface PersonalHabit {
    id: number;
    userId: number;
    title: string;
    category: string;
    current: number;
    target: number;
    unit: string;
    color: string;
}

export interface Hobby {
    id: number;
    userId: number;
    title: string;
    category: string;
    progress: number;
    notes?: { id: number; text: string; createdAt: string }[];
}

export interface WishlistItem {
    id: number;
    userId: number;
    title: string;
    price: number;
    saved: number;
    priority: string;
}

export interface WorkoutSession {
    id: number;
    userId: number;
    date: string;
    name: string;
    durationMinutes: number;
    calories?: number;
    intensity?: string;
    notes?: string;
}

export interface MealLog {
    id: number;
    userId: number;
    date: string;
    type: string;
    items: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    waterIntakeMl: number;
}

export interface StudySession {
    id: number;
    userId: number;
    date: string;
    subject: string;
    durationMinutes: number;
    notes?: string;
}

export interface CycleDay {
    id: number;
    userId: number;
    date: string;
    flowIntensity?: string;
    symptoms: string;
    mood?: string;
    notes?: string;
}

// Create DTOs
export interface CreateTaskDto {
    title: string;
    category?: string;
    frequency?: string;
    type?: string;
    scheduledDate?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    pointsOnTime?: number;
    pointsLatePerDay?: number;
    distributionStrategy?: string;
    assignedUserIds?: number[];
}

export interface CreateExpenseDto {
    title: string;
    amount: number;
    category?: string;
    paidByUserId: number;
    date?: string;
    splitWithUserIds?: number[];
}

export interface CreateIncomeDto {
    title: string;
    amount: number;
    category?: string;
    receivedByUserId: number;
    date?: string;
}

export interface CreateDebtDto {
    title: string;
    totalAmount: number;
    installmentAmount: number;
    totalInstallments: number;
    dueDateDay?: number;
    ownerUserId: number;
    description?: string;
}

export interface CreateSubscriptionDto {
    title: string;
    amount: number;
    dueDateDay?: number;
    category?: string;
}

export interface CreateGoalDto {
    title: string;
    description: string;
    targetAmount: number;
    deadline?: string;
    type?: string;
    unit?: string;
}

export interface CreateShoppingItemDto {
    name: string;
    quantity?: string;
    addedByUserId: number;
}

export interface CreateEventDto {
    title: string;
    date: string;
    time?: string;
    isFamily?: boolean;
}

export interface CreateNoticeDto {
    text: string;
    authorId: number;
    type?: string;
}

export interface CreatePersonalTransactionDto {
    userId: number;
    title: string;
    amount: number;
    type?: string;
    category?: string;
    description?: string;
    date?: string;
}

export interface CreateHabitDto {
    userId: number;
    title: string;
    category?: string;
    target?: number;
    unit?: string;
    color?: string;
}

export interface CreateHobbyDto {
    userId: number;
    title: string;
    category?: string;
}

export interface CreateWishlistItemDto {
    userId: number;
    title: string;
    price: number;
    priority?: string;
}

export interface CreateWorkoutDto {
    userId: number;
    name: string;
    date?: string;
    durationMinutes?: number;
    calories?: number;
    intensity?: string;
    notes?: string;
}

export interface CreateMealDto {
    userId: number;
    type?: string;
    items?: string[];
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    waterIntakeMl?: number;
    date?: string;
}

export interface CreateStudySessionDto {
    userId: number;
    subject: string;
    durationMinutes: number;
    notes?: string;
    date?: string;
}

export interface CreateCycleDayDto {
    userId: number;
    date: string;
    flowIntensity?: string;
    symptoms?: string[];
    mood?: string;
    notes?: string;
}
