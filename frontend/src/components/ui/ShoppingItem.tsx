import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';

interface ShoppingItemProps {
    name: string;
    quantity: string;
    isBought: boolean;
    onToggle: () => void;
}

export const ShoppingItem = ({ name, quantity, isBought, onToggle }: ShoppingItemProps) => (
    <TouchableOpacity onPress={onToggle} style={styles.row}>
        <View style={[styles.check, isBought && styles.checked]}>
            {isBought && <Check size={12} color="#fff" strokeWidth={4} />}
        </View>
        <Text style={[styles.name, isBought && styles.bought]}>{name}</Text>
        <Text style={styles.qty}>{quantity}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    check: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#000', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    checked: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
    name: { flex: 1, fontSize: 14, fontWeight: '500' },
    bought: { textDecorationLine: 'line-through', color: '#94a3b8' },
    qty: { fontSize: 12, color: '#64748b', backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }
});
