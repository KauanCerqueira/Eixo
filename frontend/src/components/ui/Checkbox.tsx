import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { THEME } from '../../theme';

export const Checkbox = ({ checked, onToggle }: { checked: boolean, onToggle: () => void }) => (
    <TouchableOpacity onPress={onToggle} style={[styles.box, checked && styles.checked]} activeOpacity={0.6}>
        {checked && <Check size={16} color="#000" strokeWidth={4} />}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    box: { 
        width: 28, 
        height: 28, 
        borderRadius: 8, 
        borderWidth: 3, 
        borderColor: '#000', 
        backgroundColor: '#FFF',
        justifyContent: 'center', 
        alignItems: 'center',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        marginRight: 8,
    },
    checked: { 
        backgroundColor: THEME.colors.accent2, // Green
    }
});
