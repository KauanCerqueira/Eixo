import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Wallet, Target, PiggyBank, Eye, EyeOff, Plus } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { AddButton } from '../components/ui/FAB';
import { WishlistItem } from '../components/ui/WishlistItem';

export const WishlistScreen = () => {
    const { wishlist, personalBalance, updateWishlistSaved } = useApp();
    const [showBalance, setShowBalance] = useState(true);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>

                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Minha Carteira</Text>
                        <Text style={styles.subtitle}>Gerencie suas conquistas materiais.</Text>
                    </View>
                </View>

                {/* Balance Card */}
                <Card style={styles.balanceCard}>
                    <View style={styles.balanceHeader}>
                        <Text style={styles.balanceLabel}>SALDO DISPONÍVEL</Text>
                        <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
                            {showBalance ? <EyeOff size={20} color="#fff" /> : <Eye size={20} color="#fff" />}
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.balanceValue}>
                        {showBalance ? `R$ ${personalBalance.toFixed(2)}` : '••••••'}
                    </Text>
                    <View style={styles.balanceActions}>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Plus size={16} color="#fff" />
                            <Text style={styles.actionText}>Adicionar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, styles.secondaryAction]}>
                            <Target size={16} color="#fff" />
                            <Text style={styles.actionText}>Nova Meta</Text>
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* Wishlist */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>WISHLIST & METAS</Text>
                    <AddButton onPress={() => { }} />
                </View>

                {wishlist.map(item => (
                    <WishlistItem
                        key={item.id}
                        title={item.title}
                        price={item.price}
                        saved={item.saved}
                        priority={item.priority}
                    />
                ))}

                {wishlist.length === 0 && (
                    <View style={styles.emptyState}>
                        <PiggyBank size={48} color="#cbd5e1" />
                        <Text style={styles.emptyText}>Sua lista de desejos está vazia.</Text>
                    </View>
                )}

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
    header: { marginBottom: 20 },
    title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b' },

    balanceCard: { backgroundColor: '#1e293b', padding: 20, marginBottom: 24 },
    balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    balanceLabel: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold' },
    balanceValue: { color: '#fff', fontSize: 32, fontWeight: '900', marginBottom: 20 },
    balanceActions: { flexDirection: 'row', gap: 12 },
    actionBtn: { backgroundColor: '#3b82f6', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 8 },
    secondaryAction: { backgroundColor: 'rgba(255,255,255,0.1)' },
    actionText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 13, fontWeight: '900', color: '#64748b' },

    emptyState: { alignItems: 'center', marginTop: 40 },
    emptyText: { marginTop: 12, color: '#94a3b8', fontSize: 14 },
});
