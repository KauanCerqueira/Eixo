import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { X, Moon, Frown, Smile, Meh } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

interface AddCycleEntryModalProps {
    visible: boolean;
    onClose: () => void;
}

const SYMPTOMS = [
    'Cólica', 'Dor de Cabeça', 'Fadiga', 'Inchaço', 'Acne', 'Desejo por Doce', 'Insônia'
];

export const AddCycleEntryModal = ({ visible, onClose }: AddCycleEntryModalProps) => {
    const { addCycleDay } = useApp();
    const [flowIntensity, setFlowIntensity] = useState<'light' | 'medium' | 'heavy'>('medium');
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [mood, setMood] = useState<'happy' | 'sad' | 'anxious' | 'irritable' | 'neutral' | undefined>(undefined);
    const [notes, setNotes] = useState('');

    const toggleSymptom = (sym: string) => {
        if (selectedSymptoms.includes(sym)) {
            setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
        } else {
            setSelectedSymptoms([...selectedSymptoms, sym]);
        }
    };

    const handleSave = () => {
        addCycleDay({
            date: new Date().toISOString(),
            flowIntensity,
            symptoms: selectedSymptoms,
            mood,
            notes: notes.trim()
        });

        // Reset
        setFlowIntensity('medium');
        setSelectedSymptoms([]);
        setMood(undefined);
        setNotes('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Registrar Ciclo</Text>
                        <TouchableOpacity onPress={onClose}><X size={24} color="#0f172a" /></TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                        <Text style={styles.label}>Intensidade do Fluxo</Text>
                        <View style={styles.flowRow}>
                            <TouchableOpacity
                                style={[styles.flowBtn, flowIntensity === 'light' && { backgroundColor: '#FCD34D', borderColor: '#F59E0B' }]}
                                onPress={() => setFlowIntensity('light')}
                            >
                                <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
                                <Text style={styles.flowText}>Leve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.flowBtn, flowIntensity === 'medium' && { backgroundColor: '#F97316', borderColor: '#EA580C' }]}
                                onPress={() => setFlowIntensity('medium')}
                            >
                                <View style={[styles.dot, { backgroundColor: '#fff' }]} />
                                <Text style={[styles.flowText, flowIntensity === 'medium' && { color: '#fff' }]}>Médio</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.flowBtn, flowIntensity === 'heavy' && { backgroundColor: '#EF4444', borderColor: '#B91C1C' }]}
                                onPress={() => setFlowIntensity('heavy')}
                            >
                                <View style={[styles.dot, { backgroundColor: '#fff' }]} />
                                <Text style={[styles.flowText, flowIntensity === 'heavy' && { color: '#fff' }]}>Intenso</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Sintomas</Text>
                        <View style={styles.symptomsGrid}>
                            {SYMPTOMS.map(sym => (
                                <TouchableOpacity
                                    key={sym}
                                    style={[styles.symptomBtn, selectedSymptoms.includes(sym) && styles.symptomBtnActive]}
                                    onPress={() => toggleSymptom(sym)}
                                >
                                    <Text style={[styles.symptomText, selectedSymptoms.includes(sym) && styles.symptomTextActive]}>{sym}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Humor</Text>
                        <View style={styles.moodRow}>
                            {['happy', 'neutral', 'sad', 'irritable', 'anxious'].map((m) => (
                                <TouchableOpacity
                                    key={m}
                                    style={[styles.moodBtn, mood === m && styles.moodBtnActive]}
                                    onPress={() => setMood(m as any)}
                                >
                                    <Text style={{ fontSize: 24 }}>
                                        {m === 'happy' ? '😊' : m === 'neutral' ? '😐' : m === 'sad' ? '😢' : m === 'irritable' ? '😠' : '😰'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                    </ScrollView>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveBtnText}>Salvar Registro</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    title: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
    content: { padding: 20 },

    label: { fontSize: 13, fontWeight: 'bold', color: '#64748b', marginBottom: 12, marginTop: 4 },

    flowRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    flowBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
    flowText: { fontWeight: '700', color: '#64748b' },
    dot: { width: 8, height: 8, borderRadius: 4 },

    symptomsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
    symptomBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
    symptomBtnActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
    symptomText: { fontWeight: '600', color: '#64748b' },
    symptomTextActive: { color: '#fff' },

    moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    moodBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
    moodBtnActive: { borderColor: '#8B5CF6', backgroundColor: '#EDE9FE' },

    saveBtn: { margin: 20, padding: 16, borderRadius: 16, backgroundColor: '#0f172a', alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
