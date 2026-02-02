import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useApp } from '../context/AppContext';
import { ShoppingItem } from '../types/types';
import { ShoppingCart, Plus, Trash2, Check, X } from 'lucide-react-native';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';

export const ShoppingScreen = () => {
    const { shopping, addShoppingItem, deleteShoppingItem, toggleShoppingItem, currentUser } = useApp();
    const [newItemName, setNewItemName] = useState('');
    const [newItemQty, setNewItemQty] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = () => {
        if (!newItemName.trim()) return;
        addShoppingItem({
            name: newItemName,
            quantity: newItemQty || '1',
            isBought: false,
            addedBy: currentUser
        });
        setNewItemName('');
        setNewItemQty('');
        setIsAdding(false);
    };

    const sortedItems = [...shopping].sort((a, b) => {
        if (a.isBought === b.isBought) return 0;
        return a.isBought ? 1 : -1;
    });

    return (
        <View style={styles.container}>
            {/* Header / Stats */}
            <View style={styles.header}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Faltam</Text>
                    <Text style={styles.statValue}>{shopping.filter(i => !i.isBought).length}</Text>
                </View>
                <View style={[styles.statBox, styles.statBoxRight]}>
                    <Text style={styles.statLabel}>Carrinho</Text>
                    <Text style={styles.statValue}>{shopping.filter(i => i.isBought).length}</Text>
                </View>
            </View>

            {/* List */}
            <FlatList
                data={sortedItems}
                keyExtractor={i => i.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.itemCard, item.isBought && styles.itemCardBought]}
                        onPress={() => toggleShoppingItem(item.id)}
                    >
                        <View style={[styles.checkBox, item.isBought && styles.checkBoxActive]}>
                            {item.isBought && <Check size={14} color="#fff" />}
                        </View>

                        <View style={styles.itemInfo}>
                            <Text style={[styles.itemName, item.isBought && styles.textBought]}>{item.name}</Text>
                            <Text style={styles.itemQty}>{item.quantity}</Text>
                        </View>

                        <View style={styles.addedBy}>
                            <Avatar user={item.addedBy} size={24} />
                        </View>

                        {item.isBought && (
                            <TouchableOpacity onPress={() => deleteShoppingItem(item.id)} style={styles.deleteBtn}>
                                <Trash2 size={16} color="#94a3b8" />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <ShoppingCart size={48} color="#e2e8f0" />
                        <Text style={styles.emptyText}>Lista vazia</Text>
                    </View>
                }
            />

            {/* Input Area */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
                <View style={styles.inputContainer}>
                    {isAdding ? (
                        <View style={styles.addForm}>
                            <View style={styles.inputsRow}>
                                <TextInput
                                    style={[styles.input, { flex: 2 }]}
                                    placeholder="Nome do item"
                                    value={newItemName}
                                    onChangeText={setNewItemName}
                                    autoFocus
                                />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="Qtd"
                                    value={newItemQty}
                                    onChangeText={setNewItemQty}
                                />
                            </View>
                            <View style={styles.actionsRow}>
                                <TouchableOpacity onPress={() => setIsAdding(false)} style={styles.cancelBtn}>
                                    <X size={20} color="#64748b" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleAdd} style={styles.confirmBtn}>
                                    <Check size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => setIsAdding(true)} style={styles.fab}>
                            <Plus size={24} color="#fff" />
                            <Text style={styles.fabText}>Adicionar Item</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },

    header: { flexDirection: 'row', padding: 16, gap: 12 },
    statBox: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    statBoxRight: { backgroundColor: '#fff' },
    statLabel: { fontSize: 12, color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
    statValue: { fontSize: 24, fontWeight: '900', color: '#0f172a', marginTop: 4 },

    listContent: { padding: 16, paddingTop: 0, paddingBottom: 100 },

    itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
    itemCardBought: { backgroundColor: '#f1f5f9', borderColor: '#f1f5f9', opacity: 0.8 },

    checkBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#cbd5e1', marginRight: 12, alignItems: 'center', justifyContent: 'center' },
    checkBoxActive: { backgroundColor: '#22C55E', borderColor: '#22C55E' },

    itemInfo: { flex: 1 },
    itemName: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    textBought: { textDecorationLine: 'line-through', color: '#94a3b8' },
    itemQty: { fontSize: 12, color: '#64748b', marginTop: 2 },

    addedBy: { marginRight: 12 },
    deleteBtn: { padding: 8 },

    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60, gap: 12 },
    emptyText: { color: '#94a3b8', fontSize: 16 },

    inputContainer: { padding: 16, backgroundColor: 'transparent' },
    fab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', padding: 16, borderRadius: 16, gap: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    fabText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    addForm: { backgroundColor: '#fff', padding: 16, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    inputsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    input: { backgroundColor: '#f1f5f9', height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, borderWidth: 1, borderColor: '#e2e8f0' },
    actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    cancelBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
    confirmBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center' }
});
