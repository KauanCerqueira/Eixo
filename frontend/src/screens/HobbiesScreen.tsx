import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { FAB } from '../components/ui/FAB';
import { Badge } from '../components/ui/Badge';
import { AddHobbyModal } from '../components/modals/AddHobbyModal';
import { MoreHorizontal, Plus, Trash2, CheckSquare, Square, Palette, Music, Hammer, Gamepad2, Layers } from 'lucide-react-native';

const CATEGORY_ICONS: Record<string, any> = {
    diy: <Hammer size={16} color="#3B82F6" />,
    cursos: <Layers size={16} color="#10B981" />,
    games: <Gamepad2 size={16} color="#8B5CF6" />,
    musica: <Music size={16} color="#F59E0B" />,
    artes: <Palette size={16} color="#EC4899" />,
};

export const HobbiesScreen = () => {
    const { hobbies, updateHobbyProgress, deleteHobby } = useApp();
    const [isModalVisible, setIsModalVisible] = useState(false);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>

                <View style={styles.header}>
                    <Text style={styles.title}>Meus Hobbies</Text>
                    <Text style={styles.subtitle}>Projetos, estudos e ideias em andamento.</Text>
                </View>

                {hobbies.length > 0 ? (
                    hobbies.map(project => (
                        <Card key={project.id} style={styles.projectCard}>
                            <View style={styles.cardTop}>
                                <View style={styles.categoryBadge}>
                                    {CATEGORY_ICONS[project.category] || <Layers size={16} color="#64748b" />}
                                    <Text style={styles.categoryText}>{project.category.toUpperCase()}</Text>
                                </View>
                                <TouchableOpacity onPress={() => deleteHobby(project.id)}>
                                    <Trash2 size={18} color="#cbd5e1" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.projectTitle}>{project.title}</Text>

                            <View style={styles.progressSection}>
                                <View style={styles.progressHeader}>
                                    <Text style={styles.progressLabel}>Progresso</Text>
                                    <Text style={styles.progressValue}>{project.progress}%</Text>
                                </View>
                                <ProgressBar progress={project.progress} color="#8B5CF6" />
                                <View style={styles.progressControls}>
                                    <TouchableOpacity onPress={() => updateHobbyProgress(project.id, Math.max(0, project.progress - 10))} style={styles.controlBtn}>
                                        <Text style={styles.controlText}>-</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => updateHobbyProgress(project.id, Math.min(100, project.progress + 10))} style={styles.controlBtn}>
                                        <Text style={styles.controlText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.notesSection}>
                                <Text style={styles.notesTitle}>NOTAS / METAS</Text>
                                {project.notes.length > 0 ? (
                                    project.notes.map((note, i) => (
                                        <View key={i} style={styles.noteItem}>
                                            <CheckSquare size={14} color="#94a3b8" style={{ marginTop: 2 }} />
                                            <Text style={styles.noteText}>{note}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.emptyNotes}>Nenhuma nota adicionada.</Text>
                                )}
                            </View>
                        </Card>
                    ))
                ) : (
                    <Card style={styles.emptyCard}>
                        <Text style={styles.emptyText}>Nenhum projeto iniciado.</Text>
                    </Card>
                )}

            </ScrollView>

            <FAB onPress={() => setIsModalVisible(true)} />
            <AddHobbyModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
    header: { marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b' },

    projectCard: { marginBottom: 16, padding: 20 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    categoryText: { fontSize: 11, fontWeight: 'bold', color: '#64748b' },

    projectTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 20 },

    progressSection: { marginBottom: 24 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressLabel: { fontSize: 12, fontWeight: '600', color: '#64748b' },
    progressValue: { fontSize: 12, fontWeight: 'bold', color: '#8B5CF6' },
    progressControls: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 },
    controlBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    controlText: { fontWeight: 'bold', color: '#64748b', fontSize: 16 },

    notesSection: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
    notesTitle: { fontSize: 11, fontWeight: '900', color: '#94a3b8', marginBottom: 12, letterSpacing: 0.5 },
    noteItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
    noteText: { fontSize: 14, color: '#334155', flex: 1, lineHeight: 20 },
    emptyNotes: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic' },

    emptyCard: { padding: 32, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#94a3b8', fontStyle: 'italic' },
});
