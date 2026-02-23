import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

export const ProgressBar = ({ progress, color = '#22C55E', style }: { progress: number, color?: string, style?: ViewStyle }) => {
    const safeProgress = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0;

    return (
        <View style={[styles.track, style]}>
            <View style={[styles.fill, { width: `${safeProgress}%`, backgroundColor: color }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    track: { height: 10, backgroundColor: '#e2e8f0', borderRadius: 5, overflow: 'hidden', borderWidth: 1, borderColor: '#000' },
    fill: { height: '100%' }
});
