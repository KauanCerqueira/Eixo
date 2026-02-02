import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { X, DollarSign, Calendar } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

interface AddDebtModalProps {
    visible: boolean;
    onClose: () => void;
}

export const AddDebtModal = ({ visible, onClose }: AddDebtModalProps) => {
    const { addDebt, currentUser } = useApp();
    const [title, setTitle] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [installments, setInstallments] = useState('');
    const [installmentValue, setInstallmentValue] = useState('');

    const handleCreate = () => {
        if (!title || !totalAmount || !installments || !installmentValue) return;

        addDebt({
            title: title.trim(),
            totalAmount: parseFloat(totalAmount),
            totalInstallments: parseInt(installments),
            paidInstallments: 0,
            installmentAmount: parseFloat(installmentValue),
            dueDateDay: 10, // Default for now
            owner: currentUser
        });

        setTitle(''); setTotalAmount(''); setInstallments(''); setInstallmentValue('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Nova Dívida / Financiamento</Text>
                        <TouchableOpacity onPress={onClose}><X size={24} color="#000" /></TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <Text style={styles.label}>O que você comprou?</Text>
                        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ex: Carro Novo" placeholderTextColor="#94a3b8" />

                        <Text style={styles.label}>Valor Total Financiado</Text>
                        <TextInput style={styles.input} value={totalAmount} onChangeText={setTotalAmount} keyboardType="numeric" placeholder="R$ 35.000,00" placeholderTextColor="#94a3b8" />

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Text style={styles.label}>Qtd. Parcelas</Text>
                                <TextInput style={styles.input} value={installments} onChangeText={setInstallments} keyboardType="numeric" placeholder="36" placeholderTextColor="#94a3b8" />
                            </View>
                            <View style={styles.halfInput}>
                                <Text style={styles.label}>Valor da Parcela</Text>
                                <TextInput style={styles.input} value={installmentValue} onChangeText={setInstallmentValue} keyboardType="numeric" placeholder="R$ 986" placeholderTextColor="#94a3b8" />
                            </View>
                        </View>

                        <Text style={styles.hint}>Vamos acompanhar quanto falta para você se livrar dessa conta!</Text>
                    </ScrollView>

                    <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
                        <Text style={styles.createBtnText}>Adicionar Dívida</Text>
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
    title: { fontSize: 18, fontWeight: '900' },
    content: { padding: 20 },
    label: { fontSize: 13, fontWeight: 'bold', color: '#64748b', marginBottom: 8, marginTop: 12 },
    input: { borderWidth: 2, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#f8fafc', color: '#0f172a' },
    row: { flexDirection: 'row', gap: 12 },
    halfInput: { flex: 1 },
    hint: { fontSize: 12, color: '#94a3b8', marginTop: 16, fontStyle: 'italic', textAlign: 'center' },
    createBtn: { margin: 20, backgroundColor: '#EF4444', padding: 16, borderRadius: 12, alignItems: 'center' },
    createBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
