import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, ShoppingCart, DollarSign, Trophy, Bell } from 'lucide-react-native';

interface EventCardProps {
    title: string;
    date: string;
    type?: 'event' | 'shopping' | 'expense' | 'achievement';
}

export const EventCard = ({ title, date, type = 'event' }: EventCardProps) => {
    const icons = {
        event: <Calendar size={20} color="#3B82F6" />,
        shopping: <ShoppingCart size={20} color="#10B981" />,
        expense: <DollarSign size={20} color="#F59E0B" />,
        achievement: <Trophy size={20} color="#8B5CF6" />,
    };

    return (
        <View style={styles.card}>
            <View style={styles.iconBox}>{icons[type]}</View>
            <View style={styles.info}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.date}>{date}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    iconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    info: { flex: 1 },
    title: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
    date: { fontSize: 12, color: '#64748b', marginTop: 2 }
});
