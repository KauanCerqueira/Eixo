import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User } from '../../types/types';
import { Avatar } from './Avatar';

interface ExpenseItemProps {
    title: string;
    amount: number;
    paidBy: User;
    splitCount: number;
    date: string;
}

export const ExpenseItem = ({ title, amount, paidBy, splitCount, date }: ExpenseItemProps) => (
    <View style={styles.row}>
        <Avatar user={paidBy} size={32} />
        <View style={styles.info}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.sub}>{paidBy.name} • ÷{splitCount} • {date}</Text>
        </View>
        <Text style={styles.amount}>R$ {amount.toFixed(0)}</Text>
    </View>
);

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    info: { flex: 1, marginLeft: 12 },
    title: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
    sub: { fontSize: 12, color: '#64748b', marginTop: 2 },
    amount: { fontSize: 16, fontWeight: 'bold', color: '#ef4444' }
});
