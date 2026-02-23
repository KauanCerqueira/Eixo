import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { api } from './api';

const PUSH_TOKEN_KEY = '@eixo_push_token';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

class PushNotificationsService {
    private registrationInFlight = false;
    private isExpoGo(): boolean {
        return Constants.appOwnership === 'expo';
    }

    private getProjectId(): string | undefined {
        const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
        return extra?.eas?.projectId;
    }

    async registerForUser(userId: number): Promise<void> {
        if (this.registrationInFlight) return;
        this.registrationInFlight = true;
        try {
            if (this.isExpoGo()) {
                // Remote push does not work in Expo Go (SDK 53+).
                return;
            }
            if (!Device.isDevice) return;

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') return;

            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.HIGH,
            });

            const projectId = this.getProjectId();
            if (!projectId) return;

            const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
            const token = tokenResult?.data?.trim();
            if (!token) return;

            const lastToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
            if (lastToken === token) {
                await api.registerPushDevice(userId, token);
                return;
            }

            await api.registerPushDevice(userId, token);
            await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
        } catch (error) {
            console.warn('Push registration failed', error);
        } finally {
            this.registrationInFlight = false;
        }
    }

    async unregisterForUser(userId?: number): Promise<void> {
        try {
            if (this.isExpoGo()) return;
            const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
            if (token) {
                await api.unregisterPushDevice(token, userId);
                await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
            }
        } catch (error) {
            console.warn('Push unregister failed', error);
        }
    }
}

export const pushNotificationsService = new PushNotificationsService();
