import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { X, Utensils, Flame, Droplets } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

interface AddMealModalProps {
    visible: boolean;
    onClose: () => void;
}

const MEAL_TYPES = [
    { id: 'breakfast', label: 'Café da Manhã', icon: '☕' },
    { id: 'lunch', label: 'Almoço', icon: '🍲' },
    { id: 'snack', label: 'Lanche', icon: '🍎' },
    { id: 'dinner', label: 'Jantar', icon: '🌙' },
];

export const AddMealModal = ({ visible, onClose }: AddMealModalProps) => {
    const { addMealLog } = useApp();

    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');
    const [mealType, setMealType] = useState('lunch');

    const handleSave = () => {
        if (!name || !calories) return;

        addMealLog({
            items: [name],
            type: mealType as any,
            calories: parseInt(calories),
            protein: protein ? parseInt(protein) : undefined,
            carbs: carbs ? parseInt(carbs) : undefined,
            fat: fat ? parseInt(fat) : undefined,
            date: new Date().toISOString(),
            waterIntakeMl: 0 // handled separately
        });

        setName('');
        setCalories('');
        setProtein('');
        setCarbs('');
        setFat('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Registrar Refeição</Text>
                        <TouchableOpacity onPress={onClose}><X size={24} color="#0f172a" /></TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                        <Text style={styles.label}>Tipo de Refeição</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                            {MEAL_TYPES.map(type => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[styles.typeBtn, mealType === type.id && styles.typeBtnActive]}
                                    onPress={() => setMealType(type.id)}
                                >
                                    <Text style={styles.typeIcon}>{type.icon}</Text>
                                    <Text style={[styles.typeText, mealType === type.id && styles.typeTextActive]}>{type.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.label}>O que você comeu?</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Ex: Arroz, Feijão e Frango"
                            placeholderTextColor="#94a3b8"
                        />

                        <Text style={styles.label}>Calorias (kcal)</Text>
                        <View style={styles.inputIconContainer}>
                            <Flame size={18} color="#EF4444" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.inputWithIcon, { color: '#EF4444', fontWeight: '900' }]}
                                value={calories}
                                onChangeText={setCalories}
                                placeholder="0"
                                placeholderTextColor="#94a3b8"
                                keyboardType="numeric"
                            />
                        </View>

                        <Text style={styles.label}>Macronutrientes (Opcional)</Text>
                        <View style={styles.macrosRow}>
                            <View style={styles.macroCol}>
                                <Text style={styles.macroLabel}>Prot (g)</Text>
                                <TextInput style={styles.macroInput} value={protein} onChangeText={setProtein} placeholder="0" keyboardType="numeric" />
                            </View>
                            <View style={styles.macroCol}>
                                <Text style={styles.macroLabel}>Carb (g)</Text>
                                <TextInput style={styles.macroInput} value={carbs} onChangeText={setCarbs} placeholder="0" keyboardType="numeric" />
                            </View>
                            <View style={styles.macroCol}>
                                <Text style={styles.macroLabel}>Gord (g)</Text>
                                <TextInput style={styles.macroInput} value={fat} onChangeText={setFat} placeholder="0" keyboardType="numeric" />
                            </View>
                        </View>

                    </ScrollView>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveBtnText}>Salvar Refeição</Text>
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

    label: { fontSize: 13, fontWeight: 'bold', color: '#64748b', marginBottom: 8, marginTop: 4 },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 16, color: '#0f172a', fontWeight: '500', marginBottom: 16 },

    typeBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', marginRight: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
    typeBtnActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
    typeIcon: { fontSize: 16 },
    typeText: { fontWeight: '600', color: '#64748b' },
    typeTextActive: { color: '#fff' },

    inputIconContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, marginBottom: 16 },
    inputIcon: { marginLeft: 14 },
    inputWithIcon: { flex: 1, padding: 14, fontSize: 18, color: '#0f172a', fontWeight: '500' },

    macrosRow: { flexDirection: 'row', gap: 12 },
    macroCol: { flex: 1 },
    macroLabel: { fontSize: 11, fontWeight: 'bold', color: '#64748b', marginBottom: 4, textAlign: 'center' },
    macroInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, textAlign: 'center', fontSize: 16, fontWeight: 'bold' },

    saveBtn: { margin: 20, padding: 16, borderRadius: 16, backgroundColor: '#0f172a', alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
