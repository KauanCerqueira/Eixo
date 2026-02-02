import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { ClipboardList, Calendar } from 'lucide-react-native';
import { ShoppingWidget } from '../components/dashboard/ShoppingWidget';
import { FamilyBoard } from '../components/dashboard/FamilyBoard';
import { EventCard } from '../components/ui/EventCard';
import { useNavigation } from '@react-navigation/native';
import { PersonalDashboard } from '../components/dashboard/PersonalDashboard';

export const HomeScreen = () => {
    const {
        contextMode, tasks, familyEvents, currentUser, isLoading, users
    } = useApp();
    const navigation = useNavigation<any>();

    // Show loading while data is being fetched
    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    const pendingTasks = tasks.filter(t => !t.isDone).sort((a, b) => b.pointsOnTime - a.pointsOnTime);

    // Helper to get assigned user for a task
    const getAssignedUser = (task: any) => {
        if (task.assignments && task.assignments.length > 0) {
            const assignment = task.assignments[task.currentAssigneeIndex % task.assignments.length];
            return assignment?.user || users[0];
        }
        return users[0] || { id: 0, name: 'N/A', initials: 'NA', color: '#ccc' };
    };

    // Format event date for comparison
    const parseDate = (dateStr: string) => {
        if (dateStr.includes('T')) {
            return new Date(dateStr);
        }
        // Handle dd/mm format
        const parts = dateStr.split('/');
        if (parts.length === 2) {
            const year = new Date().getFullYear();
            return new Date(year, parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        return new Date(dateStr);
    };

    const nextEvents = familyEvents
        .filter(e => parseDate(e.date) >= new Date())
        .slice(0, 3);

    const userName = currentUser?.name?.split(' ')[0] || 'Usuário';

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeText}>Olá,</Text>
                    <Text style={styles.userName}>{userName} 👋</Text>
                    <Text style={styles.userSub}>Aqui está o resumo da casa hoje.</Text>
                </View>

                {contextMode === 'nos' ? (
                    /* ==================== HOME DASHBOARD (NÓS) ==================== */
                    <View style={styles.content}>

                        {/* 1. Shopping List Widget (High Priority) */}
                        <ShoppingWidget />

                        {/* 2. Family Notice Board */}
                        <FamilyBoard />

                        {/* 3. Quick Tasks Overview */}
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIconRow}>
                                <ClipboardList size={18} color="#0f172a" />
                                <Text style={styles.sectionTitle}>TAREFAS URGENTES</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
                                <Text style={styles.seeAll}>Ver todas</Text>
                            </TouchableOpacity>
                        </View>

                        {pendingTasks.length > 0 ? (
                            pendingTasks.slice(0, 3).map(task => (
                                <Card key={task.id} style={styles.miniTaskCard}>
                                    <View style={styles.taskRow}>
                                        <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                                        <View style={styles.assigneeBadge}>
                                            <Avatar user={getAssignedUser(task)} size={20} />
                                        </View>
                                    </View>
                                </Card>
                            ))
                        ) : (
                            <Card style={styles.emptyCard}>
                                <Text style={styles.emptyText}>Tudo em ordem por aqui! ✨</Text>
                            </Card>
                        )}

                        {/* 4. Events */}
                        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                            <View style={styles.sectionIconRow}>
                                <Calendar size={18} color="#0f172a" />
                                <Text style={styles.sectionTitle}>PRÓXIMOS EVENTOS</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('Agenda')}>
                                <Text style={styles.seeAll}>Ver agenda</Text>
                            </TouchableOpacity>
                        </View>

                        <Card style={styles.eventContainer}>
                            {nextEvents.length > 0 ? (
                                nextEvents.map(ev => (
                                    <EventCard key={ev.id} title={ev.title} date={typeof ev.date === 'string' && ev.date.includes('T') ? new Date(ev.date).toLocaleDateString('pt-BR') : ev.date} type="event" />
                                ))
                            ) : (
                                <Text style={styles.emptyText}>Nenhum evento próximo.</Text>
                            )}
                        </Card>

                    </View>
                ) : (
                    /* ==================== PERSONAL DASHBOARD (EU) ==================== */
                    <PersonalDashboard />
                )}

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { padding: 20, paddingBottom: 100 },
    loadingContainer: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#64748b', fontSize: 14 },

    welcomeSection: { marginBottom: 24 },
    welcomeText: { fontSize: 16, color: '#64748b' },
    userName: { fontSize: 26, fontWeight: '900', color: '#0f172a' },
    userSub: { fontSize: 13, color: '#94a3b8', marginTop: 4 },

    content: { gap: 8 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionIconRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sectionTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a', letterSpacing: 0.5 },
    seeAll: { fontSize: 12, color: '#3B82F6', fontWeight: '600' },

    miniTaskCard: { padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#F59E0B' },
    taskRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    taskTitle: { fontSize: 14, fontWeight: '600', color: '#334155', flex: 1, marginRight: 8 },
    assigneeBadge: { marginLeft: 8 },

    emptyCard: { padding: 20, alignItems: 'center' },
    emptyText: { color: '#94a3b8', fontStyle: 'italic' },

    eventContainer: { gap: 8 }
});
