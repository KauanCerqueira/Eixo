import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { THEME } from '../../theme';

// Flexible user type that only requires the display properties
interface AvatarUser {
    id?: number;
    name?: string;
    initials: string;
    color: string;
}

export const Avatar = ({ user, size = 32 }: { user: AvatarUser, size?: number }) => (
    <View style={[styles.avatar, { 
        backgroundColor: user.color, 
        width: size, 
        height: size, 
        borderRadius: size / 2 
    }]}>
        <Text style={[styles.text, { fontSize: size / 2.5 }]}>{user.initials}</Text>
    </View>
);

const styles = StyleSheet.create({
    avatar: { 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderWidth: 2, // Thicker border
        borderColor: '#000',
        // Optional: Small shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 0,
    },
    text: { 
        color: '#fff', 
        fontWeight: '900' // Bold!
    }
});
