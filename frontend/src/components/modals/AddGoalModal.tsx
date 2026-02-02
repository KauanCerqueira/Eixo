import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { X, Target, Banknote, User } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

interface AddGoalModalProps {
    visible: boolean;
    onClose: () => void;
}

export const AddGoalModal = ({ visible, onClose }: AddGoalModalProps) => {
    const { addGoal } = useApp();
    const [title, setTitle] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [type, setType] = useState<'finance' | 'general'>('finance');
    const [unit, setUnit] = useState('');

    const handleCreate = () => {
        if (!title || !targetAmount) return;

        addGoal({
            title: title.trim(),
            description: description.trim(),
            targetAmount: parseFloat(targetAmount),
            currentAmount: 0,
            deadline: deadline || undefined,
            type,
            unit: type === 'finance' ? 'R$' : unit || 'un'
        });

        // Reset
        setTitle(''); setTargetAmount(''); setDescription(''); setDeadline(''); setType('finance'); setUnit('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Definir Meta Familiar 🎯</Text>
                        <TouchableOpacity onPress={onClose}><X size={24} color="#000" /></TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>

                        {/* Type Selector */}
                        <View style={styles.typeSelector}>
                            <TouchableOpacity
                                style={[styles.typeBtn, type === 'finance' && styles.typeBtnActive]}
                                onPress={() => setType('finance')}
                            >
                                <Banknote size={20} color={type === 'finance' ? '#fff' : '#64748b'} />
                                <Text style={[styles.typeText, type === 'finance' && styles.typeTextActive]}>Financeira</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.typeBtn, type === 'general' && styles.typeBtnActive]}
                                onPress={() => setType('general')}
                            >
                                <Target size={20} color={type === 'general' ? '#fff' : '#64748b'} />
                                <Text style={[styles.typeText, type === 'general' && styles.typeTextActive]}>Geral / Hábito</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Título da Meta</Text>
                        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder={type === 'finance' ? "Ex: Viagem Disney" : "Ex: Sem Palavrão"} placeholderTextColor="#94a3b8" />

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Text style={styles.label}>Alvo</Text>
                                <TextInput style={styles.input} value={targetAmount} onChangeText={setTargetAmount} keyboardType="numeric" placeholder={type === 'finance' ? "R$ 10.000" : "30"} placeholderTextColor="#94a3b8" />
                            </View>

                            {type === 'general' && (
                                <View style={styles.halfInput}>
                                    <Text style={styles.label}>Unidade</Text>
                                    <TextInput style={styles.input} value={unit} onChangeText={setUnit} placeholder="dias, vezes, km" placeholderTextColor="#94a3b8" />
                                </View>
                            )}

                            {type === 'finance' && (
                                <View style={styles.halfInput}>
                                    <Text style={styles.label}>Data Limite</Text>
                                    <TextInput style={styles.input} value={deadline} onChangeText={setDeadline} placeholder="31/12" placeholderTextColor="#94a3b8" />
                                </View>
                            )}
                        </View>

                        <Text style={styles.label}>Descrição / Motivação</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Detalhe seu plano, motivações e o que precisa ser feito..."
                            placeholderTextColor="#94a3b8"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </ScrollView>

                    <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
                        <Text style={styles.createBtnText}>Criar Meta</Text>
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
    title: { fontSize: 18, fontWeight: '900', color: '#8B5CF6' },
    content: { padding: 20 },
    label: { fontSize: 13, fontWeight: 'bold', color: '#64748b', marginBottom: 8, marginTop: 12 },
    input: { borderWidth: 2, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#f8fafc', color: '#0f172a' },
    textArea: { height: 100 },
    row: { flexDirection: 'row', gap: 12 },
    halfInput: { flex: 1 },

    typeSelector: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 4, borderRadius: 12, marginBottom: 12 },
    typeBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 10, gap: 8 },
    typeBtnActive: { backgroundColor: '#8B5CF6', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    typeText: { fontWeight: '600', color: '#64748b' },
    typeTextActive: { color: '#fff', fontWeight: 'bold' },

    createBtn: { margin: 20, backgroundColor: '#8B5CF6', padding: 16, borderRadius: 12, alignItems: 'center' },
    createBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
