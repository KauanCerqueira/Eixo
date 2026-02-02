import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';

export const Checkbox = ({ checked, onToggle }: { checked: boolean, onToggle: () => void }) => (
    <TouchableOpacity onPress={onToggle} style={[styles.box, checked && styles.checked]}>
        {checked && <Check size={14} color="#fff" strokeWidth={4} />}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    box: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#000', justifyContent: 'center', alignItems: 'center' },
    checked: { backgroundColor: '#22C55E' }
});
