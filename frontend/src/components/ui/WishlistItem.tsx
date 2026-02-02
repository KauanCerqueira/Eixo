import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';

interface WishlistItemProps {
    title: string;
    price: number;
    saved: number;
    priority: 'high' | 'medium' | 'low';
}

export const WishlistItem = ({ title, price, saved, priority }: WishlistItemProps) => {
    const progress = (saved / price) * 100;
    const priorityColors = { high: '#EF4444', medium: '#F59E0B', low: '#94A3B8' };

    return (
        <View style={styles.row}>
            <Star size={16} color={priorityColors[priority]} fill={priority === 'high' ? priorityColors[priority] : 'none'} />
            <View style={styles.info}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
            </View>
            <View style={styles.priceBox}>
                <Text style={styles.saved}>R$ {saved}</Text>
                <Text style={styles.total}>/ {price}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    info: { flex: 1, marginLeft: 12 },
    title: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
    progressTrack: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#22C55E' },
    priceBox: { flexDirection: 'row', alignItems: 'baseline' },
    saved: { fontSize: 14, fontWeight: 'bold', color: '#22C55E' },
    total: { fontSize: 12, color: '#64748b' }
});
