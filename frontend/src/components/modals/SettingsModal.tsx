import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch } from 'react-native';
import { X, Moon, Bell, LogOut, ChevronRight, Settings as SettingsIcon, Volume2 } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
}

export const SettingsModal = ({ visible, onClose }: SettingsModalProps) => {
    const { userSettings, updateUserSettings, contextMode } = useApp();

    const toggleCycle = () => updateUserSettings({ trackCycle: !userSettings.trackCycle });
    // Mock toggles for visual purposes if not in settings yet
    const toggleNotifications = () => { /* Logic to be implemented */ };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.modal} onStartShouldSetResponder={() => true}>
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <SettingsIcon size={24} color="#0f172a" />
                            <Text style={styles.title}>Configurações</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}><X size={24} color="#0f172a" /></TouchableOpacity>
                    </View>

                    <View style={styles.content}>

                        <Text style={styles.sectionTitle}>PREFERÊNCIAS GERAIS</Text>

                        <View style={styles.settingItem}>
                            <View style={styles.settingIconRow}>
                                <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
                                    <Moon size={18} color="#9333EA" />
                                </View>
                                <Text style={styles.settingLabel}>Acompanhar Ciclo</Text>
                            </View>
                            <Switch
                                value={userSettings.trackCycle}
                                onValueChange={toggleCycle}
                                trackColor={{ false: '#e2e8f0', true: '#C084FC' }}
                                thumbColor={userSettings.trackCycle ? '#9333EA' : '#f1f5f9'}
                            />
                        </View>

                        <View style={styles.settingItem}>
                            <View style={styles.settingIconRow}>
                                <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
                                    <Bell size={18} color="#2563EB" />
                                </View>
                                <Text style={styles.settingLabel}>Notificações</Text>
                            </View>
                            <Switch
                                value={true}
                                onValueChange={toggleNotifications}
                                trackColor={{ false: '#e2e8f0', true: '#60A5FA' }}
                                thumbColor={'#2563EB'}
                            />
                        </View>

                        <View style={styles.settingItem}>
                            <View style={styles.settingIconRow}>
                                <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                                    <Volume2 size={18} color="#16A34A" />
                                </View>
                                <Text style={styles.settingLabel}>Sons do App</Text>
                            </View>
                            <Switch
                                value={false}
                                trackColor={{ false: '#e2e8f0', true: '#4ADE80' }}
                            />
                        </View>

                        <TouchableOpacity style={[styles.settingItem, { marginTop: 8 }]}>
                            <View style={styles.settingIconRow}>
                                <Text style={[styles.settingLabel, { marginLeft: 0, fontWeight: '500' }]}>Conta & Privacidade</Text>
                            </View>
                            <ChevronRight size={20} color="#94a3b8" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.settingItem}>
                            <View style={styles.settingIconRow}>
                                <Text style={[styles.settingLabel, { marginLeft: 0, fontWeight: '500' }]}>Ajuda e Suporte</Text>
                            </View>
                            <ChevronRight size={20} color="#94a3b8" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.logoutBtn}>
                            <LogOut size={20} color="#EF4444" />
                            <Text style={styles.logoutText}>Encerrar Sessão</Text>
                        </TouchableOpacity>

                    </View>

                    <Text style={styles.version}>Eixo v2.1.0 (Alpha)</Text>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    title: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
    content: { padding: 24 },

    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 0.5, marginBottom: 16 },

    settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    settingIconRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    settingLabel: { fontSize: 16, fontWeight: '600', color: '#334155' },

    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 8 },

    logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
    logoutText: { fontSize: 16, fontWeight: '600', color: '#EF4444' },

    version: { textAlign: 'center', fontSize: 12, color: '#cbd5e1', marginTop: 20 },

    // Account Styles
    accountCard: { alignItems: 'center', marginBottom: 32 },
    avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    avatarInitials: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    accountName: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
    accountEmail: { fontSize: 14, color: '#64748b' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    infoLabel: { fontSize: 14, color: '#64748b' },
    infoValue: { fontSize: 14, color: '#0f172a', fontWeight: '600' },
    actionBtn: { padding: 16, backgroundColor: '#f8fafc', borderRadius: 12, alignItems: 'center', marginTop: 12 },
    actionBtnText: { fontWeight: '600', color: '#334155' },
    dangerBtn: { backgroundColor: '#FEF2F2' },

    // Support Styles
    supportCard: { alignItems: 'center', padding: 20, backgroundColor: '#f8fafc', borderRadius: 20 },
    supportIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    supportTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
    supportText: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    contactBox: { alignItems: 'center', paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0', width: '100%' },
    contactLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
    contactName: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    contactSub: { fontSize: 13, color: '#3B82F6', fontWeight: '600' },
});
