import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { BookOpen, Clock } from 'lucide-react-native';
import { Card } from '../components/ui/Card';
import { FAB } from '../components/ui/FAB';
import { AddStudySessionModal } from '../components/modals/AddStudySessionModal';

const StudyScreen = () => {
    const { studySessions } = useApp();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const totalHours = studySessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60;
    const sessionsCount = studySessions.length;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <Text style={styles.title}>Meus Estudos</Text>
                    <Text style={styles.subtitle}>Registro de aprendizado.</Text>
                </View>

                {/* Top Stats */}
                <View style={styles.topRow}>
                    <Card style={styles.statCard}>
                        <View style={[styles.iconCircle, { backgroundColor: '#EDE9FE' }]}>
                            <Clock size={18} color="#7C3AED" />
                        </View>
                        <Text style={styles.statLabel}>TOTAL HORAS</Text>
                        <Text style={styles.statValue}>{totalHours.toFixed(1)}h</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <View style={[styles.iconCircle, { backgroundColor: '#F0F9FF' }]}>
                            <BookOpen size={18} color="#0EA5E9" />
                        </View>
                        <Text style={styles.statLabel}>SESSÕES</Text>
                        <Text style={[styles.statValue, { color: '#0EA5E9' }]}>{sessionsCount}</Text>
                    </Card>
                </View>

                {/* Sessions List */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>SESSÕES RECENTES</Text>
                </View>

                {studySessions.length > 0 ? (
                    studySessions.slice().reverse().map(s => (
                        <Card key={s.id} style={styles.sessionCard}>
                            <View style={styles.sessionLeft}>
                                <View style={styles.sessionIcon}>
                                    <BookOpen size={20} color="#fff" />
                                </View>
                                <View>
                                    <Text style={styles.sessionSubject}>{s.subject}</Text>
                                    <Text style={styles.sessionTopic}>{s.topic || 'Sem tópico específico'}</Text>
                                    {s.notes && <Text style={styles.sessionNotes} numberOfLines={1}>{s.notes}</Text>}
                                </View>
                            </View>
                            <View style={styles.sessionRight}>
                                <Text style={styles.sessionDuration}>{s.durationMinutes} min</Text>
                                <Text style={styles.sessionDate}>{new Date(s.date).toLocaleDateString()}</Text>
                            </View>
                        </Card>
                    ))
                ) : (
                    <Card style={styles.emptyCard}>
                        <Text style={styles.emptyText}>Bons estudos! Registre sua primeira sessão.</Text>
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
    header: { marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b' },

    topRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statCard: { flex: 1, padding: 16, alignItems: 'flex-start' },
    iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    statLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b' },
    statValue: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginTop: 4 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 13, fontWeight: '900', color: '#64748b', letterSpacing: 0.5 },

    sessionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginBottom: 12 },
    sessionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    sessionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center' },
    sessionSubject: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
    sessionTopic: { fontSize: 12, color: '#64748b' },
    sessionNotes: { fontSize: 11, color: '#94a3b8', fontStyle: 'italic', marginTop: 2 },
    sessionRight: { alignItems: 'flex-end', minWidth: 60 },
    sessionDuration: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
    sessionDate: { fontSize: 11, color: '#94a3b8' },

    emptyCard: { padding: 32, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#94a3b8', fontStyle: 'italic' },
});

export default StudyScreen;
