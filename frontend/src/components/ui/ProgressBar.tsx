import React from 'react';
import { View, StyleSheet } from 'react-native';

export const ProgressBar = ({ progress, color = '#22C55E' }: { progress: number, color?: string }) => (
    <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress}%`, backgroundColor: color }]} />
    </View>
);

const styles = StyleSheet.create({
    track: { height: 10, backgroundColor: '#e2e8f0', borderRadius: 5, overflow: 'hidden', borderWidth: 1, borderColor: '#000' },
    fill: { height: '100%' }
});
