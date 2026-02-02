import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { X, CreditCard, Calendar } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

interface AddSubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
}

export const AddSubscriptionModal = ({ visible, onClose }: AddSubscriptionModalProps) => {
    const { addSubscription } = useApp();
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [day, setDay] = useState('');

    const handleCreate = () => {
        if (!title || !amount) return;

        addSubscription({
            title: title.trim(),
            amount: parseFloat(amount),
            dueDateDay: parseInt(day) || 10,
            category: 'outros' as any // simplifying for now
        });

        setTitle(''); setAmount(''); setDay('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Nova Assinatura / Custo Fixo</Text>
                        <TouchableOpacity onPress={onClose}><X size={24} color="#000" /></TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <Text style={styles.label}>Nome do Serviço</Text>
                        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ex: Netflix" placeholderTextColor="#94a3b8" />

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Text style={styles.label}>Valor Mensal</Text>
                                <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="R$ 55.90" placeholderTextColor="#94a3b8" />
                            </View>
                            <View style={styles.halfInput}>
                                <Text style={styles.label}>Dia Vencimento</Text>
                                <TextInput style={styles.input} value={day} onChangeText={setDay} keyboardType="numeric" placeholder="10" placeholderTextColor="#94a3b8" />
                            </View>
                        </View>

                        <Text style={styles.hint}>Isso entrará no cálculo do seu "Custo de Vida".</Text>
                    </ScrollView>

                    <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
                        <Text style={styles.createBtnText}>Adicionar Assinatura</Text>
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
    createBtn: { margin: 20, backgroundColor: '#3B82F6', padding: 16, borderRadius: 12, alignItems: 'center' },
    createBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
