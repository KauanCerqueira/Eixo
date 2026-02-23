import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { Bell, Send, Trash2 } from 'lucide-react-native';
import { THEME } from '../../theme';

export const FamilyBoard = () => {
    // @ts-ignore
    const { notices, addNotice, deleteNotice, currentUser, users } = useApp();
    const [newNotice, setNewNotice] = useState('');
    const [isAlert, setIsAlert] = useState(false);
    const [isSending, setIsSending] = useState(false);

    if (!currentUser) return null;

    const formatNoticeTime = (createdAt?: string) => {
        if (!createdAt) return '';
        const parsed = new Date(createdAt);
        if (Number.isNaN(parsed.getTime())) return '';
        return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    const handleAdd = async () => {
        const text = newNotice.trim();
        if (!text || isSending) return;

        setIsSending(true);
        try {
            await addNotice({
                text,
                authorId: currentUser.id,
                type: isAlert ? 'alert' : 'notice'
            });
            setNewNotice('');
            setIsAlert(false);
        } catch (error: any) {
            Alert.alert('Aviso', error?.message || 'Não foi possível enviar o aviso');
        } finally {
            setIsSending(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteNotice(id);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>MURAL DA FAMÍLIA 📌</Text>
            </View>

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="DEIXE UM AVISO..."
                    placeholderTextColor={THEME.colors.textSecondary}
                    value={newNotice}
                    onChangeText={setNewNotice}
                    multiline
                />
                <View style={styles.actions}>
                    <TouchableOpacity 
                        onPress={() => setIsAlert(!isAlert)} 
                        style={[styles.actionBtn, isAlert && styles.alertBtnActive]}
                    >
                        <Bell size={20} color={isAlert ? '#FFF' : THEME.colors.text} strokeWidth={2.5} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={handleAdd} 
                        style={[styles.actionBtn, styles.sendBtn, (!newNotice.trim() || isSending) && styles.disabledBtn]} 
                        disabled={!newNotice.trim() || isSending}
                    >
                        {isSending ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Send size={20} color="#FFF" strokeWidth={2.5} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Notices List */}
            <View style={styles.list}>
                {notices && notices.length > 0 ? (
                    notices.slice().reverse().map((notice: any) => {
                        const author = users.find((u: any) => u.id === notice.authorId) || currentUser;
                        const isUrgent = notice.type === 'alert';

                        return (
                            <View key={notice.id} style={[styles.card, isUrgent && styles.cardUrgent]}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.authorRow}>
                                        <Avatar user={author} size={28} />
                                        <View>
                                            <Text style={styles.authorName}>{author.name}</Text>
                                            <Text style={styles.time}>{formatNoticeTime(notice.createdAt)}</Text>
                                        </View>
                                    </View>
                                    {notice.authorId === currentUser.id && (
                                        <TouchableOpacity onPress={() => handleDelete(notice.id)} style={styles.deleteBtn}>
                                            <Trash2 size={16} color={THEME.colors.text} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <Text style={[styles.content, isUrgent && styles.contentUrgent]}>
                                    {notice.text}
                                </Text>
                                {isUrgent && (
                                    <View style={styles.urgentBadge}>
                                        <Text style={styles.urgentText}>URGENTE</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nenhum aviso por enquanto.</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 24 },
    header: { marginBottom: 12, paddingHorizontal: 4 },
    title: { 
        fontSize: 16, 
        fontWeight: '900', 
        color: THEME.colors.text, 
        letterSpacing: 0.5 
    },

    inputContainer: { 
        flexDirection: 'row', 
        gap: 12, 
        marginBottom: 24,
        alignItems: 'flex-start'
    },
    input: { 
        flex: 1, 
        backgroundColor: '#FFF', 
        borderWidth: 3,
        borderColor: THEME.colors.text,
        borderRadius: 12, 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        minHeight: 54,
        fontSize: 14,
        fontFamily: 'System',
        fontWeight: '600',
        color: THEME.colors.text,
        ...THEME.shadows.medium
    },
    actions: {
        flexDirection: 'row',
        gap: 8
    },
    actionBtn: { 
        width: 50, 
        height: 50, 
        borderRadius: 12, 
        backgroundColor: '#FFF', 
        borderWidth: 3,
        borderColor: THEME.colors.text,
        alignItems: 'center', 
        justifyContent: 'center',
        ...THEME.shadows.small
    },
    alertBtnActive: { 
        backgroundColor: THEME.colors.urgent,
        borderColor: THEME.colors.text
    },
    sendBtn: { 
        backgroundColor: THEME.colors.primary,
        borderColor: THEME.colors.text
    },
    disabledBtn: {
        opacity: 0.6,
        backgroundColor: THEME.colors.textSecondary
    },

    list: { gap: 16 },
    card: { 
        backgroundColor: '#FFF', 
        borderRadius: 16, 
        padding: 16, 
        borderWidth: 3, 
        borderColor: THEME.colors.text,
        ...THEME.shadows.medium
    },
    cardUrgent: { 
        backgroundColor: '#FFF5F5', 
        borderLeftWidth: 8,
        borderLeftColor: THEME.colors.urgent
    },

    cardHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#F1F5F9',
        paddingBottom: 12
    },
    authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    authorName: { fontWeight: '900', fontSize: 14, color: THEME.colors.text },
    time: { fontSize: 11, fontWeight: '700', color: THEME.colors.textSecondary },
    
    deleteBtn: {
        padding: 4
    },

    content: { fontSize: 16, color: THEME.colors.text, fontWeight: '600', lineHeight: 22 },
    contentUrgent: { color: THEME.colors.urgent, fontWeight: '800' },

    urgentBadge: {
        position: 'absolute',
        top: -10,
        right: 12,
        backgroundColor: THEME.colors.urgent,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: THEME.colors.text,
    },
    urgentText: {
        color: '#FFF',
        fontWeight: '900',
        fontSize: 10
    },

    emptyContainer: {
        padding: 24,
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 3,
        borderColor: THEME.colors.border,
        borderRadius: 16,
        borderStyle: 'dashed'
    },
    emptyText: { textAlign: 'center', color: THEME.colors.textSecondary, fontSize: 14, fontWeight: '600' }
});
