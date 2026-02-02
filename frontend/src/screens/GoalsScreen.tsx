import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Target, TrendingUp, PlusCircle, Users, Banknote, Star } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { FAB } from '../components/ui/FAB';
import { AddGoalModal } from '../components/modals/AddGoalModal';

export const GoalsScreen = () => {
    const { goals, addContributionToGoal } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'finance' | 'general'>('all');

    const filteredGoals = goals.filter(g => filter === 'all' || g.type === filter);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>

                <View style={styles.header}>
                    <Text style={styles.title}>Metas da Família 🎯</Text>
                    <Text style={styles.subtitle}>Conquistas financeiras e comportamentais.</Text>
                </View>

                {/* Filters */}
                <View style={styles.filterRow}>
                    <TouchableOpacity onPress={() => setFilter('all')} style={[styles.filterBtn, filter === 'all' && styles.filterActive]}>
                        <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Todas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setFilter('finance')} style={[styles.filterBtn, filter === 'finance' && styles.filterActive]}>
                        <Banknote size={14} color={filter === 'finance' ? '#fff' : '#64748b'} />
                        <Text style={[styles.filterText, filter === 'finance' && styles.filterTextActive]}>Financeiras</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setFilter('general')} style={[styles.filterBtn, filter === 'general' && styles.filterActive]}>
                        <Star size={14} color={filter === 'general' ? '#fff' : '#64748b'} />
                        <Text style={[styles.filterText, filter === 'general' && styles.filterTextActive]}>Gerais</Text>
                    </TouchableOpacity>
                </View>

                {/* Goals List */}
                {filteredGoals.length > 0 ? filteredGoals.map(goal => (
                    <Card key={goal.id} style={[styles.goalCard, goal.type === 'finance' ? styles.borderFinance : styles.borderGeneral]}>
                        <View style={styles.cardHeader}>
                            <View>
                                <View style={styles.tagRow}>
                                    {goal.type === 'finance' ? <Banknote size={12} color="#8B5CF6" /> : <Star size={12} color="#F59E0B" />}
                                    <Text style={[styles.tagText, { color: goal.type === 'finance' ? '#8B5CF6' : '#F59E0B' }]}>
                                        {goal.type === 'finance' ? 'Financeira' : 'Geral / Hábito'}
                                    </Text>
                                </View>
                                <Text style={styles.goalTitle}>{goal.title}</Text>
                            </View>
                            <Text style={styles.goalPercent}>{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</Text>
                        </View>

                        {goal.description ? <Text style={styles.goalDesc}>{goal.description}</Text> : null}

                        <View style={styles.progressSection}>
                            <ProgressBar
                                progress={(goal.currentAmount / goal.targetAmount) * 100}
                                color={goal.type === 'finance' ? '#8B5CF6' : '#F59E0B'}
                            />
                            <View style={styles.progressStats}>
                                <Text style={styles.statCurrent}>
                                    {goal.unit === 'R$'
                                        ? `R$ ${goal.currentAmount} `
                                        : `${goal.currentAmount} ${goal.unit || ''} `}
                                </Text>
                                <Text style={styles.statTarget}>
                                    / {goal.unit === 'R$'
                                        ? `R$ ${goal.targetAmount} `
                                        : `${goal.targetAmount} ${goal.unit || ''} `}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity onPress={() => addContributionToGoal(goal.id, 1)} style={styles.addBtn}>
                            <PlusCircle size={16} color={goal.type === 'finance' ? '#8B5CF6' : '#F59E0B'} />
                            <Text style={[styles.addBtnText, { color: goal.type === 'finance' ? '#8B5CF6' : '#F59E0B' }]}>
                                {goal.type === 'finance' ? 'Adicionar Saldo' : 'Registrar Progresso'}
                            </Text>
                        </TouchableOpacity>

                        {goal.deadline && <Text style={styles.deadline}>Prazo: {goal.deadline}</Text>}
                    </Card>
                )) : (
                    <View style={styles.emptyState}>
                        <Target size={48} color="#cbd5e1" />
                        <Text style={styles.emptyText}>Nenhuma meta encontrada.</Text>
                        <Text style={styles.emptySub}>Crie uma nova meta para começar a acompanhar.</Text>
                    </View>
                )}

            </ScrollView>

            <FAB onPress={() => setShowModal(true)} />
            <AddGoalModal visible={showModal} onClose={() => setShowModal(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
    header: { marginBottom: 20 },
    title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b' },

    filterRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
    filterBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#f1f5f9', gap: 6 },
    filterActive: { backgroundColor: '#0f172a' },
    filterText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    filterTextActive: { color: '#fff' },

    goalCard: { marginBottom: 16, padding: 16, borderLeftWidth: 4 },
    borderFinance: { borderLeftColor: '#8B5CF6' },
    borderGeneral: { borderLeftColor: '#F59E0B' },

    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    tagRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
    tagText: { fontSize: 11, fontWeight: 'bold' },
    goalTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
    goalPercent: { fontSize: 20, fontWeight: '900', color: '#0f172a' },

    goalDesc: { fontSize: 13, color: '#64748b', marginBottom: 16 },

    progressSection: { marginBottom: 16 },
    progressStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
    statCurrent: { fontWeight: 'bold', fontSize: 14 },
    statTarget: { color: '#94a3b8', fontSize: 12 },

    addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 8, backgroundColor: '#f8fafc', gap: 6 },
    addBtnText: { fontWeight: 'bold', fontSize: 13 },

    deadline: { fontSize: 11, color: '#94a3b8', marginTop: 12, textAlign: 'right' },

    emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
    emptyText: { fontWeight: 'bold', fontSize: 16, color: '#94a3b8' },
    emptySub: { fontSize: 13, color: '#cbd5e1' }
});
