import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

// Flexible user type that only requires the display properties
interface AvatarUser {
    id?: number;
    name?: string;
    initials: string;
    color: string;
}

export const Avatar = ({ user, size = 24 }: { user: AvatarUser, size?: number }) => (
    <View style={[styles.avatar, { backgroundColor: user.color, width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[styles.text, { fontSize: size / 2.5 }]}>{user.initials}</Text>
    </View>
);

const styles = StyleSheet.create({
    avatar: { justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#000' },
    text: { color: '#fff', fontWeight: 'bold' }
});
