import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { MessageSquare, Bell, X, Send } from 'lucide-react-native';

export const FamilyBoard = () => {
    const { notices, addNotice, deleteNotice, currentUser, users } = useApp();
    const [newNotice, setNewNotice] = useState('');
    const [isAlert, setIsAlert] = useState(false);

    if (!currentUser) return null;

    const handleAdd = () => {
        if (!newNotice.trim()) return;
        addNotice({
            text: newNotice,
            authorId: currentUser.id,
            type: isAlert ? 'alert' : 'status'
        });
        setNewNotice('');
        setIsAlert(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>MURAL DE AVISOS 📌</Text>
            </View>

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Deixe um aviso para a casa..."
                    value={newNotice}
                    onChangeText={setNewNotice}
                />
                <TouchableOpacity onPress={() => setIsAlert(!isAlert)} style={[styles.typeBtn, isAlert && styles.typeBtnActive]}>
                    <Bell size={20} color={isAlert ? '#fff' : '#94a3b8'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAdd} style={styles.sendBtn}>
                    <Send size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Notices List */}
            <View style={styles.list}>
                {notices.map(notice => {
                    const author = users.find(u => u.id === notice.authorId) || currentUser;
                    const isUrgent = notice.type === 'alert';

                    return (
                        <View key={notice.id} style={[styles.card, isUrgent && styles.cardUrgent]}>
                            <View style={styles.cardHeader}>
                                <View style={styles.authorRow}>
                                    <Avatar user={author} size={24} />
                                    <Text style={[styles.authorName, isUrgent && styles.textUrgent]}>{author.name}</Text>
                                    <Text style={styles.time}>hoje</Text>
                                </View>
                                {notice.authorId === currentUser.id && (
                                    <TouchableOpacity onPress={() => deleteNotice(notice.id)}>
                                        <X size={14} color="#94a3b8" />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <Text style={[styles.content, isUrgent && styles.textUrgent]}>{notice.text}</Text>
                        </View>
                    );
                })}
                {notices.length === 0 && (
                    <Text style={styles.emptyText}>Nenhum aviso no momento.</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 24 },
    header: { marginBottom: 12 },
    title: { fontSize: 13, fontWeight: '900', color: '#64748b', marginLeft: 4 },

    inputContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    input: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 16, height: 44 },
    typeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
    typeBtnActive: { backgroundColor: '#EF4444' },
    sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },

    list: { gap: 10 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    cardUrgent: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },

    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    authorName: { fontWeight: 'bold', fontSize: 13, color: '#0f172a' },
    time: { fontSize: 11, color: '#94a3b8' },

    content: { fontSize: 14, color: '#334155', lineHeight: 20 },
    textUrgent: { color: '#B91C1C' },

    emptyText: { textAlign: 'center', color: '#94a3b8', fontSize: 13, fontStyle: 'italic', marginTop: 8 }
});
