import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Settings, ChevronRight, Trophy, Flame, CheckCircle, LogOut, Trash2 } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { useAuthSession } from '../context/AuthSessionContext';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { LevelProgressBar } from '../components/gamification/LevelProgressBar';
import { RewardCard } from '../components/gamification/RewardCard';

export const ProfileScreen = () => {
    const { currentUser, users, leaderboard, tasks, rewards, redeemReward, deleteUserById } = useApp();
    const { logout } = useAuthSession();

    if (!currentUser) return null;

    const userStats = leaderboard.find(l => l.id === currentUser.id);
    const completedTasks = tasks.filter(t => t.isDone && t.completedByUserId === currentUser.id).length;
    const isMasterUser = currentUser.name.trim().toLowerCase() === 'kauan cerqueira';

    const handleDeleteUser = (userId: number, userName: string) => {
        Alert.alert(
            'Remover usuário',
            `Tem certeza que deseja remover ${userName}? Essa ação apaga os dados desse usuário.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteUserById(userId, currentUser.id);
                        } catch (error: any) {
                            Alert.alert('Erro', error?.message || 'Não foi possível remover o usuário');
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.profileHeader}>
                    <Avatar user={currentUser} size={96} />
                    <Text style={styles.name}>{currentUser.name}</Text>
                    <Text style={styles.role}>Membro da família</Text>
                </View>

                <Card>
                    <LevelProgressBar xp={currentUser.xp} level={currentUser.level} />
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Trophy size={20} color="#F59E0B" />
                            <Text style={styles.statValue}>#{Math.max(1, leaderboard.findIndex(l => l.id === currentUser.id) + 1)}</Text>
                            <Text style={styles.statLabel}>Ranking</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Flame size={20} color="#EF4444" />
                            <Text style={styles.statValue}>{userStats?.streak || currentUser.streak || 0}</Text>
                            <Text style={styles.statLabel}>Streak</Text>
                        </View>
                        <View style={styles.statItem}>
                            <CheckCircle size={20} color="#22C55E" />
                            <Text style={styles.statValue}>{completedTasks}</Text>
                            <Text style={styles.statLabel}>Concluídas</Text>
                        </View>
                    </View>
                </Card>

                <Text style={styles.sectionTitle}>RECOMPENSAS</Text>
                <Card>
                    {rewards.length > 0 ? (
                        rewards.map(reward => (
                            <RewardCard
                                key={reward.id}
                                reward={reward}
                                userPoints={currentUser.points}
                                onRedeem={(r) => redeemReward(r.id)}
                            />
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Nenhuma recompensa cadastrada ainda.</Text>
                    )}
                </Card>

                <Text style={styles.sectionTitle}>MEMBROS</Text>
                <Card>
                    {users.map((u) => {
                        const stats = leaderboard.find(l => l.id === u.id);
                        return (
                            <View key={u.id} style={styles.memberRow}>
                                <Avatar user={u} size={40} />
                                <View style={styles.memberInfo}>
                                    <Text style={styles.memberName}>{u.name}</Text>
                                    <Text style={styles.memberRole}>{u.id === currentUser.id ? 'Você' : 'Membro'}</Text>
                                </View>
                                <Text style={styles.memberPoints}>{stats?.points || 0} pts</Text>
                                {isMasterUser && u.id !== currentUser.id && (
                                    <TouchableOpacity
                                        style={styles.removeBtn}
                                        onPress={() => handleDeleteUser(u.id, u.name)}
                                    >
                                        <Trash2 size={16} color="#EF4444" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}
                </Card>

                <Text style={styles.sectionTitle}>CONFIGURAÇÕES</Text>
                <Card>
                    <TouchableOpacity style={styles.settingRow}>
                        <Settings size={20} color="#64748b" />
                        <Text style={styles.settingText}>Preferências do App</Text>
                        <ChevronRight size={20} color="#94a3b8" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.settingRow}>
                        <Text style={styles.settingText}>Central de Notificações</Text>
                        <ChevronRight size={20} color="#94a3b8" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.settingRow, styles.logout]} onPress={logout}>
                        <LogOut size={20} color="#EF4444" />
                        <Text style={[styles.settingText, styles.logoutText]}>Encerrar Sessão</Text>
                    </TouchableOpacity>
                </Card>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 100, gap: 12 },

    profileHeader: { alignItems: 'center', marginBottom: 8 },
    name: { fontSize: 28, fontWeight: '900', marginTop: 16, color: '#0f172a' },
    role: { fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: '500' },

    statsRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
    statItem: { flex: 1, alignItems: 'center', paddingVertical: 10 },
    statValue: { fontSize: 18, fontWeight: '900', marginTop: 6, color: '#0f172a' },
    statLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },

    sectionTitle: { fontSize: 13, fontWeight: '900', color: '#94a3b8', letterSpacing: 0.5, marginTop: 8 },
    emptyText: { color: '#94a3b8', fontStyle: 'italic' },

    memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    memberInfo: { flex: 1, marginLeft: 12 },
    memberName: { fontSize: 15, fontWeight: '600' },
    memberRole: { fontSize: 12, color: '#64748b', marginTop: 2 },
    memberPoints: { fontSize: 14, fontWeight: 'bold', color: '#22C55E' },
    removeBtn: {
        marginLeft: 10,
        padding: 8,
        borderWidth: 1,
        borderColor: '#fecaca',
        borderRadius: 8,
        backgroundColor: '#fff1f2'
    },

    settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    settingText: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '500', color: '#334155' },
    logout: { borderBottomWidth: 0 },
    logoutText: { color: '#EF4444' },
});
