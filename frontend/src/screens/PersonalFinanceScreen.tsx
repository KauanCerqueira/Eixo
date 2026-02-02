import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react-native';
import { Card } from '../components/ui/Card';
import { FAB } from '../components/ui/FAB';
import { AddPersonalTransactionModal } from '../components/modals/AddPersonalTransactionModal';

const PersonalFinanceScreen = () => {
    const { personalFinance, deletePersonalTransaction, personalBalance } = useApp();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const monthlyIncome = personalFinance
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const monthlyExpenses = personalFinance
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <Text style={styles.title}>Minhas Finanças</Text>
                    <Text style={styles.subtitle}>Gestão do seu dinheiro pessoal.</Text>
                </View>

                {/* Balance & Stats */}
                <View style={styles.balanceSection}>
                    <Text style={styles.balanceLabel}>Saldo Atual</Text>
                    <Text style={styles.balanceValue}>R$ {personalBalance.toFixed(2)}</Text>
                </View>

                <View style={styles.statsRow}>
                    <Card style={[styles.statCard, styles.incomeCard]}>
                        <View style={styles.iconCircleInfo}>
                            <TrendingUp size={16} color="#10B981" />
                        </View>
                        <Text style={styles.statLabel}>ENTRADAS</Text>
                        <Text style={styles.statValue}>R$ {monthlyIncome.toFixed(2)}</Text>
                    </Card>
                    <Card style={[styles.statCard, styles.expenseCard]}>
                        <View style={[styles.iconCircleInfo, { backgroundColor: '#FEF2F2' }]}>
                            <TrendingDown size={16} color="#EF4444" />
                        </View>
                        <Text style={styles.statLabel}>SAÍDAS</Text>
                        <Text style={[styles.statValue, { color: '#EF4444' }]}>R$ {monthlyExpenses.toFixed(2)}</Text>
                    </Card>
                </View>

                {/* Transactions List */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>HISTÓRICO</Text>
                </View>

                {personalFinance.length > 0 ? (
                    personalFinance.slice().reverse().map(item => (
                        <Card key={item.id} style={styles.transactionCard}>
                            <View style={styles.transactionLeft}>
                                <View style={[styles.iconContainer, item.type === 'income' ? styles.iconIncome : styles.iconExpense]}>
                                    {item.type === 'income' ? <TrendingUp size={20} color="#fff" /> : <TrendingDown size={20} color="#fff" />}
                                </View>
                                <View>
                                    <Text style={styles.transactionTitle}>{item.title}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text>
                                        {item.category && <Text style={styles.transactionCategory}> • {item.category}</Text>}
                                    </View>
                                    {item.description ? <Text style={styles.transactionDesc} numberOfLines={1}>{item.description}</Text> : null}
                                </View>
                            </View>
                            <View style={styles.transactionRight}>
                                <Text style={[styles.transactionAmount, { color: item.type === 'income' ? '#10B981' : '#EF4444' }]}>
                                    {item.type === 'income' ? '+' : '-'} R$ {item.amount.toFixed(2)}
                                </Text>
                                <TouchableOpacity onPress={() => deletePersonalTransaction(item.id)} style={{ padding: 4 }}>
                                    <Trash2 size={16} color="#cbd5e1" />
                                </TouchableOpacity>
                            </View>
                        </Card>
                    ))
                ) : (
                    <Card style={styles.emptyCard}>
                        <Text style={styles.emptyText}>Nenhuma transação ainda.</Text>
                    </Card>
                )}
            </ScrollView>

            <FAB onPress={() => setIsModalVisible(true)} />

            <AddPersonalTransactionModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
    header: { marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b' },

    balanceSection: { marginBottom: 24, alignItems: 'center' },
    balanceLabel: { fontSize: 13, color: '#64748b', fontWeight: 'bold' },
    balanceValue: { fontSize: 36, fontWeight: '900', color: '#0f172a', marginTop: 4 },

    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    statCard: { flex: 1, padding: 16, alignItems: 'flex-start' },
    incomeCard: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#D1FAE5' },
    expenseCard: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2' },
    iconCircleInfo: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    statLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b' },
    statValue: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginTop: 4 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 13, fontWeight: '900', color: '#64748b', letterSpacing: 0.5 },

    transactionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginBottom: 12 },
    transactionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    iconContainer: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    iconIncome: { backgroundColor: '#10B981' },
    iconExpense: { backgroundColor: '#EF4444' },
    transactionTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
    transactionDate: { fontSize: 12, color: '#94a3b8' },
    transactionCategory: { fontSize: 12, color: '#64748b', fontWeight: '500', textTransform: 'capitalize' },
    transactionDesc: { fontSize: 11, color: '#94a3b8', fontStyle: 'italic', marginTop: 2 },
    transactionRight: { alignItems: 'flex-end', marginLeft: 12 },
    transactionAmount: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },

    emptyCard: { padding: 32, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#94a3b8', fontStyle: 'italic' },
});

export default PersonalFinanceScreen;
