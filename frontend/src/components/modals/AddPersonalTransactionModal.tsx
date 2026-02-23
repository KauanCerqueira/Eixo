import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { X, Calendar, TrendingUp, TrendingDown, Layers, FileText } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

interface AddPersonalTransactionModalProps {
    visible: boolean;
    onClose: () => void;
}

const CATEGORIES = [
    { id: 'geral', label: 'Geral', icon: '📦', color: '#64748B' },
    { id: 'alimentacao', label: 'Alimentação', icon: '🍔', color: '#22C55E' },
    { id: 'transporte', label: 'Transporte', icon: '🚗', color: '#F59E0B' },
    { id: 'lazer', label: 'Lazer', icon: '🎮', color: '#8B5CF6' },
    { id: 'saude', label: 'Saúde', icon: '❤️', color: '#EF4444' },
    { id: 'salario', label: 'Salário', icon: '💼', color: '#10B981' },
    { id: 'investimento', label: 'Investimento', icon: '📈', color: '#3B82F6' },
];

export const AddPersonalTransactionModal = ({ visible, onClose }: AddPersonalTransactionModalProps) => {
    const { addPersonalTransaction, currentUser } = useApp();

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState('geral');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Simple YYYY-MM-DD for now

    const handleSave = () => {
        if (!title.trim() || !amount || !currentUser) return;

        addPersonalTransaction({
            userId: currentUser.id,
            title: title.trim(),
            amount: parseFloat(amount) || 0,
            type,
            category,
            description: description.trim(),
            date: new Date(date).toISOString(),
        });

        // Reset
        setTitle('');
        setAmount('');
        setType('expense');
        setCategory('geral');
        setDescription('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Nova Movimentação</Text>
                        <TouchableOpacity onPress={onClose}><X size={24} color="#0f172a" /></TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                        {/* Type Switcher */}
                        <View style={styles.typeSwitcher}>
                            <TouchableOpacity
                                style={[styles.typeBtn, type === 'expense' && styles.typeBtnActiveExpense]}
                                onPress={() => setType('expense')}
                            >
                                <TrendingDown size={20} color={type === 'expense' ? '#fff' : '#64748b'} />
                                <Text style={[styles.typeBtnText, type === 'expense' && { color: '#fff' }]}>Despesa</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, type === 'income' && styles.typeBtnActiveIncome]}
                                onPress={() => setType('income')}
                            >
                                <TrendingUp size={20} color={type === 'income' ? '#fff' : '#64748b'} />
                                <Text style={[styles.typeBtnText, type === 'income' && { color: '#fff' }]}>Receita</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Valor (R$)</Text>
                        <TextInput
                            style={[styles.input, styles.amountInput, { color: type === 'income' ? '#10B981' : '#EF4444' }]}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0,00"
                            placeholderTextColor="#64748b"
                            keyboardType="numeric"
                        />

                        <Text style={styles.label}>Título</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder={type === 'income' ? "Ex: Salário, Venda" : "Ex: Almoço, Uber"}
                            placeholderTextColor="#64748b"
                        />

                        <Text style={styles.label}>Categoria</Text>
                        <View style={styles.categoriesGrid}>
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.catBtn, category === cat.id && { borderColor: cat.color, backgroundColor: cat.color + '10' }]}
                                    onPress={() => setCategory(cat.id)}
                                >
                                    <Text style={styles.catIcon}>{cat.icon}</Text>
                                    <Text style={[styles.catText, category === cat.id && { color: cat.color }]}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
                            <FileText size={16} color="#64748b" style={{ marginRight: 6 }} />
                            <Text style={styles.labelNoMargin}>Descrição (Opcional)</Text>
                        </View>
                        <TextInput
                            style={[styles.input, { marginTop: 8 }]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Adicione detalhes..."
                            placeholderTextColor="#64748b"
                        />

                        {/* Date summary */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
                            <Calendar size={16} color="#64748b" style={{ marginRight: 6 }} />
                            <Text style={styles.labelNoMargin}>Data</Text>
                        </View>
                        <TouchableOpacity style={styles.dateBtn}>
                            <Text style={styles.dateText}>Hoje ({new Date().toLocaleDateString()})</Text>
                        </TouchableOpacity>

                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: type === 'income' ? '#10B981' : '#EF4444' }]}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveBtnText}>Salvar Movimentação</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    title: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
    content: { padding: 20 },

    typeSwitcher: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 4, borderRadius: 12, marginBottom: 20 },
    typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 10, gap: 8 },
    typeBtnActiveExpense: { backgroundColor: '#EF4444' },
    typeBtnActiveIncome: { backgroundColor: '#10B981' },
    typeBtnText: { fontWeight: '700', color: '#64748b' },

    label: { fontSize: 13, fontWeight: 'bold', color: '#64748b', marginBottom: 8, marginTop: 4 },
    labelNoMargin: { fontSize: 13, fontWeight: 'bold', color: '#64748b' },

    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 16, color: '#0f172a', fontWeight: '500', marginBottom: 12 },
    amountInput: { fontSize: 32, fontWeight: '900', textAlign: 'center', paddingVertical: 20, borderColor: 'transparent', backgroundColor: 'transparent' },

    categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    catBtn: { width: '48%', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
    catIcon: { fontSize: 18, marginRight: 8 },
    catText: { fontSize: 13, fontWeight: '600', color: '#64748b' },

    dateBtn: { marginTop: 8, padding: 14, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
    dateText: { fontWeight: '600', color: '#334155' },

    saveBtn: { margin: 20, padding: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
