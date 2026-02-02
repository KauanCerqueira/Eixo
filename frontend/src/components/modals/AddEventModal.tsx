import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

interface AddEventModalProps {
    visible: boolean;
    onClose: () => void;
}

export const AddEventModal = ({ visible, onClose }: AddEventModalProps) => {
    const { addEvent } = useApp();
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [isFamily, setIsFamily] = useState(true);

    const handleCreate = () => {
        if (!title.trim() || !date.trim()) return;

        addEvent({
            title: title.trim(),
            date: date.trim(),
            time: time.trim(),
            isFamily,
            type: 'event'
        });

        // Reset
        setTitle('');
        setDate('');
        setTime('');
        setIsFamily(true);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Novo Evento</Text>
                        <TouchableOpacity onPress={onClose}><X size={24} color="#000" /></TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <Text style={styles.label}>Título do Evento</Text>
                        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ex: Aniversário da Vó" placeholderTextColor="#94a3b8" />

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Text style={styles.label}>Data (DD/MM)</Text>
                                <View style={styles.iconInput}>
                                    <CalendarIcon size={18} color="#64748b" style={styles.inputIcon} />
                                    <TextInput style={[styles.input, styles.pl40]} value={date} onChangeText={setDate} placeholder="25/12" placeholderTextColor="#94a3b8" />
                                </View>
                            </View>
                            <View style={styles.halfInput}>
                                <Text style={styles.label}>Hora (Opcional)</Text>
                                <View style={styles.iconInput}>
                                    <Clock size={18} color="#64748b" style={styles.inputIcon} />
                                    <TextInput style={[styles.input, styles.pl40]} value={time} onChangeText={setTime} placeholder="19:00" placeholderTextColor="#94a3b8" />
                                </View>
                            </View>
                        </View>

                        <View style={styles.switchRow}>
                            <View>
                                <Text style={styles.switchLabel}>Evento Familiar?</Text>
                                <Text style={styles.switchSub}>Se ativado, aparece para todos (NÓS).</Text>
                            </View>
                            <Switch value={isFamily} onValueChange={setIsFamily} trackColor={{ false: '#e2e8f0', true: '#3B82F6' }} />
                        </View>
                    </ScrollView>

                    <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
                        <Text style={styles.createBtnText}>Agendar Evento</Text>
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
    title: { fontSize: 20, fontWeight: '900' },
    content: { padding: 20 },
    label: { fontSize: 13, fontWeight: 'bold', color: '#64748b', marginBottom: 8, marginTop: 12 },
    input: { borderWidth: 2, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#f8fafc', color: '#0f172a' },

    row: { flexDirection: 'row', gap: 12 },
    halfInput: { flex: 1 },
    iconInput: { position: 'relative', justifyContent: 'center' },
    inputIcon: { position: 'absolute', left: 14, zIndex: 1 },
    pl40: { paddingLeft: 44 },

    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, padding: 16, backgroundColor: '#f1f5f9', borderRadius: 12 },
    switchLabel: { fontWeight: 'bold', fontSize: 15 },
    switchSub: { fontSize: 12, color: '#64748b' },

    createBtn: { margin: 20, backgroundColor: '#3B82F6', padding: 16, borderRadius: 12, alignItems: 'center' },
    createBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
