import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { TASK_CATEGORIES } from '../types/types';
import { TaskDetailModal } from '../components/modals/TaskDetailModal';
import { AddTaskModal } from '../components/modals/AddTaskModal';
import { FAB } from '../components/ui/FAB';

export const TasksScreen = () => {
    const { tasks, users, isLoading } = useApp();
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isDetailVisible, setDetailVisible] = useState(false);
    const [isAddVisible, setAddVisible] = useState(false);

    const [activeTab, setActiveTab] = useState<'recurring' | 'sporadic'>('recurring');

    const openTask = (task: any) => {
        setSelectedTask(task);
        setDetailVisible(true);
    };

    // Helper to get assigned user for a task
    const getAssignedUser = (task: any) => {
        if (task.assignments && task.assignments.length > 0) {
            const assignment = task.assignments[task.currentAssigneeIndex % task.assignments.length];
            return assignment?.user || users[0];
        }
        return users[0] || { id: 0, name: 'N/A', initials: 'NA', color: '#ccc', points: 0, xp: 0, level: 1, streak: 0, tasksCompleted: 0 };
    };

    // Group tasks by category
    const filteredTasks = tasks.filter(t => (t.type || 'recurring') === activeTab);

    const groupedTasks = TASK_CATEGORIES.map(cat => ({
        ...cat,
        tasks: filteredTasks.filter(t => t.category === cat.id)
    })).filter(g => g.tasks.length > 0);

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <Text style={styles.pageTitle}>Gerenciador de Tarefas</Text>
                    <Text style={styles.pageSubtitle}>Toque em uma tarefa para ver a escala.</Text>
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity style={[styles.tab, activeTab === 'recurring' && styles.tabActive]} onPress={() => setActiveTab('recurring')}>
                        <Text style={[styles.tabText, activeTab === 'recurring' && styles.tabTextActive]}>Rotinas 🔄</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, activeTab === 'sporadic' && styles.tabActive]} onPress={() => setActiveTab('sporadic')}>
                        <Text style={[styles.tabText, activeTab === 'sporadic' && styles.tabTextActive]}>Esporádicas 📅</Text>
                    </TouchableOpacity>
                </View>

                {groupedTasks.length > 0 ? groupedTasks.map(group => (
                    <View key={group.id} style={styles.groupSection}>
                        <Text style={styles.groupTitle}>{group.icon} {group.label.toUpperCase()}</Text>

                        {group.tasks.map(task => {
                            const assignedUser = getAssignedUser(task);
                            return (
                                <TouchableOpacity key={task.id} onPress={() => openTask(task)}>
                                    <Card style={styles.taskCard}>
                                        <View style={styles.taskHeader}>
                                            <Text style={styles.taskTitle}>{task.title}</Text>
                                            <Badge variant="info">{task.pointsOnTime} pts</Badge>
                                        </View>

                                        <View style={styles.taskFooter}>
                                            <View style={styles.nextUp}>
                                                <Text style={styles.nextLabel}>Próximo:</Text>
                                                <Avatar user={assignedUser} size={20} />
                                                <Text style={styles.nextName}>{assignedUser.name}</Text>
                                            </View>
                                            <Text style={styles.freqText}>
                                                {activeTab === 'recurring'
                                                    ? (task.frequency === 'daily' ? 'Diário' : task.frequency === 'weekly' ? 'Semanal' : 'Mensal')
                                                    : `Para: ${task.scheduledDate || 'Sem data'}`
                                                }
                                            </Text>
                                        </View>
                                    </Card>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Nenhuma tarefa {activeTab === 'recurring' ? 'de rotina' : 'esporádica'} encontrada.</Text>
                    </View>
                )}
            </ScrollView>

            {/* Contextual FAB */}
            <FAB onPress={() => setAddVisible(true)} />

            {/* Modals */}
            <TaskDetailModal
                visible={isDetailVisible}
                onClose={() => setDetailVisible(false)}
                task={selectedTask}
            />

            <AddTaskModal
                visible={isAddVisible}
                onClose={() => setAddVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
    loadingContainer: { justifyContent: 'center', alignItems: 'center' },
    header: { marginBottom: 20 },
    pageTitle: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    pageSubtitle: { fontSize: 13, color: '#64748b' },

    tabs: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#f1f5f9', padding: 4, borderRadius: 12 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
    tabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    tabTextActive: { color: '#0f172a' },

    emptyState: { alignItems: 'center', marginTop: 40 },
    emptyText: { color: '#94a3b8' },

    groupSection: { marginBottom: 24 },
    groupTitle: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8', marginBottom: 10 },

    taskCard: { marginBottom: 12, padding: 16 },
    taskHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    taskTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },

    taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    nextUp: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    nextLabel: { fontSize: 12, color: '#64748b' },
    nextName: { fontSize: 12, fontWeight: '600', color: '#0f172a' },
    freqText: { fontSize: 12, color: '#94a3b8' },
});
