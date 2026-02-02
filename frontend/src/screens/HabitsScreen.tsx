import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Plus, TrendingUp, CheckCircle, Activity } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { AddButton } from '../components/ui/FAB';
import { AddHabitModal } from '../components/modals/AddHabitModal';
import { ProgressChart } from '../components/charts/ProgressChart';

export const HabitsScreen = () => {
    const { habits, incrementHabit } = useApp();
    const [modalVisible, setModalVisible] = useState(false);

    // Mock data for chart
    const weeklyData = [60, 80, 50, 90, 70, 85, 95];
    const weeklyLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>

                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Meus Hábitos</Text>
                        <Text style={styles.subtitle}>Construindo um eu melhor, dia a dia.</Text>
                    </View>
                    <AddButton onPress={() => setModalVisible(true)} />
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <Card style={styles.statCard}>
                        <Activity size={24} color="#3B82F6" />
                        <Text style={styles.statNum}>{habits.length}</Text>
                        <Text style={styles.statLabel}>Ativos</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <CheckCircle size={24} color="#10B981" />
                        <Text style={styles.statNum}>85%</Text>
                        <Text style={styles.statLabel}>Hoje</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <TrendingUp size={24} color="#F59E0B" />
                        <Text style={styles.statNum}>12</Text>
                        <Text style={styles.statLabel}>Streak</Text>
                    </Card>
                </View>

                {/* Chart */}
                <Card>
                    <ProgressChart title="Consistência Semanal" data={weeklyData} labels={weeklyLabels} color="#10B981" />
                </Card>

                {/* Habits List */}
                <Text style={styles.sectionTitle}>HOJE</Text>
                {habits.map(h => (
                    <Card key={h.id} style={styles.habitCard}>
                        <View style={styles.habitHeader}>
                            <View>
                                <Text style={styles.habitTitle}>{h.title}</Text>
                                <Text style={styles.habitMeta}>{h.current} / {h.target} {h.unit}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => incrementHabit(h.id)}
                                style={[styles.checkBtn, h.current >= h.target && styles.checkBtnDone, { borderColor: h.color }]}
                            >
                                {h.current >= h.target ? <CheckCircle size={20} color="#fff" /> : <Plus size={20} color={h.color} />}
                            </TouchableOpacity>
                        </View>
                        <ProgressBar progress={(h.current / h.target) * 100} color={h.color} />
                    </Card>
                ))}

            </ScrollView>

            <AddHabitModal visible={modalVisible} onClose={() => setModalVisible(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b' },

    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: 16 },
    statNum: { fontSize: 20, fontWeight: '900', marginTop: 8 },
    statLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },

    sectionTitle: { fontSize: 13, fontWeight: '900', color: '#64748b', marginBottom: 12, marginTop: 10 },

    habitCard: { marginBottom: 12, padding: 16 },
    habitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    habitTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
    habitMeta: { fontSize: 12, color: '#64748b' },
    checkBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    checkBtnDone: { backgroundColor: '#10B981', borderColor: '#10B981' },
});
