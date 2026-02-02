import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { Moon, Settings } from 'lucide-react-native';
import { Card } from '../components/ui/Card';
import { AddCycleEntryModal } from '../components/modals/AddCycleEntryModal';

const CycleScreen = () => {
    const { cycleLog, userSettings, updateUserSettings } = useApp();
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const toggleTracking = () => {
        updateUserSettings({ trackCycle: !userSettings.trackCycle });
    };

    // Simple Prediction Logic (Mock)
    const today = new Date();
    const nextPeriod = new Date();
    nextPeriod.setDate(today.getDate() + 12); // Mock: 12 days left
    const daysLeft = 12;

    if (!userSettings.trackCycle) {
        return (
            <View style={styles.container}>
                <View style={[styles.header, { padding: 20 }]}>
                    <Text style={styles.title}>Meu Ciclo</Text>
                </View>
                <View style={styles.disabledContainer}>
                    <Moon size={64} color="#CBD5E1" />
                    <Text style={styles.disabledText}>O rastreamento de ciclo está desativado.</Text>
                    <TouchableOpacity style={styles.enableBtn} onPress={toggleTracking}>
                        <Text style={styles.enableBtnText}>Ativar Rastreamento</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Meu Ciclo</Text>
                        <Text style={styles.subtitle}>Previsão e registros.</Text>
                    </View>
                    <TouchableOpacity onPress={toggleTracking}>
                        <Settings size={24} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                {/* Main Prediction Card */}
                <Card style={styles.predictionCard}>
                    <View style={styles.predictionContent}>
                        <Moon size={32} color="#8B5CF6" />
                        <View style={{ alignItems: 'center' }}>
                            <Text style={styles.predictionLabel}>PRÓXIMA MENSTRUAÇÃO EM</Text>
                            <Text style={styles.predictionValue}>{daysLeft} dias</Text>
                            <Text style={styles.predictionDate}>{nextPeriod.toLocaleDateString()}</Text>
                        </View>
                    </View>
                </Card>

                {/* Log Button Row */}
                <View style={styles.logRow}>
                    <Text style={styles.sectionTitle}>REGISTRAR HOJE</Text>
                    <TouchableOpacity style={styles.logBtn} onPress={() => setIsMenuVisible(true)}>
                        <Text style={styles.logBtnText}>+ Adicionar Registro</Text>
                    </TouchableOpacity>
                </View>

                {/* History */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>HISTÓRICO</Text>
                </View>

                {cycleLog.length > 0 ? (
                    cycleLog.slice().reverse().map((day, idx) => (
                        <Card key={idx} style={styles.logCard}>
                            <View style={styles.logLeft}>
                                <View style={[styles.dot,
                                day.flowIntensity === 'heavy' ? { backgroundColor: '#EF4444' } :
                                    day.flowIntensity === 'medium' ? { backgroundColor: '#F59E0B' } :
                                        { backgroundColor: '#FCD34D' }
                                ]} />
                                <View>
                                    <Text style={styles.logDate}>{new Date(day.date).toLocaleDateString()}</Text>
                                    <View style={styles.symptomsRow}>
                                        {day.symptoms && day.symptoms.length > 0 ? (
                                            day.symptoms.map(s => (
                                                <Text key={s} style={styles.symptomTag}>{s}</Text>
                                            ))
                                        ) : (
                                            <Text style={styles.noSymptoms}>Sem sintomas</Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                            <Text style={styles.logFlow}>Fluxo {day.flowIntensity === 'heavy' ? 'Intenso' : day.flowIntensity === 'medium' ? 'Médio' : 'Leve'}</Text>
                        </Card>
                    ))
                ) : (
                    <Card style={styles.emptyCard}>
                        <Text style={styles.emptyText}>Nenhum registro recente.</Text>
                    </Card>
                )}
            </ScrollView>

            <AddCycleEntryModal visible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
    header: { marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b' },

    disabledContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    disabledText: { textAlign: 'center', marginTop: 16, color: '#94a3b8', fontSize: 16 },
    enableBtn: { marginTop: 24, backgroundColor: '#0f172a', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    enableBtnText: { color: '#fff', fontWeight: 'bold' },

    predictionCard: { padding: 24, backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#DDD6FE', alignItems: 'center', marginBottom: 32 },
    predictionContent: { alignItems: 'center', gap: 16 },
    predictionLabel: { fontSize: 12, fontWeight: 'bold', color: '#7C3AED', letterSpacing: 1 },
    predictionValue: { fontSize: 32, fontWeight: '900', color: '#5B21B6' },
    predictionDate: { fontSize: 14, color: '#6D28D9', fontWeight: '500' },

    logRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 13, fontWeight: '900', color: '#64748b', letterSpacing: 0.5 },
    logBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    logBtnText: { fontSize: 12, fontWeight: 'bold', color: '#0f172a' },

    sectionHeader: { marginBottom: 12 },

    logCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginBottom: 8 },
    logLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    dot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
    logDate: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
    symptomsRow: { flexDirection: 'row', gap: 4, marginTop: 2 },
    symptomTag: { fontSize: 10, color: '#fff', backgroundColor: '#A78BFA', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
    noSymptoms: { fontSize: 10, color: '#94a3b8', fontStyle: 'italic' },
    logFlow: { fontSize: 12, color: '#64748b', fontWeight: '500' },

    emptyCard: { padding: 32, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#94a3b8', fontStyle: 'italic' },
});

export default CycleScreen;
