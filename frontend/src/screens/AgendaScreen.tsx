import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { FAB } from '../components/ui/FAB';
import { AddEventModal } from '../components/modals/AddEventModal';
import { toIsoDate } from '../utils/date';
import { AgendaEvent } from '../services/api';
import { CalendarClock, Clock3, MapPin, Pencil, Trash2 } from 'lucide-react-native';

LocaleConfig.locales['pt-br'] = {
    monthNames: ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    dayNames: ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'],
    dayNamesShort: ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'],
    today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

const toDisplayDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('pt-BR');
};

const toDisplayTime = (value?: string) => {
    if (!value) return 'Dia todo';
    return String(value).slice(0, 5);
};

export const AgendaScreen = () => {
    const { contextMode, familyEvents, personalEvents, deleteEvent } = useApp();
    const events = contextMode === 'nos' ? familyEvents : personalEvents;

    const todayIso = new Date().toISOString().slice(0, 10);
    const [selectedDate, setSelectedDate] = useState(todayIso);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);

    const markedDates = useMemo(() => {
        const marks: Record<string, any> = {};
        events.forEach((event) => {
            const iso = toIsoDate(event.date);
            if (!iso) return;
            if (!marks[iso]) marks[iso] = { dots: [] };
            marks[iso].dots.push({ color: event.type === 'task_instance' ? '#16a34a' : '#2563eb' });
        });

        marks[selectedDate] = {
            ...(marks[selectedDate] || {}),
            selected: true,
            selectedColor: '#FACC15',
            selectedTextColor: '#000'
        };
        return marks;
    }, [events, selectedDate]);

    const selectedEvents = useMemo(() => {
        return events
            .filter((event) => toIsoDate(event.date) === selectedDate)
            .sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));
    }, [events, selectedDate]);

    const upcomingEvents = useMemo(() => {
        return events
            .filter((event) => {
                const iso = toIsoDate(event.date);
                return iso ? iso >= todayIso : false;
            })
            .sort((a, b) => String(a.date).localeCompare(String(b.date)))
            .slice(0, 5);
    }, [events, todayIso]);

    const handleEdit = (event: AgendaEvent) => {
        setEditingEvent(event);
        setShowModal(true);
    };

    const handleDelete = (event: AgendaEvent) => {
        Alert.alert(
            'Excluir evento',
            `Deseja excluir "${event.title}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => deleteEvent(event.id)
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Calendar
                markedDates={markedDates}
                onDayPress={(day: any) => setSelectedDate(day.dateString)}
                markingType="multi-dot"
                enableSwipeMonths
                theme={{
                    selectedDayBackgroundColor: '#FACC15',
                    selectedDayTextColor: '#000',
                    todayTextColor: '#FACC15',
                    arrowColor: '#111827',
                    monthTextColor: '#111827'
                }}
            />

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.sectionHeader}>
                    <CalendarClock size={18} color="#334155" />
                    <Text style={styles.sectionTitle}>
                        Eventos em {selectedDate.split('-').reverse().join('/')}
                    </Text>
                </View>

                {selectedEvents.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Text style={styles.emptyText}>Nenhum evento nesta data.</Text>
                    </Card>
                ) : (
                    selectedEvents.map((event) => (
                        <Card key={`selected-${event.id}`} style={styles.eventCard}>
                            <View style={styles.eventTop}>
                                <Text style={styles.eventTitle}>{event.title}</Text>
                                <View style={styles.actionsRow}>
                                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(event)}>
                                        <Pencil size={14} color="#1d4ed8" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(event)}>
                                        <Trash2 size={14} color="#dc2626" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.metaRow}>
                                <Clock3 size={14} color="#64748b" />
                                <Text style={styles.metaText}>{toDisplayTime(event.time)}</Text>
                            </View>
                            {event.location ? (
                                <View style={styles.metaRow}>
                                    <MapPin size={14} color="#64748b" />
                                    <Text style={styles.metaText}>{event.location}</Text>
                                </View>
                            ) : null}
                            {event.description ? <Text style={styles.description}>{event.description}</Text> : null}
                        </Card>
                    ))
                )}

                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Próximos eventos</Text>
                {upcomingEvents.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Text style={styles.emptyText}>Nenhum evento futuro cadastrado.</Text>
                    </Card>
                ) : (
                    upcomingEvents.map((event) => (
                        <Card key={`upcoming-${event.id}`} style={styles.upcomingCard}>
                            <View style={styles.upcomingTop}>
                                <Text style={styles.upcomingTitle}>{event.title}</Text>
                                <Text style={styles.upcomingDate}>{toDisplayDate(event.date)}</Text>
                            </View>
                            <Text style={styles.upcomingMeta}>{toDisplayTime(event.time)}</Text>
                        </Card>
                    ))
                )}
            </ScrollView>

            <FAB
                onPress={() => {
                    setEditingEvent(null);
                    setShowModal(true);
                }}
            />

            <AddEventModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                editingEvent={editingEvent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    sectionTitle: { fontSize: 14, fontWeight: '900', color: '#334155' },
    emptyCard: { padding: 18, alignItems: 'center' },
    emptyText: { color: '#64748b' },
    eventCard: { marginBottom: 10, padding: 14 },
    eventTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    eventTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', flex: 1, paddingRight: 8 },
    actionsRow: { flexDirection: 'row', gap: 8 },
    iconBtn: {
        width: 28,
        height: 28,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        alignItems: 'center',
        justifyContent: 'center'
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
    metaText: { color: '#475569', fontSize: 13, fontWeight: '600' },
    description: { marginTop: 8, color: '#334155', lineHeight: 18 },
    upcomingCard: { marginBottom: 8, padding: 12 },
    upcomingTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    upcomingTitle: { fontWeight: '700', color: '#0f172a', flex: 1 },
    upcomingDate: { color: '#334155', fontWeight: '700' },
    upcomingMeta: { marginTop: 4, color: '#64748b', fontSize: 12 }
});
