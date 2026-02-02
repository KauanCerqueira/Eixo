import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { X, Dumbbell, Clock, Flame, FileText, Activity } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

interface AddWorkoutModalProps {
    visible: boolean;
    onClose: () => void;
}

const INTENSITIES = [
    { id: 'low', label: 'Leve', color: '#3B82F6' },
    { id: 'medium', label: 'Moderado', color: '#F59E0B' },
    { id: 'high', label: 'Intenso', color: '#EF4444' },
];

export const AddWorkoutModal = ({ visible, onClose }: AddWorkoutModalProps) => {
    const { addWorkoutSession } = useApp();

    const [type, setType] = useState('');
    const [duration, setDuration] = useState('');
    const [calories, setCalories] = useState('');
    const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
    const [notes, setNotes] = useState('');

    const handleSave = () => {
        if (!type || !duration) return;

        addWorkoutSession({
            type,
            duration: parseInt(duration),
            calories: calories ? parseInt(calories) : undefined,
            intensity,
            notes,
            date: new Date().toISOString(),
            exercises: [], // Future: Add exercise list builder
            durationMinutes: parseInt(duration) // Mapping for type compatibility if needed
        });

        setType('');
        setDuration('');
        setCalories('');
        setNotes('');
        setIntensity('medium');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Registrar Treino</Text>
                        <TouchableOpacity onPress={onClose}><X size={24} color="#0f172a" /></TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                        <Text style={styles.label}>Atividade</Text>
                        <TextInput
                            style={styles.input}
                            value={type}
                            onChangeText={setType}
                            placeholder="Ex: Musculação, Corrida, Yoga"
                            placeholderTextColor="#94a3b8"
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Duração (min)</Text>
                                <View style={styles.inputIconContainer}>
                                    <Clock size={18} color="#94a3b8" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.inputWithIcon}
                                        value={duration}
                                        onChangeText={setDuration}
                                        placeholder="0"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Calorias</Text>
                                <View style={styles.inputIconContainer}>
                                    <Flame size={18} color="#94a3b8" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.inputWithIcon}
                                        value={calories}
                                        onChangeText={setCalories}
                                        placeholder="0"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </View>

                        <Text style={styles.label}>Intensidade</Text>
                        <View style={styles.intensityContainer}>
                            {INTENSITIES.map(int => (
                                <TouchableOpacity
                                    key={int.id}
                                    style={[
                                        styles.intensityBtn,
                                        intensity === int.id && { backgroundColor: int.color, borderColor: int.color }
                                    ]}
                                    onPress={() => setIntensity(int.id as any)}
                                >
                                    <Text style={[styles.intensityText, intensity === int.id && { color: '#fff' }]}>{int.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Notas</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Como você se sentiu? Cargas aumentaram?"
                            placeholderTextColor="#94a3b8"
                            multiline
                            numberOfLines={3}
                        />

                    </ScrollView>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveBtnText}>Salvar Treino</Text>
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

    row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    inputIconContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12 },
    inputIcon: { marginLeft: 14 },
    inputWithIcon: { flex: 1, padding: 14, fontSize: 16, color: '#0f172a', fontWeight: '500' },

    intensityContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    intensityBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
    intensityText: { fontWeight: '700', color: '#64748b' },

    textArea: { height: 80, textAlignVertical: 'top' },

    saveBtn: { margin: 20, padding: 16, borderRadius: 16, backgroundColor: '#0f172a', alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
