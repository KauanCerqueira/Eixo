import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { BookOpen, Clock, CalendarDays, Target, TimerReset } from 'lucide-react-native';
import { Card } from '../components/ui/Card';
import { FAB } from '../components/ui/FAB';
import { AddStudySessionModal } from '../components/modals/AddStudySessionModal';

const WEEKLY_TARGET_MINUTES = 300;

const weekKey = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    return `${start.getFullYear()}-${start.getMonth()}-${start.getDate()}`;
};

const sameWeek = (a: string, b: Date) => {
    const keyA = weekKey(a);
    const keyB = weekKey(b.toISOString());
    return keyA === keyB;
};

export const StudyScreen = () => {
    const { studySessions, currentUser, addStudySession } = useApp();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const now = new Date();
    const thisWeekMinutes = useMemo(
        () => studySessions
            .filter((s) => sameWeek(s.date, now))
            .reduce((sum, s) => sum + s.durationMinutes, 0),
        [studySessions, now]
    );

    const totalMinutes = studySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalHours = totalMinutes / 60;
    const sessionsCount = studySessions.length;
    const weeklyProgress = Math.min(100, (thisWeekMinutes / WEEKLY_TARGET_MINUTES) * 100);

    const bySubject = useMemo(() => {
        const map: Record<string, number> = {};
        studySessions.forEach((session) => {
            map[session.subject] = (map[session.subject] || 0) + session.durationMinutes;
        });
        return Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [studySessions]);

    const quickAdd = async (minutes: number) => {
        if (!currentUser) return;
        await addStudySession({
            userId: currentUser.id,
            subject: 'Sessao Rapida',
            topic: `${minutes} min foco`,
            durationMinutes: minutes,
            notes: 'Sessao registrada pelo atalho',
            date: new Date().toISOString()
        });
    };

    const formatDate = (value: string) => {
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return '-';
        return parsed.toLocaleDateString('pt-BR');
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <Text style={styles.title}>Guia de Estudos</Text>
                    <Text style={styles.subtitle}>Planeje, registre e acompanhe sua evolucao.</Text>
                </View>

                <View style={styles.topRow}>
                    <Card style={styles.statCard}>
                        <View style={[styles.iconCircle, { backgroundColor: '#EDE9FE' }]}>
                            <Clock size={18} color="#7C3AED" />
                        </View>
                        <Text style={styles.statLabel}>TOTAL HORAS</Text>
                        <Text style={styles.statValue}>{totalHours.toFixed(1)}h</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
                            <BookOpen size={18} color="#2563EB" />
                        </View>
                        <Text style={styles.statLabel}>SESSOES</Text>
                        <Text style={[styles.statValue, { color: '#0EA5E9' }]}>{sessionsCount}</Text>
                    </Card>
                </View>

                <Card style={styles.weekCard}>
                    <View style={styles.weekHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <CalendarDays size={16} color="#475569" />
                            <Text style={styles.weekTitle}>Meta da semana</Text>
                        </View>
                        <Text style={styles.weekValue}>{thisWeekMinutes}/{WEEKLY_TARGET_MINUTES} min</Text>
                    </View>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${weeklyProgress}%` }]} />
                    </View>
                    <Text style={styles.weekHint}>
                        {weeklyProgress >= 100
                            ? 'Meta semanal concluida. Excelente ritmo.'
                            : `Faltam ${Math.max(0, WEEKLY_TARGET_MINUTES - thisWeekMinutes)} min para bater sua meta.`}
                    </Text>
                </Card>

                <Card>
                    <Text style={styles.sectionTitle}>Atalhos de foco</Text>
                    <View style={styles.quickRow}>
                        <TouchableOpacity style={styles.quickBtn} onPress={() => quickAdd(25)}>
                            <TimerReset size={16} color="#0f172a" />
                            <Text style={styles.quickText}>Pomodoro 25m</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickBtn} onPress={() => quickAdd(50)}>
                            <Target size={16} color="#0f172a" />
                            <Text style={styles.quickText}>Foco 50m</Text>
                        </TouchableOpacity>
                    </View>
                </Card>

                <Card style={{ marginTop: 14 }}>
                    <Text style={styles.sectionTitle}>Disciplinas mais estudadas</Text>
                    {bySubject.length === 0 ? (
                        <Text style={styles.emptyText}>Nenhum estudo registrado ainda.</Text>
                    ) : bySubject.map(([subject, minutes]) => (
                        <View key={subject} style={styles.subjectRow}>
                            <Text style={styles.subjectName}>{subject}</Text>
                            <Text style={styles.subjectMinutes}>{minutes} min</Text>
                        </View>
                    ))}
                </Card>

                <View style={styles.sectionHeadRow}>
                    <Text style={styles.sectionTitle}>Sessoes recentes</Text>
                </View>
                {studySessions.length > 0 ? (
                    studySessions
                        .slice()
                        .sort((a, b) => String(b.date).localeCompare(String(a.date)))
                        .slice(0, 15)
                        .map((session) => (
                            <Card key={session.id} style={styles.sessionCard}>
                                <View style={styles.sessionLeft}>
                                    <Text style={styles.sessionSubject}>{session.subject}</Text>
                                    <Text style={styles.sessionTopic}>{session.topic || 'Sem topico especifico'}</Text>
                                    {session.notes ? <Text style={styles.sessionNotes}>{session.notes}</Text> : null}
                                </View>
                                <View style={styles.sessionRight}>
                                    <Text style={styles.sessionDuration}>{session.durationMinutes} min</Text>
                                    <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
                                </View>
                            </Card>
                        ))
                ) : (
                    <Card style={styles.emptyCard}>
                        <Text style={styles.emptyText}>Registre sua primeira sessao para iniciar o guia.</Text>
                    </Card>
                )}
            </ScrollView>

            <FAB onPress={() => setIsModalVisible(true)} />
            <AddStudySessionModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
    header: { marginBottom: 20 },
    title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b' },
    topRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    statCard: { flex: 1, padding: 16, alignItems: 'flex-start' },
    iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    statLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b' },
    statValue: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginTop: 4 },
    weekCard: { marginBottom: 12, padding: 14 },
    weekHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    weekTitle: { fontWeight: '800', color: '#334155' },
    weekValue: { fontWeight: '900', color: '#0f172a' },
    progressTrack: { marginTop: 10, height: 8, borderRadius: 8, backgroundColor: '#e2e8f0', overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#2563eb' },
    weekHint: { marginTop: 8, color: '#64748b', fontSize: 12 },
    sectionTitle: { fontSize: 13, fontWeight: '900', color: '#64748b', marginBottom: 8 },
    quickRow: { flexDirection: 'row', gap: 10 },
    quickBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#f1f5f9', padding: 12, borderRadius: 10 },
    quickText: { fontWeight: '800', color: '#0f172a' },
    subjectRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    subjectName: { color: '#0f172a', fontWeight: '600' },
    subjectMinutes: { color: '#334155', fontWeight: '800' },
    sectionHeadRow: { marginTop: 14, marginBottom: 8 },
    sessionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, marginBottom: 8 },
    sessionLeft: { flex: 1, paddingRight: 8 },
    sessionSubject: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
    sessionTopic: { fontSize: 12, color: '#475569', marginTop: 2 },
    sessionNotes: { fontSize: 11, color: '#64748b', marginTop: 3 },
    sessionRight: { alignItems: 'flex-end' },
    sessionDuration: { fontWeight: '900', color: '#0f172a' },
    sessionDate: { fontSize: 11, color: '#64748b', marginTop: 2 },
    emptyCard: { padding: 24, alignItems: 'center' },
    emptyText: { color: '#64748b' }
});

export default StudyScreen;
