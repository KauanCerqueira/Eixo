import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

// Inlined to prevent circular dependency
const HABIT_CATEGORIES = [
    { id: 'saude', label: 'Saúde', icon: '❤️' },
    { id: 'fitness', label: 'Fitness', icon: '💪' },
    { id: 'estudo', label: 'Estudos', icon: '📚' },
    { id: 'produtividade', label: 'Produtividade', icon: '⚡' },
];

interface AddHabitModalProps {
    visible: boolean;
    onClose: () => void;
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

export const AddHabitModal = ({ visible, onClose }: AddHabitModalProps) => {
    const { addHabit } = useApp();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('fitness');
    const [target, setTarget] = useState('');
    const [unit, setUnit] = useState('');
    const [color, setColor] = useState(COLORS[0]);

    const handleSave = () => {
        if (!title.trim() || !target) return;
        addHabit({ title: title.trim(), category: category as any, current: 0, target: parseInt(target) || 1, unit: unit.trim() || 'vezes', color });
        setTitle(''); setTarget(''); setUnit('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Novo Hábito</Text>
                        <TouchableOpacity onPress={onClose}><X size={24} color="#000" /></TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <Text style={styles.label}>Título</Text>
                        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ex: Beber água" placeholderTextColor="#94a3b8" />

                        <Text style={styles.label}>Categoria</Text>
                        <View style={styles.optionsRow}>
                            {HABIT_CATEGORIES.map(cat => (
                                <TouchableOpacity key={cat.id} style={[styles.catBtn, category === cat.id && styles.catActive]} onPress={() => setCategory(cat.id)}>
                                    <Text style={styles.catIcon}>{cat.icon}</Text>
                                    <Text style={[styles.catText, category === cat.id && styles.catTextActive]}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Text style={styles.label}>Meta diária</Text>
                                <TextInput style={styles.input} value={target} onChangeText={setTarget} placeholder="3" keyboardType="numeric" placeholderTextColor="#94a3b8" />
                            </View>
                            <View style={styles.halfInput}>
                                <Text style={styles.label}>Unidade</Text>
                                <TextInput style={styles.input} value={unit} onChangeText={setUnit} placeholder="litros" placeholderTextColor="#94a3b8" />
                            </View>
                        </View>

                        <Text style={styles.label}>Cor</Text>
                        <View style={styles.colorsRow}>
                            {COLORS.map(c => (
                                <TouchableOpacity key={c} style={[styles.colorBtn, { backgroundColor: c }, color === c && styles.colorActive]} onPress={() => setColor(c)} />
                            ))}
                        </View>
                    </ScrollView>

                    <TouchableOpacity style={[styles.saveBtn, { backgroundColor: color }]} onPress={handleSave}>
                        <Text style={styles.saveBtnText}>Criar Hábito</Text>
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
    label: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 8, marginTop: 12 },
    input: { borderWidth: 2, borderColor: '#000', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#f8fafc' },
    optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    catBtn: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 2, borderColor: '#e2e8f0' },
    catActive: { borderColor: '#FACC15', backgroundColor: '#FEF9C3' },
    catIcon: { fontSize: 16, marginRight: 6 },
    catText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    catTextActive: { color: '#000' },
    row: { flexDirection: 'row', gap: 12 },
    halfInput: { flex: 1 },
    colorsRow: { flexDirection: 'row', gap: 12 },
    colorBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: 'transparent' },
    colorActive: { borderColor: '#000' },
    saveBtn: { margin: 20, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#000' },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
