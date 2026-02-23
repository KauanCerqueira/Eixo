import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Target, Banknote, Star, PlusCircle, X } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { FAB } from '../components/ui/FAB';
import { AddGoalModal } from '../components/modals/AddGoalModal';
import { Goal } from '../services/api';

export const GoalsScreen = () => {
    const { goals, addContributionToGoal } = useApp();
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [showContribModal, setShowContribModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [filter, setFilter] = useState<'all' | 'finance' | 'general'>('all');

    const filteredGoals = useMemo(
        () => goals.filter((g) => filter === 'all' || g.type === filter),
        [goals, filter]
    );

    const openContribModal = (goal: Goal) => {
        setSelectedGoal(goal);
        setAmount(goal.type === 'finance' ? '' : '1');
        setNote('');
        setShowContribModal(true);
    };

    const handleContribute = async () => {
        if (!selectedGoal) return;
        const numericAmount = parseFloat(amount.replace(',', '.'));
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            Alert.alert('Valor inválido', 'Informe um valor maior que zero.');
            return;
        }
        try {
            await addContributionToGoal(selectedGoal.id, numericAmount, note.trim() || undefined);
            setShowContribModal(false);
        } catch (error: any) {
            Alert.alert('Erro', error?.message || 'Falha ao registrar contribuição.');
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <Text style={styles.title}>Metas da Família</Text>
                    <Text style={styles.subtitle}>Acompanhe progresso com histórico real.</Text>
                </View>

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

                {filteredGoals.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Target size={48} color="#cbd5e1" />
                        <Text style={styles.emptyText}>Nenhuma meta cadastrada.</Text>
                    </View>
                ) : (
                    filteredGoals.map((goal) => {
                        const safeTarget = goal.targetAmount > 0 ? goal.targetAmount : 1;
                        const progress = Math.max(0, Math.min(100, (goal.currentAmount / safeTarget) * 100));

                        return (
                            <Card key={goal.id} style={[styles.goalCard, goal.type === 'finance' ? styles.borderFinance : styles.borderGeneral]}>
                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={styles.goalTitle}>{goal.title}</Text>
                                        {goal.description ? <Text style={styles.goalDesc}>{goal.description}</Text> : null}
                                    </View>
                                    <Text style={styles.goalPercent}>{Math.round(progress)}%</Text>
                                </View>

                                <ProgressBar progress={progress} color={goal.type === 'finance' ? '#8B5CF6' : '#F59E0B'} />
                                <Text style={styles.progressText}>
                                    {goal.unit === 'R$' ? 'R$ ' : ''}{goal.currentAmount.toFixed(2)}
                                    {' / '}
                                    {goal.unit === 'R$' ? 'R$ ' : ''}{goal.targetAmount.toFixed(2)}
                                </Text>

                                <TouchableOpacity style={styles.addBtn} onPress={() => openContribModal(goal)}>
                                    <PlusCircle size={16} color={goal.type === 'finance' ? '#8B5CF6' : '#F59E0B'} />
                                    <Text style={[styles.addBtnText, { color: goal.type === 'finance' ? '#8B5CF6' : '#F59E0B' }]}>
                                        {goal.type === 'finance' ? 'Adicionar valor' : 'Registrar progresso'}
                                    </Text>
                                </TouchableOpacity>

                                {goal.contributions && goal.contributions.length > 0 ? (
                                    <View style={styles.historyWrap}>
                                        <Text style={styles.historyTitle}>Histórico</Text>
                                        {goal.contributions
                                            .slice()
                                            .sort((a, b) => String(b.date).localeCompare(String(a.date)))
                                            .slice(0, 4)
                                            .map((c) => (
                                                <View key={c.id} style={styles.historyRow}>
                                                    <Text style={styles.historyText}>
                                                        {c.user?.name || 'Alguém'}: {goal.unit === 'R$' ? 'R$ ' : ''}{c.amount}
                                                        {c.note ? ` - ${c.note}` : ''}
                                                    </Text>
                                                    <Text style={styles.historyDate}>{new Date(c.date).toLocaleDateString('pt-BR')}</Text>
                                                </View>
                                            ))}
                                    </View>
                                ) : null}
                            </Card>
                        );
                    })
                )}
            </ScrollView>

            <FAB onPress={() => setShowGoalModal(true)} />
            <AddGoalModal visible={showGoalModal} onClose={() => setShowGoalModal(false)} />

            <Modal visible={showContribModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Contribuir na Meta</Text>
                            <TouchableOpacity onPress={() => setShowContribModal(false)}>
                                <X size={20} color="#334155" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalSub}>{selectedGoal?.title}</Text>

                        <Text style={styles.inputLabel}>Valor</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="decimal-pad"
                            placeholder={selectedGoal?.type === 'finance' ? 'Ex: 150,00' : 'Ex: 1'}
                            placeholderTextColor="#64748b"
                        />

                        <Text style={styles.inputLabel}>Observação (opcional)</Text>
                        <TextInput
                            style={[styles.modalInput, styles.modalTextArea]}
                            value={note}
                            onChangeText={setNote}
                            multiline
                            placeholder="Ex: aporte da semana"
                            placeholderTextColor="#64748b"
                        />

                        <TouchableOpacity style={styles.modalBtn} onPress={handleContribute}>
                            <Text style={styles.modalBtnText}>Salvar contribuição</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    goalCard: { marginBottom: 14, padding: 14, borderLeftWidth: 4 },
    borderFinance: { borderLeftColor: '#8B5CF6' },
    borderGeneral: { borderLeftColor: '#F59E0B' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 12 },
    goalTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', flex: 1 },
    goalDesc: { fontSize: 12, color: '#64748b', marginTop: 4 },
    goalPercent: { fontWeight: '900', color: '#0f172a' },
    progressText: { marginTop: 6, color: '#475569', fontWeight: '700' },
    addBtn: { marginTop: 12, padding: 10, borderRadius: 10, backgroundColor: '#f8fafc', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    addBtnText: { fontWeight: '800', fontSize: 13 },
    historyWrap: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 10 },
    historyTitle: { fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 6 },
    historyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, gap: 8 },
    historyText: { flex: 1, fontSize: 12, color: '#334155' },
    historyDate: { fontSize: 11, color: '#64748b' },
    emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
    emptyText: { fontWeight: 'bold', fontSize: 16, color: '#64748b' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
    modalCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
    modalSub: { color: '#64748b', marginTop: 4, marginBottom: 10 },
    inputLabel: { fontSize: 12, color: '#64748b', fontWeight: '700', marginTop: 8, marginBottom: 6 },
    modalInput: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, color: '#0f172a' },
    modalTextArea: { minHeight: 72, textAlignVertical: 'top' },
    modalBtn: { marginTop: 14, backgroundColor: '#2563eb', borderRadius: 10, padding: 12, alignItems: 'center' },
    modalBtnText: { color: '#fff', fontWeight: '800' }
});
