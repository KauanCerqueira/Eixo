import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

export const ToggleSwitch = ({ value, onChange }: { value: 'nos' | 'eu', onChange: (v: 'nos' | 'eu') => void }) => (
    <View style={styles.container}>
        <TouchableOpacity onPress={() => onChange('nos')} style={[styles.btn, value === 'nos' && styles.activeNos]}>
            <Text style={[styles.text, value === 'nos' && styles.textActive]}>NÓS</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onChange('eu')} style={[styles.btn, value === 'eu' && styles.activeEu]}>
            <Text style={[styles.text, value === 'eu' && styles.textActive]}>EU</Text>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    container: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 99, padding: 4, borderWidth: 2, borderColor: '#000' },
    btn: { flex: 1, paddingVertical: 10, borderRadius: 99, alignItems: 'center' },
    activeNos: { backgroundColor: '#FACC15' },
    activeEu: { backgroundColor: '#FACC15' },
    text: { fontWeight: 'bold', color: '#64748b' },
    textActive: { color: '#000' }
});
