import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Flame } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { SettingsModal } from '../modals/SettingsModal';

export const Header = () => {
    const { contextMode, setContextMode, currentUser, leaderboard } = useApp();
    const navigation = useNavigation<any>();

    // Find user stats in new leaderboard structure (id is directly on object)
    const userStats = currentUser ? leaderboard.find(l => l.id === currentUser.id) : null;

    const [isSettingsVisible, setIsSettingsVisible] = useState(false);

    // Default user for Avatar when currentUser is null
    const displayUser = currentUser || { id: 0, name: 'User', initials: 'US', color: '#ccc' };

    return (
        <>
            <View style={styles.container}>
                <View style={styles.topRow}>
                    <View style={styles.logoRow}>
                        <Text style={styles.logo}>EIXO</Text>
                        <View style={styles.streakBadge}>
                            <Flame size={14} color="#F59E0B" />
                            <Text style={styles.streakText}>{userStats?.streak || currentUser?.streak || 0}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.profileBtn} onPress={() => setIsSettingsVisible(true)}>
                        <Avatar user={displayUser} size={36} />
                    </TouchableOpacity>
                </View>

                <ToggleSwitch value={contextMode} onChange={setContextMode} />
            </View>

            <SettingsModal visible={isSettingsVisible} onClose={() => setIsSettingsVisible(false)} />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#000',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0f172a',
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 99,
        marginLeft: 10,
        borderWidth: 1,
        borderColor: '#F59E0B',
    },
    streakText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#92400E',
        marginLeft: 4,
    },
    profileBtn: {
        padding: 2,
    },
});
