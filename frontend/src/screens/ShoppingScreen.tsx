import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    Alert
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Plus, Trash2, Check, X } from 'lucide-react-native';
import { Avatar } from '../components/ui/Avatar';
import { THEME } from '../theme';

export const ShoppingScreen = () => {
    const { shopping, addShoppingItem, deleteShoppingItem, toggleShoppingItem, currentUser } = useApp();
    const tabBarHeight = useBottomTabBarHeight();
    const [newItemName, setNewItemName] = useState('');
    const [newItemQty, setNewItemQty] = useState('1');
    const [isAdding, setIsAdding] = useState(false);

    const sortedItems = useMemo(
        () => [...shopping].sort((a, b) => Number(a.isBought) - Number(b.isBought)),
        [shopping]
    );
    const pendingCount = shopping.filter((i) => !i.isBought).length;
    const boughtCount = shopping.filter((i) => i.isBought).length;

    const handleAdd = async () => {
        if (!newItemName.trim() || !currentUser) return;
        try {
            await addShoppingItem({
                name: newItemName.trim(),
                quantity: newItemQty.trim() || '1',
                addedByUserId: currentUser.id
            });
            setNewItemName('');
            setNewItemQty('1');
            setIsAdding(false);
            Keyboard.dismiss();
        } catch (error: any) {
            Alert.alert('Erro', error?.message || 'Não foi possível adicionar item.');
        }
    };

    const handleToggleItem = async (id: number) => {
        try {
            await toggleShoppingItem(id);
        } catch (error: any) {
            Alert.alert('Erro', error?.message || 'Não foi possível atualizar o item.');
        }
    };

    const handleDeleteItem = async (id: number) => {
        try {
            await deleteShoppingItem(id);
        } catch (error: any) {
            Alert.alert('Erro', error?.message || 'Não foi possível remover o item.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? tabBarHeight + 72 : 0}
        >
            <View style={styles.header}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>FALTAM</Text>
                    <Text style={styles.statValue}>{pendingCount}</Text>
                </View>
                <View style={[styles.statBox, styles.statBoxRight]}>
                    <Text style={[styles.statLabel, { color: '#FFF' }]}>NO CARRINHO</Text>
                    <Text style={[styles.statValue, { color: '#FFF' }]}>{boughtCount}</Text>
                </View>
            </View>

            <FlatList
                data={sortedItems}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: isAdding ? tabBarHeight + 240 : tabBarHeight + 120 }
                ]}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.itemCard, item.isBought && styles.itemCardBought]}
                        onPress={() => handleToggleItem(item.id)}
                        activeOpacity={0.9}
                    >
                        <View style={[styles.checkBox, item.isBought && styles.checkBoxActive]}>
                            {item.isBought && <Check size={16} color="#000" strokeWidth={3} />}
                        </View>
                        <View style={styles.itemInfo}>
                            <Text style={[styles.itemName, item.isBought && styles.textBought]}>{item.name}</Text>
                            <Text style={[styles.itemQty, item.isBought && styles.textBought]}>Qtd: {item.quantity}</Text>
                        </View>
                        <View style={styles.addedBy}>
                            <Avatar user={item.addedBy || { initials: '?', color: '#ccc' }} size={28} />
                        </View>
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                void handleDeleteItem(item.id);
                            }}
                            style={styles.deleteBtn}
                        >
                            <Trash2 size={18} color={THEME.colors.text} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <ShoppingCart size={64} color={THEME.colors.textSecondary} strokeWidth={1.5} />
                        <Text style={styles.emptyText}>Lista vazia. Adicione algo!</Text>
                    </View>
                }
            />

            <View style={[styles.footer, { paddingBottom: tabBarHeight + 10 }]}>
                {!isAdding ? (
                    <TouchableOpacity onPress={() => setIsAdding(true)} style={styles.fab} activeOpacity={0.9}>
                        <Plus size={24} color="#FFF" strokeWidth={3} />
                        <Text style={styles.fabText}>ADICIONAR ITEM</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.addForm}>
                        <View style={styles.formHeader}>
                            <Text style={styles.formTitle}>NOVO ITEM</Text>
                            <TouchableOpacity onPress={() => setIsAdding(false)}>
                                <X size={24} color={THEME.colors.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputsRow}>
                            <TextInput
                                style={[styles.input, { flex: 2 }]}
                                placeholder="NOME DO ITEM"
                                placeholderTextColor={THEME.colors.textSecondary}
                                value={newItemName}
                                onChangeText={setNewItemName}
                                autoFocus
                                returnKeyType="done"
                                onSubmitEditing={handleAdd}
                            />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="QTD"
                                placeholderTextColor={THEME.colors.textSecondary}
                                value={newItemQty}
                                onChangeText={setNewItemQty}
                            />
                        </View>
                        <TouchableOpacity onPress={handleAdd} style={styles.confirmBtn}>
                            <Text style={styles.confirmBtnText}>ADICIONAR AGORA</Text>
                            <Check size={20} color="#000" strokeWidth={3} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.colors.background },
    header: { flexDirection: 'row', padding: 20, gap: 16 },
    statBox: {
        flex: 1,
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 3,
        borderColor: THEME.colors.text,
        ...THEME.shadows.small
    },
    statBoxRight: { backgroundColor: THEME.colors.text },
    statLabel: { fontSize: 12, color: THEME.colors.text, fontWeight: '900', letterSpacing: 1 },
    statValue: { fontSize: 28, fontWeight: '900', color: THEME.colors.text, marginTop: 4 },
    listContent: { padding: 20, paddingTop: 0, paddingBottom: 20 },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 3,
        borderColor: THEME.colors.text,
        ...THEME.shadows.small
    },
    itemCardBought: { backgroundColor: THEME.colors.muted, opacity: 0.8, elevation: 0, shadowOpacity: 0 },
    checkBox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 3,
        borderColor: THEME.colors.text,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF'
    },
    checkBoxActive: { backgroundColor: THEME.colors.success },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: '800', color: THEME.colors.text },
    textBought: { textDecorationLine: 'line-through', color: THEME.colors.textSecondary },
    itemQty: { fontSize: 13, color: THEME.colors.textSecondary, fontWeight: '700', marginTop: 2 },
    addedBy: { marginRight: 12 },
    deleteBtn: { padding: 8 },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60, gap: 16 },
    emptyText: { color: THEME.colors.textSecondary, fontSize: 16, fontWeight: '700' },
    footer: { padding: 20, paddingTop: 0 },
    fab: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME.colors.primary,
        paddingVertical: 18,
        borderRadius: 16,
        gap: 12,
        borderWidth: 3,
        borderColor: THEME.colors.text,
        ...THEME.shadows.medium
    },
    fabText: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
    addForm: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: THEME.colors.text,
        ...THEME.shadows.medium
    },
    formHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    formTitle: { fontSize: 18, fontWeight: '900', color: THEME.colors.text },
    inputsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    input: {
        backgroundColor: '#FFF',
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 3,
        borderColor: THEME.colors.text,
        fontWeight: '700',
        color: THEME.colors.text
    },
    confirmBtn: {
        flexDirection: 'row',
        height: 50,
        borderRadius: 12,
        backgroundColor: THEME.colors.success,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        borderWidth: 3,
        borderColor: THEME.colors.text
    },
    confirmBtnText: { fontSize: 14, fontWeight: '900', color: THEME.colors.text }
});
