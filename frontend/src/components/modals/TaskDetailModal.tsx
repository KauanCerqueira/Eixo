import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { X, Calendar as CalendarIcon, Edit2, Trash2 } from 'lucide-react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useApp } from '../../context/AppContext';
import { RecurringTask, DAYS_OF_WEEK } from '../../types/types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

// Reuse locale config (ensure it's set)
LocaleConfig.locales['pt-br'] = {
    monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'],
    today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

interface TaskDetailModalProps {
    visible: boolean;
    onClose: () => void;
    task: RecurringTask;
}

export const TaskDetailModal = ({ visible, onClose, task }: TaskDetailModalProps) => {
    const { deleteTask, getProjectedInstances } = useApp();
    const [selectedDate, setSelectedDate] = useState('');

    if (!task) return null;

    // Get instances for next 6 months to populate calendar
    // Note: getProjectedInstances logic in Context is currently simple/limited count
    // For a full calendar we might need more, but let's stick to the Context's capability or expand it.
    // The context currently takes a 'limit' count. Let's ask for 30 instances to cover a few months.
    const instances = useMemo(() => getProjectedInstances(task, 30), [task]);

    const markedDates = useMemo(() => {
        const marks: any = {};
        instances.forEach(inst => {
            // inst.date is DD/MM format in current implementation of context
            // We need YYYY-MM-DD. Assuming current year for simplicity as per context logic
            const [day, month] = inst.date.split('/');
            const year = new Date().getFullYear();
            const isoDate = `${year}-${month}-${day}`;

            marks[isoDate] = {
                marked: true,
                dotColor: inst.assignedTo.color || '#3B82F6',
                // If selected
                selected: isoDate === selectedDate,
                selectedColor: '#FACC15',
                selectedTextColor: '#000'
            };
        });

        // Ensure selected date keeps selection style even if no event
        if (selectedDate && !marks[selectedDate]) {
            marks[selectedDate] = { selected: true, selectedColor: '#FACC15', selectedTextColor: '#000' };
        } else if (selectedDate && marks[selectedDate]) {
            marks[selectedDate].selected = true;
            marks[selectedDate].selectedColor = '#FACC15';
            marks[selectedDate].selectedTextColor = '#000';
        }

        return marks;
    }, [instances, selectedDate]);

    const selectedInstance = instances.find(inst => {
        const [day, month] = inst.date.split('/');
        const year = new Date().getFullYear();
        const isoDate = `${year}-${month}-${day}`;
        return isoDate === selectedDate;
    });

    const handleDelete = () => {
        Alert.alert(
            "Excluir Tarefa",
            "Tem certeza?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir", style: "destructive", onPress: () => {
                        deleteTask(task.id);
                        onClose();
                    }
                }
            ]
        );
    };

    const getFrequencyText = () => {
        if (task.frequency === 'daily') return 'Diário';
        if (task.frequency === 'weekly') {
            const day = DAYS_OF_WEEK.find(d => d.id === task.dayOfWeek)?.label || '';
            return `Semanal (${day})`;
        }
        return `Mensal (Dia ${task.dayOfMonth})`;
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>{task.title}</Text>
                            <View style={styles.tagRow}>
                                <Badge variant="info">{getFrequencyText()}</Badge>
                                <Badge variant={task.distributionStrategy === 'auto' ? 'done' : 'urgent'}>
                                    {task.distributionStrategy === 'auto' ? 'Automático' : 'Manual'}
                                </Badge>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>

                        {/* Calendar */}
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
                                textDayFontWeight: '600',
                                textMonthFontWeight: 'bold',
                                textDayHeaderFontWeight: '600'
                            }}
                            markedDates={markedDates}
                            onDayPress={(day: any) => setSelectedDate(day.dateString)}
                            enableSwipeMonths={true}
                        />

                        {/* Selected Date Info */}
                        <View style={styles.infoSection}>
                            <Text style={styles.sectionTitle}>
                                {selectedDate ? `DETALHES DO DIA ${selectedDate.split('-').reverse().join('/')}` : 'SELECIONE UMA DATA'}
                            </Text>

                            {selectedInstance ? (
                                <Card style={styles.assigneeCard}>
                                    <View style={styles.assigneeContent}>
                                        <Avatar user={selectedInstance.assignedTo} size={48} />
                                        <View style={styles.textInfo}>
                                            <Text style={styles.assigneeLabel}>Responsável</Text>
                                            <Text style={styles.assigneeNameBig}>{selectedInstance.assignedTo.name}</Text>
                                        </View>
                                        <View style={styles.pointsBadge}>
                                            <Text style={styles.pointsValue}>+{task.pointsOnTime} pts</Text>
                                        </View>
                                    </View>

                                    {task.distributionStrategy === 'manual' && (
                                        <TouchableOpacity style={styles.changeBtn}>
                                            <Edit2 size={16} color="#64748b" />
                                            <Text style={styles.changeBtnText}>Alterar</Text>
                                        </TouchableOpacity>
                                    )}
                                </Card>
                            ) : (
                                selectedDate && (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyText}>Nada agendado para este dia.</Text>
                                        {task.distributionStrategy === 'manual' && (
                                            <TouchableOpacity style={styles.addDateBtn}>
                                                <Text style={styles.addDateText}>Adicionar Ocorrência</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )
                            )}
                        </View>

                        {/* Stats Row */}
                        <View style={styles.statsRow}>
                            <Card style={styles.statCard}>
                                <Text style={styles.statValue}>{task.pointsOnTime}</Text>
                                <Text style={styles.statLabel}>Pontos</Text>
                            </Card>
                            <Card style={styles.statCard}>
                                <View style={styles.avatars}>
                                    {task.rotation.map((u, i) => (
                                        <View key={u.id} style={{ marginLeft: i > 0 ? -10 : 0 }}>
                                            <Avatar user={u} size={24} />
                                        </View>
                                    ))}
                                </View>
                                <Text style={styles.statLabel}>Equipe</Text>
                            </Card>
                        </View>

                        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                            <Trash2 size={20} color="#EF4444" />
                            <Text style={styles.deleteText}>Excluir Tarefa</Text>
                        </TouchableOpacity>

                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '95%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    title: { fontSize: 22, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
    tagRow: { flexDirection: 'row', gap: 8 },
    closeBtn: { padding: 4 },

    content: { padding: 20 },
    infoSection: { marginTop: 20, marginBottom: 20 },
    sectionTitle: { fontSize: 13, fontWeight: '900', color: '#64748b', marginBottom: 12 },

    assigneeCard: { padding: 16 },
    assigneeContent: { flexDirection: 'row', alignItems: 'center' },
    textInfo: { flex: 1, marginLeft: 16 },
    assigneeLabel: { fontSize: 12, color: '#64748b' },
    assigneeNameBig: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    pointsBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    pointsValue: { color: '#166534', fontWeight: 'bold', fontSize: 12 },

    changeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 8 },
    changeBtnText: { color: '#64748b', fontWeight: '600' },

    emptyState: { padding: 20, alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12 },
    emptyText: { color: '#94a3b8', marginBottom: 12 },
    addDateBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
    addDateText: { color: '#fff', fontWeight: 'bold' },

    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statCard: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
    statValue: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
    avatars: { flexDirection: 'row' },

    deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, marginBottom: 40 },
    deleteText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 },
});
