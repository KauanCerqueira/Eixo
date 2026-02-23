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
import { THEME } from '../theme';
import { Calendar, Repeat, CheckCircle2 } from 'lucide-react-native';

export const TasksScreen = () => {
    const { tasks, users, isLoading, completeTask, currentUser } = useApp();
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

    // Only show categories that have tasks
    const groupedTasks = TASK_CATEGORIES.map(cat => ({
        ...cat,
        tasks: filteredTasks.filter(t => t.category === cat.id)
    })).filter(g => g.tasks.length > 0);

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={THEME.colors.primary} />
                <Text style={styles.loadingText}>Carregando tarefas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.pageTitle}>TAREFAS</Text>
                <Text style={styles.pageSubtitle}>QUEM FAZ O QUÊ E QUANDO.</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'recurring' && styles.tabActive]} 
                    onPress={() => setActiveTab('recurring')}
                    activeOpacity={0.9}
                >
                    <Repeat size={18} color={activeTab === 'recurring' ? '#000' : THEME.colors.textSecondary} />
                    <Text style={[styles.tabText, activeTab === 'recurring' && styles.tabTextActive]}>ROTINAS</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'sporadic' && styles.tabActive]} 
                    onPress={() => setActiveTab('sporadic')}
                    activeOpacity={0.9}
                >
                    <Calendar size={18} color={activeTab === 'sporadic' ? '#000' : THEME.colors.textSecondary} />
                    <Text style={[styles.tabText, activeTab === 'sporadic' && styles.tabTextActive]}>ESPORÁDICAS</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {groupedTasks.length > 0 ? (
                    groupedTasks.map(group => (
                        <View key={group.id} style={styles.groupSection}>
                            <View style={styles.groupHeader}>
                                <Text style={styles.groupIcon}>{group.icon}</Text>
                                <Text style={styles.groupTitle}>{group.label.toUpperCase()}</Text>
                            </View>

                            {group.tasks.map(task => {
                                const assignedUser = getAssignedUser(task);
                                return (
                                    <TouchableOpacity 
                                        key={task.id} 
                                        onPress={() => openTask(task)}
                                        activeOpacity={0.9}
                                    >
                                        <Card style={styles.taskCard}>
                                            <View style={styles.cardContent}>
                                                <View style={styles.taskMain}>
                                                    <View style={styles.taskTopRow}>
                                                        <Text style={styles.taskTitle}>{task.title}</Text>
                                                        {task.isDone && <Badge variant="success">FEITO</Badge>}
                                                    </View>
                                                    <View style={styles.pointsBadge}>
                                                        <Text style={styles.pointsText}>{task.pointsOnTime} PTS</Text>
                                                    </View>
                                                </View>
                                                
                                                <View style={styles.assigneeSection}>
                                                    <Text style={styles.assigneeLabel}>VEZ DE:</Text>
                                                    <View style={styles.assigneeRow}>
                                                        <Avatar user={assignedUser} size={24} />
                                                        <Text style={styles.assigneeName}>{assignedUser.name}</Text>
                                                    </View>
                                                </View>

                                                <TouchableOpacity
                                                    style={styles.doneBtn}
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        completeTask(task.id, assignedUser.id || currentUser?.id);
                                                    }}
                                                >
                                                    <CheckCircle2 size={16} color="#166534" />
                                                    <Text style={styles.doneBtnText}>Concluir</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </Card>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🤷‍♂️</Text>
                        <Text style={styles.emptyText}>
                            NENHUMA TAREFA {activeTab === 'recurring' ? 'DE ROTINA' : 'ESPORÁDICA'}.
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Contextual FAB */}
            <FAB onPress={() => setAddVisible(true)} />

            {/* Modals - Passed as is */}
            {selectedTask && (
                <TaskDetailModal
                    visible={isDetailVisible}
                    onClose={() => setDetailVisible(false)}
                    task={selectedTask}
                />
            )}

            <AddTaskModal
                visible={isAddVisible}
                onClose={() => setAddVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.colors.background },
    scroll: { padding: 20, paddingBottom: 100 },
    loadingContainer: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 16, fontWeight: '700', color: THEME.colors.textSecondary },

    header: { 
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
        backgroundColor: THEME.colors.background,
        zIndex: 10
    },
    pageTitle: { 
        fontSize: 32, 
        fontWeight: '900', 
        color: THEME.colors.text,
        letterSpacing: -1,
        marginBottom: 4
    },
    pageSubtitle: { 
        fontSize: 12, 
        color: THEME.colors.textSecondary,
        fontWeight: '700',
        letterSpacing: 1,
        borderLeftWidth: 4,
        borderLeftColor: THEME.colors.primary,
        paddingLeft: 10
    },

    tabsContainer: { 
        flexDirection: 'row', 
        marginHorizontal: 20,
        marginBottom: 8, 
        backgroundColor: '#FFF', 
        padding: 6, 
        borderRadius: 16,
        borderWidth: 3,
        borderColor: THEME.colors.text,
        ...THEME.shadows.small
    },
    tab: { 
        flex: 1, 
        flexDirection: 'row',
        paddingVertical: 12, 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: 10,
        gap: 8
    },
    tabActive: { 
        backgroundColor: THEME.colors.accent, 
        borderWidth: 2,
        borderColor: THEME.colors.text
    },
    tabText: { 
        fontSize: 13, 
        fontWeight: '700', 
        color: THEME.colors.textSecondary 
    },
    tabTextActive: { 
        color: THEME.colors.text,
        fontWeight: '900'
    },

    emptyState: { 
        alignItems: 'center', 
        justifyContent: 'center',
        marginTop: 60, 
        backgroundColor: '#FFF',
        padding: 32,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: THEME.colors.text,
        borderStyle: 'dashed'
    },
    emptyIcon: { fontSize: 40, marginBottom: 16 },
    emptyText: { color: THEME.colors.text, fontWeight: '700', textAlign: 'center' },

    groupSection: { marginBottom: 32 },
    groupHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 16,
        gap: 8,
        paddingHorizontal: 4
    },
    groupIcon: { fontSize: 24 },
    groupTitle: { 
        fontSize: 16, 
        fontWeight: '900', 
        color: THEME.colors.text,
        letterSpacing: 1 
    },

    taskCard: { 
        marginBottom: 16, 
        padding: 0,
        overflow: 'hidden',
        borderLeftWidth: 6,
        borderLeftColor: THEME.colors.text
    },
    cardContent: {
        padding: 16,
        gap: 16
    },
    taskMain: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start' 
    },
    taskTopRow: {
        flex: 1,
        gap: 8
    },
    taskTitle: { 
        fontSize: 18, 
        fontWeight: '900', 
        color: THEME.colors.text,
        lineHeight: 24
    },
    
    pointsBadge: {
        backgroundColor: THEME.colors.info,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: THEME.colors.text,
        transform: [{ rotate: '3deg' }]
    },
    pointsText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#FFF'
    },

    assigneeSection: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 2,
        borderTopColor: '#f1f5f9'
    },
    assigneeLabel: { 
        fontSize: 12, 
        color: THEME.colors.textSecondary,
        fontWeight: '700'
    },
    assigneeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    assigneeName: { 
        fontSize: 14, 
        fontWeight: '800', 
        color: THEME.colors.text 
    },
    doneBtn: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#dcfce7',
        borderColor: '#86efac',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6
    },
    doneBtnText: {
        color: '#166534',
        fontSize: 12,
        fontWeight: '800'
    },
    freqText: { fontSize: 12, color: THEME.colors.textSecondary, fontStyle: 'italic' },
});
