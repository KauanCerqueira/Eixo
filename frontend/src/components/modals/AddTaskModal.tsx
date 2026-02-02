import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import { useApp } from '../../context/AppContext';
import { TASK_CATEGORIES, FREQUENCY_OPTIONS, DAYS_OF_WEEK } from '../../types/types';
import { Avatar } from '../ui/Avatar';

interface AddTaskModalProps {
    visible: boolean;
    onClose: () => void;
}

export const AddTaskModal = ({ visible, onClose }: AddTaskModalProps) => {
    const { users, addTask } = useApp();

    // Steps: 0 = Info, 1 = Distribution
    const [step, setStep] = useState(0);

    const [taskType, setTaskType] = useState<'recurring' | 'sporadic'>('recurring');
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<string>('casa');
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const [dayOfWeek, setDayOfWeek] = useState(6);
    const [selectedUsers, setSelectedUsers] = useState<string[]>(users.map(u => u.id));
    const [pointsOnTime, setPointsOnTime] = useState('10');
    const [distribution, setDistribution] = useState<'auto' | 'manual'>('auto');
    const [scheduledDate, setScheduledDate] = useState('');

    // For Manual Distribution
    const [manualDates, setManualDates] = useState<Record<string, { selected: boolean, marked: boolean, selectedColor: string }>>({});

    const toggleUser = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            if (selectedUsers.length > 1) {
                setSelectedUsers(selectedUsers.filter(id => id !== userId));
            }
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const toggleDate = (dateString: string) => {
        setManualDates(prev => {
            const newState = { ...prev };
            if (newState[dateString]) {
                delete newState[dateString];
            } else {
                newState[dateString] = { selected: true, marked: true, selectedColor: '#FACC15' };
            }
            return newState;
        });
    };

    const handleCreate = () => {
        if (!title.trim()) return;
        if (taskType === 'sporadic' && !scheduledDate) return;

        const rotation = users.filter(u => selectedUsers.includes(u.id));

        // Format dates as dd/mm if it's sporadic input using US format from calendar
        // Calendar returns YYYY-MM-DD. We usually store dd/mm for display or Iso. 
        // AppContext expects date strings usually. Let's just pass the string.
        // Actually AppContext logic uses 'dateStr' which is dd/mm.
        // Calendar returns YYYY-MM-DD. Let's convert if needed, or stick to a standard. 
        // The existing projection logic uses toLocaleDateString('pt-BR').

        let finalScheduledDate = undefined;
        if (scheduledDate) {
            const [y, m, d] = scheduledDate.split('-');
            finalScheduledDate = `${d}/${m}`;
        }

        addTask({
            title: title.trim(),
            category: category as any,
            frequency,
            dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
            rotation,
            pointsOnTime: parseInt(pointsOnTime) || 10,
            pointsLatePerDay: 2,
            distributionStrategy: distribution,
            type: taskType,
            scheduledDate: finalScheduledDate
        });

        // Reset
        setTitle('');
        setStep(0);
        setManualDates({});
        setTaskType('recurring');
        setScheduledDate('');
        onClose();
    };

    const nextStep = () => setStep(1);
    const prevStep = () => setStep(0);

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>{step === 0 ? 'Nova Tarefa' : 'Programação'}</Text>
                            <View style={styles.stepper}>
                                <View style={[styles.stepDot, step >= 0 && styles.stepActive]} />
                                <View style={[styles.stepLine, step >= 1 && styles.stepActive]} />
                                <View style={[styles.stepDot, step >= 1 && styles.stepActive]} />
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose}><X size={24} color="#000" /></TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        {step === 0 ? (
                            <>
                                <Text style={styles.label}>Tipo de Tarefa</Text>
                                <View style={styles.typeSelector}>
                                    <TouchableOpacity style={[styles.typeBtn, taskType === 'recurring' && styles.typeBtnActive]} onPress={() => setTaskType('recurring')}>
                                        <Text style={[styles.typeText, taskType === 'recurring' && styles.typeTextActive]}>Rotina (Fixa) 🔄</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.typeBtn, taskType === 'sporadic' && styles.typeBtnActive]} onPress={() => setTaskType('sporadic')}>
                                        <Text style={[styles.typeText, taskType === 'sporadic' && styles.typeTextActive]}>Esporádica (Única) 📅</Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.label}>Título</Text>
                                <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ex: Lavar banheiro" placeholderTextColor="#94a3b8" />

                                <Text style={styles.label}>Categoria</Text>
                                <View style={styles.optionsRow}>
                                    {TASK_CATEGORIES.map(cat => (
                                        <TouchableOpacity key={cat.id} style={[styles.optionBtn, category === cat.id && styles.optionActive]} onPress={() => setCategory(cat.id)}>
                                            <Text style={styles.optionIcon}>{cat.icon}</Text>
                                            <Text style={[styles.optionText, category === cat.id && styles.optionTextActive]}>{cat.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.label}>Quem participa?</Text>
                                <View style={styles.usersRow}>
                                    {users.map(user => (
                                        <TouchableOpacity key={user.id} style={[styles.userBtn, selectedUsers.includes(user.id) && styles.userActive]} onPress={() => toggleUser(user.id)}>
                                            <Avatar user={user} size={40} />
                                            <Text style={styles.userName}>{user.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.pointsItem}>
                                    <Text style={styles.label}>Pontos por completar</Text>
                                    <TextInput style={styles.pointsInput} value={pointsOnTime} onChangeText={setPointsOnTime} keyboardType="numeric" />
                                </View>
                            </>
                        ) : step === 1 && taskType === 'recurring' ? (
                            // Step 1: Recurring Configuration
                            <>
                                <Text style={styles.label}>Modo de Distribuição</Text>
                                <View style={styles.distRow}>
                                    <TouchableOpacity style={[styles.distBtn, distribution === 'auto' && styles.distActive]} onPress={() => setDistribution('auto')}>
                                        <Text style={[styles.distText, distribution === 'auto' && styles.distTextActive]}>Automática (Girar)</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.distBtn, distribution === 'manual' && styles.distActive]} onPress={() => setDistribution('manual')}>
                                        <Text style={[styles.distText, distribution === 'manual' && styles.distTextActive]}>Manual</Text>
                                    </TouchableOpacity>
                                </View>

                                {distribution === 'auto' ? (
                                    <View style={styles.autoConfig}>
                                        <Text style={styles.label}>Frequência</Text>
                                        <View style={styles.optionsRow}>
                                            {FREQUENCY_OPTIONS.map(freq => (
                                                <TouchableOpacity key={freq.id} style={[styles.freqBtn, frequency === freq.id && styles.optionActive]} onPress={() => setFrequency(freq.id as any)}>
                                                    <Text style={[styles.freqText, frequency === freq.id && styles.optionTextActive]}>{freq.label}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        {frequency === 'weekly' && (
                                            <View style={styles.daysScroll}>
                                                {DAYS_OF_WEEK.map(day => (
                                                    <TouchableOpacity key={day.id} style={[styles.dayBtn, dayOfWeek === day.id && styles.dayActive]} onPress={() => setDayOfWeek(day.id)}>
                                                        <Text style={[styles.dayText, dayOfWeek === day.id && styles.dayTextActive]}>{day.label.slice(0, 3)}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                        <Text style={styles.hintText}>O app criará automaticamente as ocorrências e alternará os responsáveis a cada vez.</Text>
                                    </View>
                                ) : (
                                    <View style={styles.manualConfig}>
                                        <Text style={styles.label}>Selecione as datas</Text>
                                        <Calendar
                                            markedDates={manualDates}
                                            onDayPress={(day: any) => toggleDate(day.dateString)}
                                            theme={{
                                                todayTextColor: '#FACC15',
                                                selectedDayBackgroundColor: '#FACC15',
                                                selectedDayTextColor: '#000',
                                                arrowColor: '#000'
                                            }}
                                        />
                                        <Text style={styles.hintText}>Toque nas datas para agendar manualmente.</Text>
                                    </View>
                                )}
                            </>
                        ) : (
                            // Step 2: Sporadic (Single Date) 
                            <View style={styles.manualConfig}>
                                <Text style={styles.label}>Data da Tarefa</Text>
                                <Calendar
                                    markedDates={scheduledDate ? { [scheduledDate]: { selected: true, selectedColor: '#FACC15' } } : {}}
                                    onDayPress={(day: any) => setScheduledDate(day.dateString)}
                                    theme={{
                                        todayTextColor: '#FACC15',
                                        selectedDayBackgroundColor: '#FACC15',
                                        selectedDayTextColor: '#000',
                                        arrowColor: '#000'
                                    }}
                                />
                                <Text style={styles.hintText}>Escolha o dia para esta tarefa.</Text>
                            </View>
                        )}
                    </ScrollView>

                    <View style={styles.footer}>
                        {step === 1 && (
                            <TouchableOpacity style={styles.backBtn} onPress={prevStep}>
                                <Text style={styles.backBtnText}>Voltar</Text>
                            </TouchableOpacity>
                        )}

                        {step === 0 ? (
                            <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
                                <Text style={styles.nextBtnText}>Continuar</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
                                <Text style={styles.saveBtnText}>Confirmar</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal >
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '90%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    title: { fontSize: 20, fontWeight: '900' },
    content: { padding: 20 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 8, marginTop: 16 },

    typeSelector: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    typeBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 2, borderColor: '#e2e8f0', alignItems: 'center' },
    typeBtnActive: { borderColor: '#FACC15', backgroundColor: '#FEF9C3' },
    typeText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    typeTextActive: { color: '#000' },

    stepper: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
    stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e2e8f0' },
    stepLine: { width: 20, height: 2, backgroundColor: '#e2e8f0' },
    stepActive: { backgroundColor: '#FACC15' },

    input: { borderWidth: 2, borderColor: '#000', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#f8fafc' },
    optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    optionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 2, borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
    optionActive: { borderColor: '#FACC15', backgroundColor: '#FEF9C3' },
    optionIcon: { fontSize: 16, marginRight: 6 },
    optionText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    optionTextActive: { color: '#000' },

    usersRow: { flexDirection: 'row', gap: 12 },
    userBtn: { alignItems: 'center', padding: 8, borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
    userActive: { borderColor: '#22C55E', backgroundColor: '#DCFCE7' },
    userName: { fontSize: 12, fontWeight: '600', marginTop: 6 },

    pointsItem: { marginTop: 16 },
    pointsInput: { borderWidth: 2, borderColor: '#000', borderRadius: 10, padding: 12, fontSize: 18, fontWeight: 'bold', textAlign: 'center', width: 100 },

    // Dist Styles
    distRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    distBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, borderWidth: 2, borderColor: '#e2e8f0', alignItems: 'center' },
    distActive: { borderColor: '#000', backgroundColor: '#f1f5f9' },
    distText: { fontWeight: 'bold', color: '#64748b' },
    distTextActive: { color: '#000' },

    autoConfig: { marginTop: 10 },
    manualConfig: { marginTop: 10 },

    freqBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 2, borderColor: '#e2e8f0', alignItems: 'center' },
    freqText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    daysScroll: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
    dayBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 2, borderColor: '#e2e8f0' },
    dayActive: { backgroundColor: '#FACC15', borderColor: '#000' },
    dayText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    dayTextActive: { color: '#000' },

    hintText: { fontSize: 12, color: '#94a3b8', marginTop: 12, fontStyle: 'italic' },

    footer: { flexDirection: 'row', padding: 20, gap: 12 },
    backBtn: { alignItems: 'center', justifyContent: 'center', padding: 16 },
    backBtnText: { fontWeight: 'bold', color: '#64748b' },
    nextBtn: { flex: 1, backgroundColor: '#000', borderRadius: 12, alignItems: 'center', justifyContent: 'center', padding: 16 },
    nextBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    saveBtn: { flex: 1, backgroundColor: '#22C55E', borderRadius: 12, alignItems: 'center', justifyContent: 'center', padding: 16 },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
