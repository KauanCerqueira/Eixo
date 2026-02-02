// Re-export types from API service for backwards compatibility
export type {
    User, UserSettings, RecurringTask, Expense, Income, Debt, Subscription, Goal,
    ShoppingItem, AgendaEvent, Notification, Notice, Reward, PersonalHabit, Hobby,
    WishlistItem, PersonalTransaction, WorkoutSession, MealLog, StudySession, CycleDay,
    LeaderboardEntry
} from '../services/api';

export type ContextMode = 'nos' | 'eu';

// Constants (these don't come from API)
export const LEVELS = [
    { level: 1, minXp: 0, title: 'Iniciante' },
    { level: 2, minXp: 1000, title: 'Aprendiz' },
    { level: 3, minXp: 2500, title: 'Praticante' },
    { level: 4, minXp: 5000, title: 'Especialista' },
    { level: 5, minXp: 10000, title: 'Mestre do Lar' },
];

export const TASK_CATEGORIES = [
    { id: 'casa', label: 'Casa', icon: '🏠' },
    { id: 'compras', label: 'Compras', icon: '🛒' },
    { id: 'pagamentos', label: 'Pagamentos', icon: '💰' },
    { id: 'manutencao', label: 'Manutenção', icon: '🔧' },
];

export const EXPENSE_CATEGORIES = [
    { id: 'moradia', label: 'Moradia', icon: '🏠', color: '#3B82F6' },
    { id: 'alimentacao', label: 'Alimentação', icon: '🍔', color: '#22C55E' },
    { id: 'lazer', label: 'Lazer', icon: '🎮', color: '#8B5CF6' },
    { id: 'transporte', label: 'Transporte', icon: '🚗', color: '#F59E0B' },
    { id: 'outros', label: 'Outros', icon: '📦', color: '#64748B' },
];

export const INCOME_CATEGORIES = [
    { id: 'salario', label: 'Salário', icon: '💼', color: '#10B981' },
    { id: 'extra', label: 'Renda Extra', icon: '✨', color: '#F59E0B' },
    { id: 'investimento', label: 'Investimento', icon: '📈', color: '#3B82F6' },
    { id: 'venda', label: 'Vendas', icon: '🤝', color: '#8B5CF6' },
];

export const HABIT_CATEGORIES = [
    { id: 'saude', label: 'Saúde', icon: '❤️' },
    { id: 'fitness', label: 'Fitness', icon: '💪' },
    { id: 'estudo', label: 'Estudos', icon: '📚' },
    { id: 'produtividade', label: 'Produtividade', icon: '⚡' },
];

export const FREQUENCY_OPTIONS = [
    { id: 'daily', label: 'Diário' },
    { id: 'weekly', label: 'Semanal' },
    { id: 'monthly', label: 'Mensal' },
];

export const DAYS_OF_WEEK = [
    { id: 0, label: 'Domingo' },
    { id: 1, label: 'Segunda' },
    { id: 2, label: 'Terça' },
    { id: 3, label: 'Quarta' },
    { id: 4, label: 'Quinta' },
    { id: 5, label: 'Sexta' },
    { id: 6, label: 'Sábado' },
];

// Legacy interfaces for backwards compatibility (now using API types)
export interface UserPoints {
    user: { id: number; name: string; initials: string; color: string };
    points: number;
    streak: number;
}

export interface TaskInstance {
    id: string;
    taskId: number;
    taskTitle: string;
    date: string;
    assignedTo: { id: number; name: string; initials: string; color: string };
    isDone: boolean;
    pointsPotential: number;
}
