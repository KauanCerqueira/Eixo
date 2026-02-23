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
import { formatDate, parseFlexibleDate } from '../utils/date';
import { THEME } from '../theme';

export const HomeScreen = () => {
    const {
        contextMode, tasks, familyEvents, currentUser, isLoading, users
    } = useApp();
    const navigation = useNavigation<any>();

    // Show loading while data is being fetched
    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={THEME.colors.primary} />
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

    const now = new Date();
    const nextEvents = familyEvents
        .filter(e => {
            const parsed = parseFlexibleDate(e.date);
            return !!parsed && parsed >= now;
        })
        .slice(0, 3);

    const userName = currentUser?.name?.split(' ')[0] || 'Usuário';

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeText}>OLÁ,</Text>
                    <Text style={styles.userName}>{userName?.toUpperCase()} 👋</Text>
                    <Text style={styles.userSub}>AQUI ESTÁ O RESUMO DA CASA HOJE.</Text>
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
                                <ClipboardList size={20} color={THEME.colors.text} strokeWidth={2.5} />
                                <Text style={styles.sectionTitle}>TAREFAS URGENTES</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
                                <Text style={styles.seeAll}>VER TODAS</Text>
                            </TouchableOpacity>
                        </View>

                        {pendingTasks.length > 0 ? (
                            pendingTasks.slice(0, 3).map(task => (
                                <Card key={task.id} style={styles.miniTaskCard}>
                                    <View style={styles.taskRow}>
                                        <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                                        <View style={styles.assigneeBadge}>
                                            <Avatar user={getAssignedUser(task)} size={24} />
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
                                <Calendar size={20} color={THEME.colors.text} strokeWidth={2.5} />
                                <Text style={styles.sectionTitle}>PRÓXIMOS EVENTOS</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('Agenda')}>
                                <Text style={styles.seeAll}>VER AGENDA</Text>
                            </TouchableOpacity>
                        </View>

                        <Card style={styles.eventContainer}>
                            {nextEvents.length > 0 ? (
                                nextEvents.map(ev => (
                                    <EventCard key={ev.id} title={ev.title} date={formatDate(ev.date)} type="event" />
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
    container: { flex: 1, backgroundColor: THEME.colors.background },
    scroll: { padding: 20, paddingBottom: 100 },
    loadingContainer: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: THEME.colors.textSecondary, fontSize: 14, fontWeight: '700' },

    welcomeSection: { marginBottom: 32 },
    welcomeText: { fontSize: 16, color: THEME.colors.textSecondary, fontWeight: '900', letterSpacing: 1 },
    userName: { 
        fontSize: 40, 
        fontWeight: '900', 
        color: THEME.colors.text,
        letterSpacing: -2,
        marginBottom: 8,
    },
    userSub: { 
        fontSize: 14, 
        color: THEME.colors.textSecondary, 
        fontWeight: '700',
        borderLeftWidth: 4,
        borderLeftColor: THEME.colors.accent,
        paddingLeft: 12,
    },

    content: { gap: 24 },

    sectionHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionIconRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '900', color: THEME.colors.text, letterSpacing: 0.5 },
    seeAll: { fontSize: 13, color: THEME.colors.info, fontWeight: '800' },

    miniTaskCard: { 
        padding: 16, 
        marginBottom: 12, 
        borderLeftWidth: 6, 
        borderLeftColor: THEME.colors.warning
    },
    taskRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    taskTitle: { fontSize: 16, fontWeight: '700', color: THEME.colors.text, flex: 1, marginRight: 8 },
    assigneeBadge: { marginLeft: 8 },

    emptyCard: { padding: 32, alignItems: 'center', backgroundColor: '#FFF' },
    emptyText: { color: THEME.colors.textSecondary, fontWeight: '600' },

    eventContainer: { gap: 8, padding: 16 }
});
