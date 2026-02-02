import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Animated,
    Dimensions, SafeAreaView, ScrollView, ActivityIndicator
} from 'react-native';
import { User, Lock } from 'lucide-react-native';
import { api } from '../services/api';
import { authService, AuthUser } from '../services/auth';

interface LoginScreenProps {
    onLogin: (user: AuthUser) => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
    const [users, setUsers] = useState<Array<{ id: number; name: string; initials: string; color: string }>>([]);
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        loadUsers();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const loadUsers = async () => {
        try {
            const usersData = await api.getUsers();
            setUsers(usersData.map(u => ({
                id: u.id,
                name: u.name,
                initials: u.initials,
                color: u.color
            })));
        } catch (err) {
            setError('Não foi possível carregar usuários');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNumberPress = (num: string) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === 4 && selectedUser) {
                handleLogin(newPin);
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
        setError(null);
    };

    const handleLogin = async (pinCode: string) => {
        if (!selectedUser) return;

        setIsLoading(true);
        setError(null);

        try {
            const user = users.find(u => u.id === selectedUser);
            if (!user) throw new Error('Usuário não encontrado');

            const result = await authService.login(user.name, pinCode);
            onLogin(result.user!);
        } catch (err: any) {
            setError(err.message || 'PIN incorreto');
            setPin('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickLogin = async (userId: number) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await authService.quickLogin(userId);
            onLogin(result.user!);
        } catch (err: any) {
            setError(err.message || 'Erro ao entrar');
        } finally {
            setIsLoading(false);
        }
    };

    const renderUserSelector = () => (
        <View style={styles.userGrid}>
            {users.map(user => (
                <TouchableOpacity
                    key={user.id}
                    style={[
                        styles.userCard,
                        selectedUser === user.id && styles.userCardSelected,
                        { borderColor: selectedUser === user.id ? user.color : '#e2e8f0' }
                    ]}
                    onPress={() => setSelectedUser(user.id)}
                    onLongPress={() => handleQuickLogin(user.id)}
                >
                    <View style={[styles.avatar, { backgroundColor: user.color }]}>
                        <Text style={styles.avatarText}>{user.initials}</Text>
                    </View>
                    <Text style={styles.userName}>{user.name}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderPinInput = () => (
        <View style={styles.pinSection}>
            <Text style={styles.pinLabel}>Digite seu PIN</Text>
            <View style={styles.pinDots}>
                {[0, 1, 2, 3].map(i => (
                    <View
                        key={i}
                        style={[
                            styles.pinDot,
                            pin.length > i && styles.pinDotFilled
                        ]}
                    />
                ))}
            </View>

            <View style={styles.keypad}>
                {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', '⌫']].map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.keypadRow}>
                        {row.map((key, keyIndex) => (
                            <TouchableOpacity
                                key={keyIndex}
                                style={[styles.key, key === '' && styles.keyInvisible]}
                                onPress={() => key === '⌫' ? handleDelete() : key && handleNumberPress(key)}
                                disabled={key === '' || isLoading}
                            >
                                {key === '⌫' ? (
                                    <Text style={styles.keyText}>⌫</Text>
                                ) : (
                                    <Text style={styles.keyText}>{key}</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );

    if (isLoading && users.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <View style={styles.header}>
                    <Text style={styles.logo}>Eixo</Text>
                    <Text style={styles.subtitle}>Quem está aí?</Text>
                </View>

                {error && (
                    <View style={styles.errorBanner}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {!selectedUser ? (
                        renderUserSelector()
                    ) : (
                        <View>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => {
                                    setSelectedUser(null);
                                    setPin('');
                                }}
                            >
                                <Text style={styles.backButtonText}>← Trocar usuário</Text>
                            </TouchableOpacity>

                            <View style={styles.selectedUserDisplay}>
                                <View style={[
                                    styles.avatarLarge,
                                    { backgroundColor: users.find(u => u.id === selectedUser)?.color }
                                ]}>
                                    <Text style={styles.avatarTextLarge}>
                                        {users.find(u => u.id === selectedUser)?.initials}
                                    </Text>
                                </View>
                                <Text style={styles.selectedUserName}>
                                    {users.find(u => u.id === selectedUser)?.name}
                                </Text>
                            </View>

                            {renderPinInput()}
                        </View>
                    )}
                </ScrollView>

                <Text style={styles.hint}>
                    Segure no usuário para entrada rápida
                </Text>
            </Animated.View>
        </SafeAreaView>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 40,
    },
    logo: {
        fontSize: 48,
        fontWeight: '800',
        color: '#8B5CF6',
        letterSpacing: -2,
    },
    subtitle: {
        fontSize: 18,
        color: '#94a3b8',
        marginTop: 8,
    },
    scrollContent: {
        flexGrow: 1,
    },
    userGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 16,
    },
    userCard: {
        width: (width - 80) / 2,
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#334155',
    },
    userCardSelected: {
        backgroundColor: '#1e293b',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    userName: {
        color: '#f1f5f9',
        fontSize: 16,
        fontWeight: '600',
    },
    backButton: {
        marginBottom: 24,
    },
    backButtonText: {
        color: '#8B5CF6',
        fontSize: 16,
    },
    selectedUserDisplay: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarTextLarge: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '700',
    },
    selectedUserName: {
        color: '#f1f5f9',
        fontSize: 24,
        fontWeight: '700',
    },
    pinSection: {
        alignItems: 'center',
    },
    pinLabel: {
        color: '#94a3b8',
        fontSize: 16,
        marginBottom: 16,
    },
    pinDots: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    pinDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#334155',
    },
    pinDotFilled: {
        backgroundColor: '#8B5CF6',
    },
    keypad: {
        gap: 12,
    },
    keypadRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    key: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#1e293b',
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyInvisible: {
        backgroundColor: 'transparent',
    },
    keyText: {
        color: '#f1f5f9',
        fontSize: 28,
        fontWeight: '600',
    },
    errorBanner: {
        backgroundColor: '#7f1d1d',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: '#fca5a5',
        textAlign: 'center',
        fontWeight: '500',
    },
    hint: {
        color: '#64748b',
        textAlign: 'center',
        fontSize: 14,
        marginTop: 16,
    },
});
