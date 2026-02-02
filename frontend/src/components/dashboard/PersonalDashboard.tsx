import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Banknote, Dumbbell, Moon, Utensils, BookOpen, CheckCircle, TrendingUp } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Helper for quick stats
const StatBox = ({ icon, value, label, color, onPress }: any) => (
    <TouchableOpacity style={[styles.statBox, { backgroundColor: color + '15', borderColor: color + '30' }]} onPress={onPress}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            {icon}
        </View>
        <Text style={[styles.statValue, { color: color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
);

export const PersonalDashboard = () => {
    const {
        habits, incrementHabit,
        personalBalance, personalFinance,
        workouts,
        cycleLog, userSettings,
        studySessions
    } = useApp();
    const navigation = useNavigation<any>();

    // Calc Finance
    const incomeThisMonth = personalFinance
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);
    const expenseThisMonth = personalFinance
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    // Calc Habits
    const completedHabits = habits.filter(h => h.current >= h.target).length;
    const progressHabits = habits.length > 0 ? (completedHabits / habits.length) * 100 : 0;

    // Calc Workout
    const lastWorkout = workouts[workouts.length - 1];

    // Calc Cycle
    const cycleText = userSettings.trackCycle ? '12 dias' : 'Off'; // Mock value as in CycleScreen

    return (
        <View style={styles.container}>

            {/* 1. Quick Financial Overview */}
            <Card style={styles.balanceCard}>
                <View style={styles.balanceHeader}>
                    <Text style={styles.balanceLabel}>SALDO ATUAL</Text>
                    <TrendingUp size={16} color="#10B981" />
                </View>
                <Text style={styles.balanceValue}>R$ {personalBalance.toFixed(2)}</Text>

                <View style={styles.financeRow}>
                    <View>
                        <Text style={styles.financeLabel}>Entradas</Text>
                        <Text style={[styles.financeNum, { color: '#10B981' }]}>+R$ {incomeThisMonth.toFixed(0)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View>
                        <Text style={styles.financeLabel}>Saídas</Text>
                        <Text style={[styles.financeNum, { color: '#EF4444' }]}>-R$ {expenseThisMonth.toFixed(0)}</Text>
                    </View>
                </View>
            </Card>

            {/* 2. Grid Shortcuts */}
            <View style={styles.gridContainer}>
                <StatBox
                    icon={<Dumbbell size={20} color="#F59E0B" />}
                    value={workouts.length.toString()}
                    label="Treinos/Mês"
                    color="#F59E0B"
                    onPress={() => navigation.navigate('Workout')}
                />
                <StatBox
                    icon={<BookOpen size={20} color="#3B82F6" />}
                    value={studySessions.length.toString()}
                    label="Sessões Estudo"
                    color="#3B82F6"
                    onPress={() => navigation.navigate('Study')}
                />
                {userSettings.trackCycle && (
                    <StatBox
                        icon={<Moon size={20} color="#8B5CF6" />}
                        value={cycleText}
                        label="Próx. Ciclo"
                        color="#8B5CF6"
                        onPress={() => navigation.navigate('Cycle')}
                    />
                )}
                <StatBox
                    icon={<Utensils size={20} color="#EC4899" />}
                    value="1.8k"
                    label="Kcal Hoje"
                    color="#EC4899"
                    onPress={() => navigation.navigate('Diet')}
                />
            </View>

            {/* 3. Habits Tracker Quick View */}
            <Text style={styles.sectionTitle}>HÁBITOS DIÁRIOS</Text>
            <View style={styles.habitsRow}>
                {habits.map(habit => {
                    const isDone = habit.current >= habit.target;
                    return (
                        <TouchableOpacity
                            key={habit.id}
                            style={[styles.habitPill, isDone && { backgroundColor: habit.color + '20', borderColor: habit.color }]}
                            onPress={() => incrementHabit(habit.id)}
                        >
                            <View style={[styles.habitDot, { backgroundColor: isDone ? habit.color : '#cbd5e1' }]} />
                            <Text style={[styles.habitText, isDone && { color: habit.color, fontWeight: 'bold' }]}>{habit.title}</Text>
                            <Text style={styles.habitCount}>{habit.current}/{habit.target}</Text>
                        </TouchableOpacity>
                    );
                })}
                {habits.length === 0 && (
                    <Text style={styles.emptyText}>Nenhum hábito definido.</Text>
                )}
            </View>

            {/* 4. Last Activity */}
            <Text style={styles.sectionTitle}>ÚLTIMA ATIVIDADE</Text>
            {lastWorkout ? (
                <Card style={styles.activityCard}>
                    <View style={styles.activityIcon}>
                        <Dumbbell size={20} color="#fff" />
                    </View>
                    <View>
                        <Text style={styles.activityTitle}>{lastWorkout.name}</Text>
                        <Text style={styles.activityDate}>Ontem • {lastWorkout.durationMinutes} min</Text>
                    </View>
                </Card>
            ) : (
                <Card style={{ padding: 16 }}>
                    <Text style={styles.emptyText}>Nenhuma atividade recente registrada.</Text>
                </Card>
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    container: { gap: 20 },

    // Balance
    balanceCard: { padding: 20, backgroundColor: '#0f172a' },
    balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    balanceLabel: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
    balanceValue: { color: '#fff', fontSize: 32, fontWeight: '900' },
    financeRow: { flexDirection: 'row', marginTop: 20 },
    financeLabel: { color: '#64748b', fontSize: 12 },
    financeNum: { fontSize: 16, fontWeight: 'bold', marginTop: 2 },
    divider: { width: 1, backgroundColor: '#334155', marginHorizontal: 20 },

    // Grid
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statBox: { width: (width - 52) / 2, padding: 16, borderRadius: 16, borderWidth: 1, backgroundColor: '#fff' },
    statValue: { fontSize: 20, fontWeight: '900', marginBottom: 2 },
    statLabel: { fontSize: 12, opacity: 0.8, fontWeight: '600' },

    // Habits
    sectionTitle: { fontSize: 13, fontWeight: '900', color: '#64748b', marginLeft: 4, marginBottom: 8, letterSpacing: 0.5 },
    habitsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    habitPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, paddingHorizontal: 16, gap: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    habitText: { fontSize: 14, color: '#334155', fontWeight: '500' },
    habitDot: { width: 8, height: 8, borderRadius: 4 },
    habitCount: { fontSize: 12, color: '#94a3b8' },

    emptyText: { color: '#94a3b8', fontStyle: 'italic', fontSize: 13 },

    // Activity
    activityCard: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
    activityIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center' },
    activityTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
    activityDate: { fontSize: 13, color: '#64748b' }
});
