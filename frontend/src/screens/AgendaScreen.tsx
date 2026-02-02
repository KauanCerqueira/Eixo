import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { EventCard } from '../components/ui/EventCard';
import { Badge } from '../components/ui/Badge';
import { FAB } from '../components/ui/FAB';
import { AddEventModal } from '../components/modals/AddEventModal';
import { AddTaskModal } from '../components/modals/AddTaskModal';

// Setup Portuguese Locale
LocaleConfig.locales['pt-br'] = {
    monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'],
    today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

export const AgendaScreen = () => {
    const { contextMode, familyEvents, personalEvents } = useApp();
    const events = contextMode === 'nos' ? familyEvents : personalEvents;

    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [showAddEvent, setShowAddEvent] = useState(false);

    // Generate Marked Dates for Calendar
    const markedDates = useMemo(() => {
        const marks: any = {};

        events.forEach(ev => {
            let isoDate = '';
            if (ev.date.includes('/')) {
                const parts = ev.date.split('/');
                const year = parts.length === 3 ? parts[2] : new Date().getFullYear();
                const month = parts[1];
                const day = parts[0];
                isoDate = `${year}-${month}-${day}`;
            } else {
                isoDate = ev.date;
            }

            if (!marks[isoDate]) {
                marks[isoDate] = { dots: [] };
            }

            const color = ev.type === 'task_instance' ? '#22C55E' : '#3B82F6';
            if (marks[isoDate].dots.length < 3) {
                marks[isoDate].dots.push({ color });
            }
        });

        if (marks[selectedDate]) {
            marks[selectedDate].selected = true;
            marks[selectedDate].selectedColor = '#FACC15';
            marks[selectedDate].selectedTextColor = '#000';
        } else {
            marks[selectedDate] = { selected: true, selectedColor: '#FACC15', selectedTextColor: '#000' };
        }

        return marks;
    }, [events, selectedDate]);

    const selectedEvents = events.filter(ev => {
        let isoDate = '';
        if (ev.date.includes('/')) {
            const parts = ev.date.split('/');
            const year = parts.length === 3 ? parts[2] : new Date().getFullYear();
            const month = parts[1];
            const day = parts[0];
            isoDate = `${year}-${month}-${day}`;
        } else {
            isoDate = ev.date;
        }
        return isoDate === selectedDate;
    });

    return (
        <View style={styles.container}>
            <Calendar
                theme={{
                    backgroundColor: '#ffffff',
                    calendarBackground: '#ffffff',
                    textSectionTitleColor: '#b6c1cd',
                    selectedDayBackgroundColor: '#FACC15',
                    selectedDayTextColor: '#000000',
                    todayTextColor: '#FACC15',
                    dayTextColor: '#2d4150',
                    textDisabledColor: '#d9e1e8',
                    dotColor: '#00adf5',
                    selectedDotColor: '#ffffff',
                    arrowColor: 'orange',
                    monthTextColor: 'black',
                    indicatorColor: 'blue',
                    textDayFontWeight: '600',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '600',
                    textDayFontSize: 14,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 12
                }}
                markedDates={markedDates}
                onDayPress={(day: any) => setSelectedDate(day.dateString)}
                markingType={'multi-dot'}
                enableSwipeMonths={true}
            />

            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.sectionTitle}>
                    EVENTOS DO DIA {selectedDate.split('-').reverse().join('/')}
                </Text>

                {selectedEvents.length > 0 ? (
                    <Card>
                        {selectedEvents.map(ev => (
                            <EventCard
                                key={ev.id}
                                title={ev.title}
                                date={ev.time || 'Dia todo'}
                                type={ev.type === 'task_instance' ? 'task' : 'event'}
                            />
                        ))}
                    </Card>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Nada agendado para este dia.</Text>
                    </View>
                )}

                <Text style={styles.sectionTitle}>RESUMO DO MÊS</Text>
                <View style={styles.highlightRow}>
                    <Card style={styles.highlightCard}>
                        <Text style={styles.highlightNum}>{events.length}</Text>
                        <Text style={styles.highlightLabel}>Total</Text>
                    </Card>
                    <Card style={styles.highlightCard}>
                        <Text style={styles.highlightNum}>{contextMode === 'nos' ? '🏠' : '👤'}</Text>
                        <Text style={styles.highlightLabel}>{contextMode === 'nos' ? 'Família' : 'Pessoal'}</Text>
                    </Card>
                </View>
            </ScrollView>

            {/* Contextual FAB */}
            <FAB onPress={() => setShowAddEvent(true)} />

            {/* Modal */}
            <AddEventModal visible={showAddEvent} onClose={() => setShowAddEvent(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
    sectionTitle: { fontSize: 13, fontWeight: '900', marginBottom: 10, marginTop: 10, color: '#64748b' },
    highlightRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
    highlightCard: { flex: 1, alignItems: 'center', paddingVertical: 16 },
    highlightNum: { fontSize: 24, fontWeight: '900' },
    highlightLabel: { fontSize: 11, color: '#64748b', marginTop: 4 },
    emptyState: { padding: 20, alignItems: 'center' },
    emptyText: { color: '#94a3b8' }
});
