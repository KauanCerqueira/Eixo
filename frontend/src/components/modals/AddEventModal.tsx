import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Switch,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { X, Calendar as CalendarIcon, Clock, MapPin, FileText } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import { useApp } from '../../context/AppContext';
import { AgendaEvent } from '../../services/api';

interface AddEventModalProps {
    visible: boolean;
    onClose: () => void;
    editingEvent?: AgendaEvent | null;
}

const normalizeTimeInput = (value: string): string => {
    const cleaned = value.replace(/[^\d:]/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.includes(':')) return cleaned.slice(0, 5);
    return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
};

const isValidTime = (value: string): boolean => {
    if (!value) return true;
    const match = /^(\d{2}):(\d{2})$/.exec(value);
    if (!match) return false;
    const hh = Number(match[1]);
    const mm = Number(match[2]);
    return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
};

export const AddEventModal = ({ visible, onClose, editingEvent }: AddEventModalProps) => {
    const { addEvent, updateEvent, currentUser } = useApp();
    const isEdit = !!editingEvent;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [time, setTime] = useState('');
    const [isFamily, setIsFamily] = useState(true);

    useEffect(() => {
        if (!visible) return;
        if (editingEvent) {
            setTitle(editingEvent.title || '');
            setDescription(editingEvent.description || '');
            setLocation(editingEvent.location || '');
            setSelectedDate((editingEvent.date || '').slice(0, 10));
            setTime(editingEvent.time ? String(editingEvent.time).slice(0, 5) : '');
            setIsFamily(!!editingEvent.isFamily);
            return;
        }

        const today = new Date().toISOString().slice(0, 10);
        setTitle('');
        setDescription('');
        setLocation('');
        setSelectedDate(today);
        setTime('');
        setIsFamily(true);
    }, [visible, editingEvent]);

    const markedDates = useMemo(() => {
        if (!selectedDate) return {};
        return {
            [selectedDate]: {
                selected: true,
                selectedColor: '#FACC15',
                selectedTextColor: '#000'
            }
        };
    }, [selectedDate]);

    const handleSubmit = async () => {
        if (!title.trim() || !selectedDate) {
            Alert.alert('Dados obrigatórios', 'Informe título e data do evento.');
            return;
        }
        if (!isValidTime(time)) {
            Alert.alert('Hora inválida', 'Use o formato HH:MM, por exemplo 19:30.');
            return;
        }

        try {
            if (isEdit && editingEvent) {
                await updateEvent(editingEvent.id, {
                    title: title.trim(),
                    description: description.trim() || undefined,
                    location: location.trim() || undefined,
                    date: selectedDate,
                    time: time || undefined,
                    isFamily,
                    type: 'event'
                });
            } else {
                await addEvent({
                    title: title.trim(),
                    description: description.trim() || undefined,
                    location: location.trim() || undefined,
                    date: selectedDate,
                    time: time || undefined,
                    isFamily,
                    type: 'event',
                    createdByUserId: currentUser?.id
                });
            }
            onClose();
        } catch (error: any) {
            Alert.alert('Erro', error?.message || 'Não foi possível salvar o evento.');
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboard}
                >
                    <View style={styles.modal}>
                        <View style={styles.header}>
                            <Text style={styles.title}>{isEdit ? 'Editar Evento' : 'Novo Evento'}</Text>
                            <TouchableOpacity onPress={onClose}><X size={24} color="#000" /></TouchableOpacity>
                        </View>

                        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                            <Text style={styles.label}>Título</Text>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Ex: Almoço em família"
                                placeholderTextColor="#64748b"
                            />

                            <Text style={styles.label}>Data</Text>
                            <Calendar
                                markedDates={markedDates}
                                onDayPress={(day: any) => setSelectedDate(day.dateString)}
                                enableSwipeMonths
                                theme={{
                                    selectedDayBackgroundColor: '#FACC15',
                                    selectedDayTextColor: '#000',
                                    todayTextColor: '#FACC15',
                                    arrowColor: '#111827',
                                    monthTextColor: '#111827'
                                }}
                            />

                            <Text style={styles.label}>Hora (opcional)</Text>
                            <View style={styles.iconInput}>
                                <Clock size={18} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, styles.pl40]}
                                    value={time}
                                    onChangeText={(v) => setTime(normalizeTimeInput(v))}
                                    placeholder="19:30"
                                    placeholderTextColor="#64748b"
                                    keyboardType="numbers-and-punctuation"
                                />
                            </View>

                            <Text style={styles.label}>Local (opcional)</Text>
                            <View style={styles.iconInput}>
                                <MapPin size={18} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, styles.pl40]}
                                    value={location}
                                    onChangeText={setLocation}
                                    placeholder="Ex: Casa / Mercado / Escola"
                                    placeholderTextColor="#64748b"
                                />
                            </View>

                            <Text style={styles.label}>Descrição (opcional)</Text>
                            <View style={styles.iconInput}>
                                <FileText size={18} color="#64748b" style={styles.inputIconTop} />
                                <TextInput
                                    style={[styles.input, styles.pl40, styles.textArea]}
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={3}
                                    placeholder="Detalhes úteis do evento..."
                                    placeholderTextColor="#64748b"
                                />
                            </View>

                            <View style={styles.switchRow}>
                                <View>
                                    <Text style={styles.switchLabel}>Evento da família</Text>
                                    <Text style={styles.switchSub}>Se ativado, aparece no modo NÓS para todos.</Text>
                                </View>
                                <Switch
                                    value={isFamily}
                                    onValueChange={setIsFamily}
                                    trackColor={{ false: '#e2e8f0', true: '#3B82F6' }}
                                />
                            </View>
                        </ScrollView>

                        <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
                            <CalendarIcon size={18} color="#fff" />
                            <Text style={styles.saveBtnText}>{isEdit ? 'Salvar Alterações' : 'Agendar Evento'}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    keyboard: { width: '100%' },
    modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '95%' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0'
    },
    title: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
    content: { padding: 20 },
    label: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 8, marginTop: 14 },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        backgroundColor: '#f8fafc',
        color: '#0f172a'
    },
    iconInput: { position: 'relative', justifyContent: 'center' },
    inputIcon: { position: 'absolute', left: 12, zIndex: 2 },
    inputIconTop: { position: 'absolute', left: 12, top: 14, zIndex: 2 },
    pl40: { paddingLeft: 40 },
    textArea: { minHeight: 88, textAlignVertical: 'top' },
    switchRow: {
        marginTop: 20,
        marginBottom: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    switchLabel: { fontWeight: '700', color: '#0f172a' },
    switchSub: { fontSize: 12, color: '#64748b', marginTop: 2, maxWidth: 220 },
    saveBtn: {
        margin: 20,
        marginTop: 8,
        backgroundColor: '#2563eb',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8
    },
    saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 }
});
