import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Plus } from 'lucide-react-native';

interface FABProps {
    onPress: () => void;
    label?: string;
}

export const FAB = ({ onPress, label }: FABProps) => (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
        <Plus size={28} color="#000" strokeWidth={3} />
        {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
);

interface AddButtonProps {
    onPress: () => void;
    size?: 'small' | 'large';
}

export const AddButton = ({ onPress, size = 'small' }: AddButtonProps) => (
    <TouchableOpacity
        style={[styles.addBtn, size === 'large' && styles.addBtnLarge]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Plus size={size === 'large' ? 20 : 16} color="#fff" strokeWidth={3} />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 90,
        right: 20,
        backgroundColor: '#FACC15',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 2,
    },
    addBtn: {
        backgroundColor: '#22C55E',
        borderRadius: 99,
        padding: 4,
        borderWidth: 2,
        borderColor: '#000',
    },
    addBtnLarge: {
        padding: 8,
    },
});
