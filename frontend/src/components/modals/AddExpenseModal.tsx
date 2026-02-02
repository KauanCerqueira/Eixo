import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { EXPENSE_CATEGORIES } from '../../types/types';
import { Avatar } from '../ui/Avatar';

interface AddExpenseModalProps {
    visible: boolean;
    onClose: () => void;
}

export const AddExpenseModal = ({ visible, onClose }: AddExpenseModalProps) => {
    const { users, currentUser, addExpense } = useApp();

    if (!currentUser) return null;

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('alimentacao');
    const [splitWith, setSplitWith] = useState<number[]>(users.map(u => u.id));

    const toggleUser = (userId: number) => {
        if (splitWith.includes(userId)) {
            if (splitWith.length > 1) {
                setSplitWith(splitWith.filter(id => id !== userId));
            }
        } else {
            setSplitWith([...splitWith, userId]);
        }
    };

    const handleSave = () => {
        if (!title.trim() || !amount) return;

        addExpense({
            title: title.trim(),
            amount: parseFloat(amount) || 0,
            paidByUserId: currentUser.id,
            category: category as any,
            splitWithUserIds: splitWith,
            date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        });

        setTitle('');
        setAmount('');
        setSplitWith(users.map(u => u.id));
        onClose();
    };

    const splitAmount = splitWith.length > 0 ? (parseFloat(amount) || 0) / splitWith.length : 0;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Nova Despesa</Text>
                        <TouchableOpacity onPress={onClose}><X size={24} color="#000" /></TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <Text style={styles.label}>Descrição</Text>
                        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ex: Supermercado" placeholderTextColor="#94a3b8" />

                        <Text style={styles.label}>Valor (R$)</Text>
                        <TextInput style={styles.amountInput} value={amount} onChangeText={setAmount} placeholder="0,00" placeholderTextColor="#94a3b8" keyboardType="numeric" />

                        <Text style={styles.label}>Categoria</Text>
                        <View style={styles.categoriesGrid}>
                            {EXPENSE_CATEGORIES.map(cat => (
                                <TouchableOpacity key={cat.id} style={[styles.catBtn, category === cat.id && { borderColor: cat.color, backgroundColor: cat.color + '20' }]} onPress={() => setCategory(cat.id)}>
                                    <Text style={styles.catIcon}>{cat.icon}</Text>
                                    <Text style={[styles.catText, category === cat.id && { color: cat.color }]}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Dividir com</Text>
                        <View style={styles.usersRow}>
                            {users.map(user => (
                                <TouchableOpacity key={user.id} style={[styles.userBtn, splitWith.includes(user.id) && styles.userActive]} onPress={() => toggleUser(user.id)}>
                                    <Avatar user={user} size={40} />
                                    <Text style={styles.userName}>{user.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {splitWith.length > 0 && amount && (
                            <View style={styles.splitInfo}>
                                <Text style={styles.splitText}>Cada um paga:</Text>
                                <Text style={styles.splitAmount}>R$ {splitAmount.toFixed(2)}</Text>
                            </View>
                        )}
                    </ScrollView>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveBtnText}>Adicionar Despesa</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    title: { fontSize: 20, fontWeight: '900' },
    content: { padding: 20 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 8, marginTop: 16 },
    input: { borderWidth: 2, borderColor: '#000', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#f8fafc' },
    amountInput: { borderWidth: 2, borderColor: '#000', borderRadius: 12, padding: 14, fontSize: 28, fontWeight: 'bold', backgroundColor: '#f8fafc', textAlign: 'center' },
    categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    catBtn: { width: '48%', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 2, borderColor: '#e2e8f0' },
    catIcon: { fontSize: 20, marginRight: 8 },
    catText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    usersRow: { flexDirection: 'row', gap: 12 },
    userBtn: { alignItems: 'center', padding: 8, borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
    userActive: { borderColor: '#22C55E', backgroundColor: '#DCFCE7' },
    userName: { fontSize: 12, fontWeight: '600', marginTop: 6 },
    splitInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', padding: 16, borderRadius: 12, marginTop: 16 },
    splitText: { fontSize: 14, color: '#64748b' },
    splitAmount: { fontSize: 20, fontWeight: 'bold', color: '#22C55E' },
    saveBtn: { backgroundColor: '#EF4444', margin: 20, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#000' },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
