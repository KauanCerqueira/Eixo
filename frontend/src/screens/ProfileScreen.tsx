import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Settings, ChevronRight, Trophy, Flame, CheckCircle, LogOut, ShoppingBag } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { LevelProgressBar } from '../components/gamification/LevelProgressBar';
import { RewardCard } from '../components/gamification/RewardCard';
import { Reward } from '../types/types';

const MOCK_REWARDS: Reward[] = [
    { id: '1', title: 'Folga da Louça', cost: 100, icon: '🍽️', description: 'Vale uma vez ficar sem lavar louça.' },
    { id: '2', title: 'Escolher Jantar', cost: 250, icon: '🍕', description: 'Direito de escolher o cardápio do fds.' },
    { id: '3', title: 'Vale Cinema', cost: 500, icon: '🎬', description: 'Entrada paga pelo fundo da casa.' },
    { id: '4', title: 'Manhã de Domingo', cost: 800, icon: '☕', description: 'Café na cama e sem tarefas até 12h.' },
];

export const ProfileScreen = () => {
    const { contextMode, currentUser, users, leaderboard, tasks, redeemReward, userSettings } = useApp();

    const userStats = leaderboard.find(l => l.user.id === currentUser.id);
    const completedTasks = tasks.filter(t => t.isDone).length;

    // Use XP from currentUser. Since context updates 'leaderboard' for points but we might need 'users' XP...
    // Actually, let's use the 'users' state properly for XP if we can, or fallback to mock logic in LevelProgressBar
    // In our specific mock implementation: 
    // currentUser.xp comes from 'users' array which we update manually in this mock environment or init values.
    // userStats.points is the "Wallet".

    // For this mock, let's grab the XP from the 'users' array finding the current user since 'currentUser' might be stale if we don't update it directly.
    const realUser = users.find(u => u.id === currentUser.id) || currentUser;


    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>

                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <Avatar user={currentUser} size={96} />
                    <Text style={styles.name}>{currentUser.name}</Text>
                    <Text style={styles.role}>{contextMode === 'nos' ? 'Membro da Família' : 'Perfil Pessoal Pro'}</Text>
                    <View style={styles.badgeRow}>
                        <View style={styles.badge}><Text style={styles.badgeText}>🏆 Top 1%</Text></View>
                        <View style={[styles.badge, { backgroundColor: '#DBEAFE' }]}><Text style={[styles.badgeText, { color: '#1E40AF' }]}>🔥 12 Dias Streak</Text></View>
                    </View>
                </View>

                {/* EU MODE: CHARACTER SHEET OVERHAUL */}
                {contextMode === 'eu' ? (
                    <View style={{ gap: 24 }}>

                        {/* 1. Identity & Bio */}
                        <Card style={{ marginTop: -20, paddingTop: 30 }}>
                            <Text style={styles.bioText}>"{userSettings.bio}"</Text>

                            <View style={styles.biometricsRow}>
                                <View style={styles.bioItem}>
                                    <Text style={styles.bioValue}>{userSettings.weight}kg</Text>
                                    <Text style={styles.bioLabel}>PESO</Text>
                                </View>
                                <View style={styles.bioDivider} />
                                <View style={styles.bioItem}>
                                    <Text style={styles.bioValue}>{userSettings.height}cm</Text>
                                    <Text style={styles.bioLabel}>ALTURA</Text>
                                </View>
                                <View style={styles.bioDivider} />
                                <View style={styles.bioItem}>
                                    <Text style={styles.bioValue}>26</Text>
                                    <Text style={styles.bioLabel}>IDADE</Text>
                                </View>
                            </View>
                        </Card>

                        {/* 2. Life Wheel (Areas of Focus) */}
                        <View>
                            <Text style={styles.sectionTitle}>EQUILÍBRIO (RODA DA VIDA)</Text>
                            <Card>
                                <View style={styles.lifeArea}>
                                    <View style={styles.areaHeader}>
                                        <Text style={styles.areaLabel}>Saúde & Corpo</Text>
                                        <Text style={styles.areaValue}>{userSettings.focusAreas?.health}%</Text>
                                    </View>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${userSettings.focusAreas?.health}%`, backgroundColor: '#EF4444' }]} />
                                    </View>
                                </View>

                                <View style={styles.lifeArea}>
                                    <View style={styles.areaHeader}>
                                        <Text style={styles.areaLabel}>Carreira & Finanças</Text>
                                        <Text style={styles.areaValue}>{userSettings.focusAreas?.career}%</Text>
                                    </View>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${userSettings.focusAreas?.career}%`, backgroundColor: '#3B82F6' }]} />
                                    </View>
                                </View>

                                <View style={styles.lifeArea}>
                                    <View style={styles.areaHeader}>
                                        <Text style={styles.areaLabel}>Social & Família</Text>
                                        <Text style={styles.areaValue}>{userSettings.focusAreas?.social}%</Text>
                                    </View>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${userSettings.focusAreas?.social}%`, backgroundColor: '#F59E0B' }]} />
                                    </View>
                                </View>

                                <View style={styles.lifeArea}>
                                    <View style={styles.areaHeader}>
                                        <Text style={styles.areaLabel}>Mente & Espírito</Text>
                                        <Text style={styles.areaValue}>{userSettings.focusAreas?.spirit}%</Text>
                                    </View>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${userSettings.focusAreas?.spirit}%`, backgroundColor: '#8B5CF6' }]} />
                                    </View>
                                </View>
                            </Card>
                        </View>

                        {/* 3. Milestones / Journey */}
                        <View>
                            <Text style={styles.sectionTitle}>MINHA JORNADA</Text>
                            <Card style={{ padding: 0 }}>
                                <View style={styles.milestoneItem}>
                                    <View style={styles.milestoneIcon}>
                                        <Trophy size={14} color="#fff" />
                                    </View>
                                    <View style={styles.milestoneContent}>
                                        <Text style={styles.milestoneTitle}>Iniciou o modo "EU"</Text>
                                        <Text style={styles.milestoneDate}>02 Fev 2026</Text>
                                    </View>
                                </View>
                                <View style={[styles.milestoneItem, { borderBottomWidth: 0 }]}>
                                    <View style={[styles.milestoneIcon, { backgroundColor: '#10B981' }]}>
                                        <CheckCircle size={14} color="#fff" />
                                    </View>
                                    <View style={styles.milestoneContent}>
                                        <Text style={styles.milestoneTitle}>Atingiu 7 dias de streak</Text>
                                        <Text style={styles.milestoneDate}>30 Jan 2026</Text>
                                    </View>
                                </View>
                            </Card>
                        </View>

                        {/* 4. RPG Attributes */}
                        <View>
                            <Text style={styles.sectionTitle}>ATRIBUTOS RPG</Text>
                            <View style={styles.attributesGrid}>
                                <View style={styles.attributeBox}>
                                    <Text style={styles.attrValue}>12</Text>
                                    <Text style={styles.attrLabel}>FORÇA</Text>
                                </View>
                                <View style={styles.attributeBox}>
                                    <Text style={styles.attrValue}>08</Text>
                                    <Text style={styles.attrLabel}>INTELIGÊNCIA</Text>
                                </View>
                                <View style={styles.attributeBox}>
                                    <Text style={styles.attrValue}>15</Text>
                                    <Text style={styles.attrLabel}>DISCIPLINA</Text>
                                </View>
                            </View>
                        </View>

                    </View>
                ) : (
                    /* NÓS MODE STATS (Original) */
                    <View style={{ gap: 24 }}>
                        <View style={styles.statsRow}>
                            {/* ... (Existing StatsRow logic kept conceptually, but rewriting for clarity if needed or just pasting back) */}
                            <Card style={styles.statCard}>
                                <Trophy size={24} color="#F59E0B" />
                                <Text style={styles.statNum}>#{leaderboard.findIndex(l => l.user.id === currentUser.id) + 1}</Text>
                                <Text style={styles.statLabel}>Ranking</Text>
                            </Card>
                            <Card style={styles.statCard}>
                                <Flame size={24} color="#EF4444" />
                                <Text style={styles.statNum}>{userStats?.streak || 0}</Text>
                                <Text style={styles.statLabel}>Streak</Text>
                            </Card>
                            <Card style={styles.statCard}>
                                <CheckCircle size={24} color="#22C55E" />
                                <Text style={styles.statNum}>{completedTasks}</Text>
                                <Text style={styles.statLabel}>Tarefas</Text>
                            </Card>
                        </View>

                        <Text style={styles.sectionTitle}>MEMBROS DA CASA</Text>
                        <Card>
                            {users.map((u) => {
                                const stats = leaderboard.find(l => l.user.id === u.id);
                                return (
                                    <View key={u.id} style={styles.memberRow}>
                                        <Avatar user={u} size={40} />
                                        <View style={styles.memberInfo}>
                                            <Text style={styles.memberName}>{u.name}</Text>
                                            <Text style={styles.memberRole}>{u.id === currentUser.id ? 'Você' : 'Membro'}</Text>
                                        </View>
                                        <Text style={styles.memberPoints}>{stats?.points || 0} pts</Text>
                                    </View>
                                );
                            })}
                        </Card>
                    </View>
                )}

                {/* Settings (Common) */}
                <Text style={styles.sectionTitle}>CONFIGURAÇÕES GERAIS</Text>
                <Card>
                    <TouchableOpacity style={styles.settingRow}>
                        <Settings size={20} color="#64748b" />
                        <Text style={styles.settingText}>Preferências do App</Text>
                        <ChevronRight size={20} color="#94a3b8" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.settingRow}>
                        <Text style={styles.settingText}>🔔 Central de Notificações</Text>
                        <ChevronRight size={20} color="#94a3b8" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.settingRow, styles.logout]}>
                        <LogOut size={20} color="#EF4444" />
                        <Text style={[styles.settingText, styles.logoutText]}>Encerrar Sessão</Text>
                    </TouchableOpacity>
                </Card>

                <Text style={styles.version}>Eixo v2.1.0 (Alpha)</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 100 },

    profileHeader: { alignItems: 'center', marginBottom: 32 },
    name: { fontSize: 28, fontWeight: '900', marginTop: 16, color: '#0f172a' },
    role: { fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: '500' },
    badgeRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
    badge: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { fontSize: 12, fontWeight: 'bold', color: '#D97706' },

    sectionTitle: { fontSize: 13, fontWeight: '900', color: '#94a3b8', marginBottom: 12, letterSpacing: 0.5 },

    // Grid Stats for EU
    gridStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    gridItem: { width: '48%', padding: 16, alignItems: 'center' },
    gridValue: { fontSize: 24, fontWeight: '900', color: '#0f172a', marginBottom: 4 },
    gridLabel: { fontSize: 12, color: '#64748b', textAlign: 'center' },

    analysisText: { fontSize: 14, color: '#475569', lineHeight: 22 },

    // New EU Profile Styles
    bioText: { textAlign: 'center', fontStyle: 'italic', color: '#64748b', fontSize: 13, marginBottom: 24, paddingHorizontal: 20 },
    biometricsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
    bioItem: { alignItems: 'center', paddingHorizontal: 20 },
    bioDivider: { width: 1, height: 24, backgroundColor: '#e2e8f0' },
    bioValue: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
    bioLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginTop: 2 },

    lifeArea: { marginBottom: 16 },
    areaHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    areaLabel: { fontSize: 13, fontWeight: '600', color: '#334155' },
    areaValue: { fontSize: 13, fontWeight: 'bold', color: '#64748b' },
    progressBarBg: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },

    milestoneItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    milestoneIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    milestoneContent: { flex: 1 },
    milestoneTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
    milestoneDate: { fontSize: 12, color: '#94a3b8' },

    attributesGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    attributeBox: { flex: 1, backgroundColor: '#0f172a', padding: 12, borderRadius: 12, alignItems: 'center' },
    attrValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
    attrLabel: { fontSize: 10, color: '#94a3b8', fontWeight: 'bold', marginTop: 2, letterSpacing: 0.5 },

    // NOS Mode styles
    statsRow: { flexDirection: 'row', gap: 10 },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: 16 },
    statNum: { fontSize: 20, fontWeight: '900', marginTop: 8 },
    statLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },

    memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    memberInfo: { flex: 1, marginLeft: 12 },
    memberName: { fontSize: 15, fontWeight: '600' },
    memberRole: { fontSize: 12, color: '#64748b', marginTop: 2 },
    memberPoints: { fontSize: 14, fontWeight: 'bold', color: '#22C55E' },

    // Settings
    settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    settingText: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '500', color: '#334155' },
    logout: { borderBottomWidth: 0 },
    logoutText: { color: '#EF4444' },

    levelHint: { fontSize: 12, color: '#64748b', marginTop: 12, textAlign: 'center', fontStyle: 'italic' },
    version: { textAlign: 'center', fontSize: 12, color: '#cbd5e1', marginTop: 32 },
});
