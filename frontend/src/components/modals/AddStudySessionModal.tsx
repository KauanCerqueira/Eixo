import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { X, BookOpen, Clock, FileText } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

interface AddStudySessionModalProps {
    visible: boolean;
    onClose: () => void;
}

const SUBJECTS = [
    { id: 'math', label: 'Matemática', color: '#3B82F6' },
    { id: 'english', label: 'Inglês', color: '#EF4444' },
    { id: 'programming', label: 'Programação', color: '#10B981' },
    { id: 'history', label: 'História', color: '#F59E0B' },
    { id: 'other', label: 'Outro', color: '#64748B' },
];

export const AddStudySessionModal = ({ visible, onClose }: AddStudySessionModalProps) => {
    const { addStudySession } = useApp();

    const [subject, setSubject] = useState('');
    const [topic, setTopic] = useState('');
    const [duration, setDuration] = useState('');
    const [notes, setNotes] = useState('');

    const handleSave = () => {
        if (!subject || !duration) return;

        addStudySession({
            subject,
            topic, // Added to type in previous steps if not already there, assumed ok for now as flexible
            durationMinutes: parseInt(duration), // Maps to duration in type
            date: new Date().toISOString(),
            notes
        });

        setSubject('');
        setTopic('');
        setDuration('');
        setNotes('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Registrar Estudo</Text>
                        <TouchableOpacity onPress={onClose}><X size={24} color="#0f172a" /></TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                        <Text style={styles.label}>Matéria Principal</Text>
                        <View style={styles.subjectsGrid}>
                            {SUBJECTS.map(sub => (
                                <TouchableOpacity
                                    key={sub.id}
                                    style={[styles.subBtn, subject === sub.label && { backgroundColor: sub.color, borderColor: sub.color }]}
                                    onPress={() => setSubject(sub.label)}
                                >
                                    <Text style={[styles.subText, subject === sub.label && { color: '#fff' }]}>{sub.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            style={[styles.input, { marginTop: 8 }]}
                            value={subject}
                            onChangeText={setSubject}
                            placeholder="Ou digite outra..."
                            placeholderTextColor="#94a3b8"
                        />

                        <Text style={styles.label}>Tópico Específico</Text>
                        <TextInput
                            style={styles.input}
                            value={topic}
                            onChangeText={setTopic}
                            placeholder="Ex: Verbos Irregulares, Equações..."
                            placeholderTextColor="#94a3b8"
                        />

                        <Text style={styles.label}>Duração (minutos)</Text>
                        <View style={styles.inputIconContainer}>
                            <Clock size={18} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.inputWithIcon, { fontWeight: 'bold' }]}
                                value={duration}
                                onChangeText={setDuration}
                                placeholder="60"
                                placeholderTextColor="#94a3b8"
                                keyboardType="numeric"
                            />
                        </View>

                        <Text style={styles.label}>Notas</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Resumo breve ou pontos importantes..."
                            placeholderTextColor="#94a3b8"
                            multiline
                            numberOfLines={3}
                        />

                    </ScrollView>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveBtnText}>Salvar Sessão</Text>
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

    subjectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    subBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
    subText: { fontWeight: '600', color: '#64748b' },

    inputIconContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, marginBottom: 16 },
    inputIcon: { marginLeft: 14 },
    inputWithIcon: { flex: 1, padding: 14, fontSize: 18, color: '#0f172a', fontWeight: '500' },

    textArea: { height: 80, textAlignVertical: 'top' },

    saveBtn: { margin: 20, padding: 16, borderRadius: 16, backgroundColor: '#0f172a', alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
