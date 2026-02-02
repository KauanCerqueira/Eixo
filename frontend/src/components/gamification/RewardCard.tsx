import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Reward } from '../../types/types';

interface RewardCardProps {
    reward: Reward;
    userPoints: number;
    onRedeem: (reward: Reward) => void;
}

export const RewardCard = ({ reward, userPoints, onRedeem }: RewardCardProps) => {
    const canAfford = userPoints >= reward.cost;

    return (
        <View style={[styles.card, !canAfford && styles.disabledCard]}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>{reward.icon}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.title}>{reward.title}</Text>
                <Text style={styles.cost}><Text style={{ fontWeight: 'bold' }}>{reward.cost}</Text> pts</Text>
            </View>
            <TouchableOpacity
                style={[styles.btn, canAfford ? styles.btnActive : styles.btnDisabled]}
                disabled={!canAfford}
                onPress={() => onRedeem(reward)}
            >
                <Text style={[styles.btnText, canAfford ? styles.btnTextActive : styles.btnTextDisabled]}>
                    Resgatar
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    disabledCard: {
        opacity: 0.6,
        backgroundColor: '#f8fafc'
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    icon: {
        fontSize: 20
    },
    info: {
        flex: 1
    },
    title: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#0f172a'
    },
    cost: {
        fontSize: 12,
        color: '#64748b'
    },
    btn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 2,
    },
    btnActive: {
        backgroundColor: '#DCFCE7', // Light green
        borderColor: '#22C55E',    // Green
    },
    btnDisabled: {
        backgroundColor: '#f1f5f9',
        borderColor: '#cbd5e1'
    },
    btnText: {
        fontSize: 12,
        fontWeight: 'bold'
    },
    btnTextActive: {
        color: '#15803d'
    },
    btnTextDisabled: {
        color: '#94a3b8'
    }
});
