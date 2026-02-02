import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ShoppingCart, Plus, Check } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';

export const ShoppingWidget = () => {
    const { shopping, toggleShoppingItem } = useApp();
    const missingItems = shopping.filter(item => !item.isBought);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>LISTA DE COMPRAS 🛒</Text>
                <Text style={styles.count}>{missingItems.length} itens faltando</Text>
            </View>

            <Card style={styles.card}>
                {missingItems.length > 0 ? (
                    missingItems.slice(0, 4).map(item => (
                        <TouchableOpacity key={item.id} onPress={() => toggleShoppingItem(item.id)} style={styles.itemRow}>
                            <View style={styles.checkCircle}>
                                {item.isBought && <Check size={12} color="#fff" />}
                            </View>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemQty}>{item.quantity}</Text>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.empty}>
                        <Check size={24} color="#22C55E" />
                        <Text style={styles.emptyText}>Tudo comprado!</Text>
                    </View>
                )}

                {missingItems.length > 4 && (
                    <Text style={styles.moreText}>+ {missingItems.length - 4} outros itens</Text>
                )}
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 24 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 4 },
    title: { fontSize: 13, fontWeight: '900', color: '#64748b' },
    count: { fontSize: 11, color: '#64748b', backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },

    card: { padding: 0, overflow: 'hidden' },
    itemRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    checkCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#cbd5e1', marginRight: 12, alignItems: 'center', justifyContent: 'center' },
    itemName: { flex: 1, fontSize: 14, fontWeight: '500', color: '#0f172a' },
    itemQty: { fontSize: 12, color: '#94a3b8' },

    empty: { alignItems: 'center', padding: 20, gap: 8 },
    emptyText: { color: '#22C55E', fontWeight: 'bold' },

    moreText: { textAlign: 'center', padding: 10, fontSize: 11, color: '#64748b', backgroundColor: '#f8fafc' }
});
