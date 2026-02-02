import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { CreditCard, TrendingDown, Calendar, Plus, Check, DollarSign, TrendingUp, Target, PlusCircle } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { FAB } from '../components/ui/FAB';
import { AddDebtModal } from '../components/modals/AddDebtModal';
import { AddSubscriptionModal } from '../components/modals/AddSubscriptionModal';
import { AddExpenseModal } from '../components/modals/AddExpenseModal';
import { AddIncomeModal } from '../components/modals/AddIncomeModal';
// Removed AddGoalModal and goals section from here

export const FamilyFinanceScreen = () => {
    const { featuredDebts, subscriptions, payDebtInstallment, incomes } = useApp();

    const [showMenu, setShowMenu] = useState(false);
    const [showDebtModal, setShowDebtModal] = useState(false);
    const [showSubModal, setShowSubModal] = useState(false);
    const [showExpModal, setShowExpModal] = useState(false);
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    // Removed Goal Modal state

    // Summary Metrics
    const totalDebtInstallments = featuredDebts.reduce((acc, d) => acc + d.installmentAmount, 0);
    const totalSubscriptions = subscriptions.reduce((acc, s) => acc + s.amount, 0);
    const monthlyFixedCost = totalDebtInstallments + totalSubscriptions;

    const totalIncome = incomes.reduce((acc, i) => acc + i.amount, 0);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>

                <View style={styles.header}>
                    <Text style={styles.title}>Finanças da Casa</Text>
                    <Text style={styles.subtitle}>Gestão completa do caixa familiar.</Text>
                </View>

                {/* Top Summary Rows */}
                <View style={styles.topRow}>
                    <Card style={[styles.miniCard, styles.incomeCard]}>
                        <View style={styles.iconCircleInfo}>
                            <TrendingUp size={16} color="#10B981" />
                        </View>
                        <Text style={styles.miniLabel}>ENTRADAS MÊS</Text>
                        <Text style={styles.miniValue}>R$ {totalIncome.toFixed(0)}</Text>
                    </Card>

                    <Card style={[styles.miniCard, styles.costCard]}>
                        <View style={[styles.iconCircleInfo, { backgroundColor: '#FEF2F2' }]}>
                            <TrendingDown size={16} color="#EF4444" />
                        </View>
                        <Text style={styles.miniLabel}>CUSTO FIXO</Text>
                        <Text style={[styles.miniValue, { color: '#EF4444' }]}>- R$ {monthlyFixedCost.toFixed(0)}</Text>
                    </Card>
                </View>

                {/* Dívidas */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>DÍVIDAS & PARCELAMENTOS</Text>
                </View>

                {featuredDebts.map(debt => {
                    const progress = (debt.paidInstallments / debt.totalInstallments) * 100;
                    const remainingMonths = debt.totalInstallments - debt.paidInstallments;
                    const today = new Date();
                    const endDate = new Date(today.setMonth(today.getMonth() + remainingMonths));
                    const endDateStr = endDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

                    return (
                        <Card key={debt.id} style={styles.debtCard}>
                            <View style={styles.debtHeader}>
                                <View>
                                    <Text style={styles.debtTitle}>{debt.title}</Text>
                                    <Text style={styles.debtSubtitle}>Resp: {debt.owner.name}</Text>
                                </View>
                                <Badge variant="urgent">R$ {debt.installmentAmount}/mês</Badge>
                            </View>
                            <View style={styles.progressContainer}>
                                <View style={styles.progressLabels}>
                                    <Text style={styles.progressText}>{debt.paidInstallments}/{debt.totalInstallments} pagas</Text>
                                    <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                                </View>
                                <ProgressBar progress={progress} color={progress > 75 ? '#10B981' : '#F59E0B'} />
                            </View>
                            <View style={styles.debtFooter}>
                                <Text style={styles.footerText}>Fim: {endDateStr}</Text>
                                {debt.paidInstallments < debt.totalInstallments ? (
                                    <TouchableOpacity onPress={() => payDebtInstallment(debt.id)} style={styles.payBtn}>
                                        <Text style={styles.payBtnText}>Pagar</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.doneBadge}><Check size={12} color="#fff" /><Text style={styles.doneText}>Quitado</Text></View>
                                )}
                            </View>
                        </Card>
                    );
                })}

                {/* Assinaturas */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>ASSINATURAS</Text>
                </View>

                <Card>
                    {subscriptions.map(sub => (
                        <View key={sub.id} style={styles.subRow}>
                            <View style={styles.subIcon}>
                                <Text style={styles.subInitial}>{sub.title[0]}</Text>
                            </View>
                            <View style={styles.subInfo}>
                                <Text style={styles.subTitle}>{sub.title}</Text>
                                <Text style={styles.subDate}>Vence dia {sub.dueDateDay}</Text>
                            </View>
                            <Text style={styles.subAmount}>R$ {sub.amount.toFixed(2)}</Text>
                        </View>
                    ))}
                </Card>

            </ScrollView>

            {/* FAB with Menu */}
            <FAB onPress={() => setShowMenu(true)} />

            {/* Menu Modal */}
            <Modal visible={showMenu} transparent animationType="fade">
                <TouchableOpacity style={styles.menuOverlay} onPress={() => setShowMenu(false)} activeOpacity={1}>
                    <View style={styles.menuContainer}>
                        <Text style={styles.menuTitle}>Nova Movimentação</Text>

                        <View style={styles.menuGrid}>
                            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); setShowIncomeModal(true); }}>
                                <View style={[styles.menuIcon, { backgroundColor: '#10B981' }]}>
                                    <TrendingUp size={24} color="#fff" />
                                </View>
                                <Text style={styles.menuText}>Entrada</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); setShowExpModal(true); }}>
                                <View style={[styles.menuIcon, { backgroundColor: '#3B82F6' }]}>
                                    <DollarSign size={24} color="#fff" />
                                </View>
                                <Text style={styles.menuText}>Despesa</Text>
                            </TouchableOpacity>

                            {/* Goal Option removed from here as it is now in Goals Tab */}

                            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); setShowDebtModal(true); }}>
                                <View style={[styles.menuIcon, { backgroundColor: '#EF4444' }]}>
                                    <TrendingDown size={24} color="#fff" />
                                </View>
                                <Text style={styles.menuText}>Dívida</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); setShowSubModal(true); }}>
                                <View style={[styles.menuIcon, { backgroundColor: '#64748b' }]}>
                                    <CreditCard size={24} color="#fff" />
                                </View>
                                <Text style={styles.menuText}>Assinatura</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowMenu(false)}>
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Modals */}
            <AddDebtModal visible={showDebtModal} onClose={() => setShowDebtModal(false)} />
            <AddSubscriptionModal visible={showSubModal} onClose={() => setShowSubModal(false)} />
            <AddExpenseModal visible={showExpModal} onClose={() => setShowExpModal(false)} />
            <AddIncomeModal visible={showIncomeModal} onClose={() => setShowIncomeModal(false)} />

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
    header: { marginBottom: 20 },
    title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b' },

    topRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    miniCard: { flex: 1, padding: 16, alignItems: 'flex-start' },
    incomeCard: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' },
    costCard: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
    miniLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', marginTop: 8 },
    miniValue: { fontSize: 18, fontWeight: '900', color: '#10B981', marginTop: 2 },
    iconCircleInfo: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
    sectionTitle: { fontSize: 13, fontWeight: '900', color: '#64748b' },

    // Debts
    debtCard: { marginBottom: 12, padding: 16 },
    debtHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    debtTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
    debtSubtitle: { fontSize: 11, color: '#64748b', marginTop: 2 },
    progressContainer: { marginBottom: 12 },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    progressText: { fontSize: 11, color: '#64748b', fontWeight: '600' },
    debtFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 },
    footerText: { fontSize: 11, fontWeight: '600', color: '#64748b' },
    payBtn: { backgroundColor: '#db2777', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    payBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    doneBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
    doneText: { color: '#fff', fontWeight: 'bold', fontSize: 11 },

    // Subs
    subRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    subIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    subInitial: { fontSize: 16, fontWeight: '900', color: '#64748b' },
    subInfo: { flex: 1 },
    subTitle: { fontSize: 14, fontWeight: '600' },
    subDate: { fontSize: 11, color: '#64748b' },
    subAmount: { fontSize: 14, fontWeight: 'bold' },

    // Menu Modal Styles
    menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' },
    menuContainer: { backgroundColor: '#fff', width: '95%', marginBottom: 20, borderRadius: 24, padding: 24, paddingBottom: 32 },
    menuTitle: { fontSize: 18, fontWeight: '900', marginBottom: 24, textAlign: 'center', color: '#0f172a' },
    menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
    menuItem: { width: '45%', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: '#f8fafc', elevation: 1 },
    menuIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    menuText: { fontSize: 14, fontWeight: 'bold', color: '#334155' },
    cancelBtn: { marginTop: 24, alignSelf: 'center', padding: 10 },
    cancelText: { color: '#94a3b8', fontWeight: 'bold' },
});
