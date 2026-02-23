import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { Settings, ChevronRight, Trophy, Flame, CheckCircle, LogOut, Trash2, Shield, Save } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { useAuthSession } from '../context/AuthSessionContext';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { LevelProgressBar } from '../components/gamification/LevelProgressBar';
import { RewardCard } from '../components/gamification/RewardCard';
import { SettingsModal } from '../components/modals/SettingsModal';
import { User } from '../services/api';

const ROLE_LABELS: Record<string, string> = {
    master: 'Master',
    admin: 'Admin',
    member: 'Membro'
};

export const ProfileScreen = () => {
    const {
        currentUser,
        users,
        leaderboard,
        tasks,
        rewards,
        redeemReward,
        deleteUserById,
        updateFamilyProfile
    } = useApp();
    const { logout } = useAuthSession();

    const [showFamilyModal, setShowFamilyModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [editingMember, setEditingMember] = useState<User | null>(null);
    const [editingRole, setEditingRole] = useState<'master' | 'admin' | 'member'>('member');
    const [editingRelation, setEditingRelation] = useState('');

    if (!currentUser) return null;

    const userStats = leaderboard.find((l) => l.id === currentUser.id);
    const completedTasks = tasks.filter((t) => t.completedByUserId === currentUser.id).length;
    const currentRole = (currentUser.familyRole || 'member') as 'master' | 'admin' | 'member';
    const isManager = currentRole === 'master' || currentRole === 'admin';

    const openFamilyEditor = (member: User) => {
        setEditingMember(member);
        setEditingRole((member.familyRole || 'member') as 'master' | 'admin' | 'member');
        setEditingRelation(member.familyRelation || '');
        setShowFamilyModal(true);
    };

    const handleSaveFamilyProfile = async () => {
        if (!editingMember) return;
        try {
            await updateFamilyProfile(editingMember.id, editingRole, editingRelation.trim() || undefined);
            setShowFamilyModal(false);
        } catch (error: any) {
            Alert.alert('Erro', error?.message || 'Falha ao atualizar perfil familiar.');
        }
    };

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
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.profileHeader}>
                    <Avatar user={currentUser} size={96} />
                    <Text style={styles.name}>{currentUser.name}</Text>
                    <View style={styles.roleBadge}>
                        <Shield size={14} color="#1d4ed8" />
                        <Text style={styles.roleBadgeText}>{ROLE_LABELS[currentUser.familyRole || 'member']}</Text>
                    </View>
                    {currentUser.familyRelation ? <Text style={styles.role}>{currentUser.familyRelation}</Text> : null}
                </View>

                <Card>
                    <LevelProgressBar xp={currentUser.xp} level={currentUser.level} />
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Trophy size={20} color="#F59E0B" />
                            <Text style={styles.statValue}>#{Math.max(1, leaderboard.findIndex((l) => l.id === currentUser.id) + 1)}</Text>
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
                        rewards.map((reward) => (
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

                <Text style={styles.sectionTitle}>MEMBROS DA FAMÍLIA</Text>
                <Card>
                    {users.map((member) => {
                        const stats = leaderboard.find((l) => l.id === member.id);
                        return (
                            <View key={member.id} style={styles.memberRow}>
                                <Avatar user={member} size={40} />
                                <View style={styles.memberInfo}>
                                    <Text style={styles.memberName}>{member.name}</Text>
                                    <Text style={styles.memberRole}>
                                        {ROLE_LABELS[member.familyRole || 'member']}
                                        {member.familyRelation ? ` • ${member.familyRelation}` : ''}
                                    </Text>
                                </View>
                                <Text style={styles.memberPoints}>{stats?.points || 0} pts</Text>
                                {isManager && (
                                    <TouchableOpacity style={styles.manageBtn} onPress={() => openFamilyEditor(member)}>
                                        <Settings size={14} color="#1d4ed8" />
                                    </TouchableOpacity>
                                )}
                                {currentRole === 'master' && member.id !== currentUser.id && (
                                    <TouchableOpacity
                                        style={styles.removeBtn}
                                        onPress={() => handleDeleteUser(member.id, member.name)}
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
                    <TouchableOpacity style={styles.settingRow} onPress={() => setShowSettingsModal(true)}>
                        <Settings size={20} color="#64748b" />
                        <Text style={styles.settingText}>Preferências do App</Text>
                        <ChevronRight size={20} color="#94a3b8" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.settingRow, styles.logout]} onPress={logout}>
                        <LogOut size={20} color="#EF4444" />
                        <Text style={[styles.settingText, styles.logoutText]}>Encerrar Sessão</Text>
                    </TouchableOpacity>
                </Card>
            </ScrollView>

            <Modal visible={showFamilyModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Gerenciar membro</Text>
                        <Text style={styles.modalSubtitle}>{editingMember?.name}</Text>

                        <Text style={styles.modalLabel}>Papel na família</Text>
                        <View style={styles.roleRow}>
                            {(['member', 'admin', 'master'] as const).map((role) => (
                                <TouchableOpacity
                                    key={role}
                                    style={[styles.roleBtn, editingRole === role && styles.roleBtnActive]}
                                    onPress={() => setEditingRole(role)}
                                >
                                    <Text style={[styles.roleBtnText, editingRole === role && styles.roleBtnTextActive]}>
                                        {ROLE_LABELS[role]}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.modalLabel}>Relação na família</Text>
                        <TextInput
                            style={styles.relationInput}
                            value={editingRelation}
                            onChangeText={setEditingRelation}
                            placeholder="Ex: Pai, Mãe, Filho, Tia..."
                            placeholderTextColor="#64748b"
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowFamilyModal(false)}>
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveFamilyProfile}>
                                <Save size={14} color="#fff" />
                                <Text style={styles.saveText}>Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <SettingsModal visible={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 100, gap: 12 },
    profileHeader: { alignItems: 'center', marginBottom: 8 },
    name: { fontSize: 28, fontWeight: '900', marginTop: 16, color: '#0f172a' },
    roleBadge: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#dbeafe',
        borderWidth: 1,
        borderColor: '#93c5fd',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999
    },
    roleBadgeText: { color: '#1d4ed8', fontWeight: '800', fontSize: 12 },
    role: { fontSize: 14, color: '#64748b', marginTop: 6, fontWeight: '500' },
    statsRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
    statItem: { flex: 1, alignItems: 'center', paddingVertical: 10 },
    statValue: { fontSize: 18, fontWeight: '900', marginTop: 6, color: '#0f172a' },
    statLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
    sectionTitle: { fontSize: 13, fontWeight: '900', color: '#64748b', letterSpacing: 0.5, marginTop: 8 },
    emptyText: { color: '#64748b', fontStyle: 'italic' },
    memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    memberInfo: { flex: 1, marginLeft: 12 },
    memberName: { fontSize: 15, fontWeight: '600' },
    memberRole: { fontSize: 12, color: '#64748b', marginTop: 2 },
    memberPoints: { fontSize: 14, fontWeight: 'bold', color: '#22C55E' },
    manageBtn: {
        marginLeft: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: '#bfdbfe',
        borderRadius: 8,
        backgroundColor: '#eff6ff'
    },
    removeBtn: {
        marginLeft: 8,
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
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
    modalCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16 },
    modalTitle: { fontWeight: '900', fontSize: 18, color: '#0f172a' },
    modalSubtitle: { color: '#64748b', marginTop: 2, marginBottom: 12 },
    modalLabel: { fontSize: 12, color: '#64748b', fontWeight: '700', marginBottom: 8 },
    roleRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
    roleBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center' },
    roleBtnActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
    roleBtnText: { color: '#334155', fontWeight: '700', fontSize: 12 },
    roleBtnTextActive: { color: '#fff' },
    relationInput: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, color: '#0f172a' },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14 },
    cancelBtn: { paddingHorizontal: 12, justifyContent: 'center' },
    cancelText: { color: '#64748b', fontWeight: '700' },
    saveBtn: {
        backgroundColor: '#2563eb',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    saveText: { color: '#fff', fontWeight: '800' }
});
