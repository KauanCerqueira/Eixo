import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Bell, CheckCircle, DollarSign, Calendar, Trophy } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';

export const ChatScreen = () => {
    const { contextMode, notifications, markNotificationRead, users } = useApp();

    const icons = {
        task: <CheckCircle size={20} color="#22C55E" />,
        expense: <DollarSign size={20} color="#F59E0B" />,
        event: <Calendar size={20} color="#3B82F6" />,
        achievement: <Trophy size={20} color="#8B5CF6" />,
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <Text style={styles.title}>Notificações {contextMode === 'nos' ? 'Família' : 'Pessoais'}</Text>
                    {unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount}</Text></View>}
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <Card style={styles.statCard}>
                        <Bell size={20} color="#3B82F6" />
                        <Text style={styles.statNum}>{notifications.length}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <View style={styles.dot} />
                        <Text style={styles.statNum}>{unreadCount}</Text>
                        <Text style={styles.statLabel}>Não lidas</Text>
                    </Card>
                </View>

                {/* Notifications */}
                <Text style={styles.sectionTitle}>RECENTES</Text>
                {notifications.map(n => (
                    <TouchableOpacity key={n.id} onPress={() => markNotificationRead(n.id)} activeOpacity={0.7}>
                        <Card style={[styles.notifCard, !n.isRead && styles.unread]}>
                            <View style={styles.notifRow}>
                                <View style={styles.iconBox}>{icons[n.type]}</View>
                                <View style={styles.notifInfo}>
                                    <Text style={styles.notifTitle}>{n.title}</Text>
                                    <Text style={styles.notifMsg}>{n.message}</Text>
                                </View>
                                <View style={styles.timeBox}>
                                    <Text style={styles.time}>{n.time}</Text>
                                    {!n.isRead && <View style={styles.unreadDot} />}
                                </View>
                            </View>
                        </Card>
                    </TouchableOpacity>
                ))}

                {/* Members */}
                {contextMode === 'nos' && (
                    <>
                        <Text style={styles.sectionTitle}>MEMBROS ONLINE</Text>
                        <Card>
                            <View style={styles.membersRow}>
                                {users.map(u => (
                                    <View key={u.id} style={styles.memberItem}>
                                        <Avatar user={u} size={40} />
                                        <View style={styles.onlineDot} />
                                        <Text style={styles.memberName}>{u.name}</Text>
                                    </View>
                                ))}
                            </View>
                        </Card>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
    header: { flexDirection: 'row', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: '900' },
    badge: { backgroundColor: '#EF4444', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 10 },
    badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    statsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: 16 },
    statNum: { fontSize: 20, fontWeight: '900', marginTop: 8 },
    statLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444' },
    sectionTitle: { fontSize: 14, fontWeight: '900', marginBottom: 10, marginTop: 24 },
    notifCard: { padding: 12, marginBottom: 8 },
    unread: { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
    notifRow: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    notifInfo: { flex: 1, marginLeft: 12 },
    notifTitle: { fontSize: 14, fontWeight: 'bold' },
    notifMsg: { fontSize: 13, color: '#64748b', marginTop: 2 },
    timeBox: { alignItems: 'flex-end' },
    time: { fontSize: 12, color: '#94a3b8' },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', marginTop: 4 },
    membersRow: { flexDirection: 'row', justifyContent: 'space-around' },
    memberItem: { alignItems: 'center' },
    memberName: { fontSize: 12, fontWeight: '600', marginTop: 8 },
    onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E', position: 'absolute', top: 0, right: -2, borderWidth: 2, borderColor: '#fff' },
});
