import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { X, DollarSign } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { INCOME_CATEGORIES } from '../../types/types';

interface AddIncomeModalProps {
    visible: boolean;
    onClose: () => void;
}

export const AddIncomeModal = ({ visible, onClose }: AddIncomeModalProps) => {
    const { currentUser, addIncome } = useApp();

    if (!currentUser) return null;

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<string>('salario');

    const handleCreate = async () => {
        if (!title || !amount) return;

        const numericAmount = parseFloat(amount.replace(',', '.'));
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            Alert.alert('Valor inválido', 'Informe um valor maior que zero.');
            return;
        }

        try {
            await addIncome({
                title: title.trim(),
                amount: numericAmount,
                category: category as any,
                date: new Date().toISOString(),
                receivedByUserId: currentUser.id
            });

            setTitle('');
            setAmount('');
            setCategory('salario');
            onClose();
        } catch (error: any) {
            Alert.alert('Erro', error?.message || 'Não foi possível adicionar receita.');
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Nova Receita 💰</Text>
                        <TouchableOpacity onPress={onClose}><X size={24} color="#000" /></TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <Text style={styles.label}>Descrição</Text>
                        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ex: Salário Mensal" placeholderTextColor="#64748b" />

                        <Text style={styles.label}>Valor</Text>
                        <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="R$ 3.500,00" placeholderTextColor="#64748b" />

                        <Text style={styles.label}>Categoria</Text>
                        <View style={styles.optionsRow}>
                            {INCOME_CATEGORIES.map(cat => (
                                <TouchableOpacity key={cat.id} style={[styles.catBtn, category === cat.id && styles.catActive]} onPress={() => setCategory(cat.id)}>
                                    <Text style={styles.catIcon}>{cat.icon}</Text>
                                    <Text style={[styles.catText, category === cat.id && styles.catTextActive]}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
                        <Text style={styles.createBtnText}>Adicionar Saldo</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    title: { fontSize: 18, fontWeight: '900', color: '#10B981' },
    content: { padding: 20 },
    label: { fontSize: 13, fontWeight: 'bold', color: '#64748b', marginBottom: 8, marginTop: 12 },
    input: { borderWidth: 2, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#f8fafc', color: '#0f172a' },

    optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    catBtn: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 2, borderColor: '#e2e8f0' },
    catActive: { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
    catIcon: { fontSize: 16, marginRight: 6 },
    catText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    catTextActive: { color: '#000' },

    createBtn: { margin: 20, backgroundColor: '#10B981', padding: 16, borderRadius: 12, alignItems: 'center' },
    createBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
