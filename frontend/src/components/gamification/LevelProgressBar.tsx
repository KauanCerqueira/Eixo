import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LEVELS } from '../../types/types';

interface LevelProgressBarProps {
    xp: number;
    level: number;
}

export const LevelProgressBar = ({ xp, level }: LevelProgressBarProps) => {
    // Find limits
    const currentLevel = LEVELS.find(l => l.level === level) || LEVELS[0];
    const nextLevel = LEVELS.find(l => l.level === level + 1);

    let progress = 0;
    let nextLevelXp = currentLevel.minXp + 1000; // Default fallback

    if (nextLevel) {
        // Calculate progress within current level bracket using simple linear interpolation locally
        // Or simpler: Total XP towards next milestone.
        // Let's use Total XP vs Next Level Min XP.

        // Example: Level 1 (0 points). Level 2 (1000 points). User has 450.
        // Progress = (450 - 0) / (1000 - 0) = 45%

        const prevMinXp = currentLevel.minXp;
        nextLevelXp = nextLevel.minXp;
        const totalBracket = nextLevelXp - prevMinXp;
        const currentInBracket = xp - prevMinXp;

        progress = Math.min(100, Math.max(0, (currentInBracket / totalBracket) * 100));
    } else {
        // Max level
        progress = 100;
        nextLevelXp = xp;
    }

    return (
        <View style={styles.container}>
            <View style={styles.infoRow}>
                <Text style={styles.levelBadge}>Nível {level} - {currentLevel.title}</Text>
                <Text style={styles.xpText}>{xp} / {nextLevel ? nextLevelXp : 'MAX'} XP</Text>
            </View>
            <View style={styles.track}>
                <View style={[styles.fill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.nextText}>
                {nextLevel ? `Faltam ${nextLevelXp - xp} XP para ${nextLevel.title}` : 'Você é uma lenda!'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        alignItems: 'center'
    },
    levelBadge: {
        backgroundColor: '#FACC15',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        fontWeight: 'bold',
        fontSize: 12,
        color: '#000'
    },
    xpText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748b'
    },
    track: {
        height: 8,
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
        overflow: 'hidden'
    },
    fill: {
        height: '100%',
        backgroundColor: '#3B82F6',
        borderRadius: 4
    },
    nextText: {
        fontSize: 10,
        color: '#94a3b8',
        marginTop: 4,
        textAlign: 'right'
    }
});
