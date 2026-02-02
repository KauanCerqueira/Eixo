import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { Activity, Dumbbell, Calendar, Clock, Flame } from 'lucide-react-native';
import { Card } from '../components/ui/Card';
import { FAB } from '../components/ui/FAB';
import { ProgressBar } from '../components/ui/ProgressBar';
import { AddWorkoutModal } from '../components/modals/AddWorkoutModal';

const WorkoutScreen = () => {
    const { workouts, habits } = useApp();
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Derived Stats
    const totalWorkouts = workouts.length;
    const totalMinutes = workouts.reduce((acc, w) => acc + (w.durationMinutes || w.durationMinutes || 0), 0);
    const totalCalories = workouts.reduce((acc, w) => acc + (w.calories || 0), 0);

    // Weekly Habit Progress (Mocking 'Treino' habit if exists)
    const workoutHabit = habits.find(h => h.category === 'fitness') || { current: 0, target: 4 };
    const progress = Math.min(100, (workoutHabit.current / workoutHabit.target) * 100);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <Text style={styles.title}>Meus Treinos</Text>
                    <Text style={styles.subtitle}>Foco, força e consistência.</Text>
                </View>

                {/* Top Stats */}
                <View style={styles.topRow}>
                    <Card style={styles.statCard}>
                        <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
                            <Clock size={18} color="#2563EB" />
                        </View>
                        <Text style={styles.statLabel}>TEMPO TOTAL</Text>
                        <Text style={styles.statValue}>{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                            <Flame size={18} color="#DC2626" />
                        </View>
                        <Text style={styles.statLabel}>CALORIAS</Text>
                        <Text style={[styles.statValue, { color: '#DC2626' }]}>{totalCalories}</Text>
                    </Card>
                </View>

                {/* Weekly Goal */}
                <Card style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Activity size={20} color="#0f172a" />
                            <Text style={styles.goalTitle}>Meta Semanal</Text>
                        </View>
                        <Text style={styles.goalProgress}>{workoutHabit.current}/{workoutHabit.target} treinos</Text>
                    </View>
                    <ProgressBar progress={progress} color={progress >= 100 ? '#10B981' : '#3B82F6'} />
                </Card>

                {/* Workout History */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>HISTÓRICO RECENTE</Text>
                </View>

                {workouts.length > 0 ? (
                    workouts.slice().reverse().map(w => (
                        <Card key={w.id} style={styles.workoutCard}>
                            <View style={styles.workoutLeft}>
                                <View style={styles.workoutIcon}>
                                    <Dumbbell size={20} color="#fff" />
                                </View>
                                <View>
                                    <Text style={styles.workoutType}>{w.type}</Text>
                                    <View style={styles.workoutMeta}>
                                        <Calendar size={12} color="#94a3b8" />
                                        <Text style={styles.workoutDate}>{new Date(w.date).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.workoutRight}>
                                <Text style={styles.workoutDuration}>{w.durationMinutes || 0} min</Text>
                                <Text style={styles.workoutCalories}>
                                    {w.intensity === 'high' ? '🔥 Intenso' : w.intensity === 'medium' ? '⚡ Moderado' : '🌱 Leve'}
                                </Text>
                            </View>
                        </Card>
                    ))
                ) : (
                    <Card style={styles.emptyCard}>
                        <Text style={styles.emptyText}>Nenhum treino registrado.</Text>
                    </Card>
                )}

            </ScrollView>

            <FAB onPress={() => setIsModalVisible(true)} />

            <AddWorkoutModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
    header: { marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b' },

    topRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statCard: { flex: 1, padding: 16, alignItems: 'flex-start' },
    iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    statLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b' },
    statValue: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginTop: 4 },

    goalCard: { padding: 16, marginBottom: 32, backgroundColor: '#f8fafc', elevation: 0 },
    goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    goalTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
    goalProgress: { fontSize: 12, color: '#64748b', fontWeight: '600' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 13, fontWeight: '900', color: '#64748b', letterSpacing: 0.5 },

    workoutCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginBottom: 12 },
    workoutLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    workoutIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center' },
    workoutType: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
    workoutMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    workoutDate: { fontSize: 12, color: '#64748b' },
    workoutRight: { alignItems: 'flex-end' },
    workoutDuration: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
    workoutCalories: { fontSize: 12, color: '#64748b', fontWeight: '600', marginTop: 2 },

    emptyCard: { padding: 32, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#94a3b8', fontStyle: 'italic' },
});

export default WorkoutScreen;
