import * as signalR from '@microsoft/signalr';
import { ENV } from '../config/env';

const HUB_URL = ENV.HUB_URL;

export type NotificationType =
    | 'TaskCompleted'
    | 'RewardRedeemed'
    | 'NewExpense'
    | 'GoalProgress'
    | 'ShoppingItemAdded'
    | 'NewNotice'
    | 'DirectNotification';

export interface RealTimeNotification {
    type: NotificationType;
    message: string;
    timestamp: string;
    data?: any;
}

type NotificationListener = (notification: RealTimeNotification) => void;

class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private listeners: NotificationListener[] = [];
    private isConnected = false;
    private userId: number | null = null;

    /**
     * Start connection to SignalR hub
     */
    async connect(userId?: number): Promise<void> {
        if (this.isConnected && this.connection) {
            console.log('SignalR: Already connected');
            return;
        }

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL)
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Retry intervals
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Register event handlers
        this.registerEventHandlers();

        try {
            await this.connection.start();
            this.isConnected = true;
            console.log('SignalR: Connected to notification hub');

            // Join user-specific channel
            if (userId) {
                this.userId = userId;
                await this.connection.invoke('JoinUserChannel', userId);
                console.log(`SignalR: Joined user channel ${userId}`);
            }
        } catch (error) {
            console.error('SignalR: Connection failed', error);
            this.isConnected = false;
        }

        // Handle reconnection
        this.connection.onreconnected(() => {
            console.log('SignalR: Reconnected');
            this.isConnected = true;
            if (this.userId) {
                this.connection?.invoke('JoinUserChannel', this.userId);
            }
        });

        this.connection.onclose(() => {
            console.log('SignalR: Disconnected');
            this.isConnected = false;
        });
    }

    /**
     * Disconnect from SignalR hub
     */
    async disconnect(): Promise<void> {
        if (this.connection && this.isConnected) {
            if (this.userId) {
                await this.connection.invoke('LeaveUserChannel', this.userId);
            }
            await this.connection.stop();
            this.isConnected = false;
            console.log('SignalR: Disconnected');
        }
    }

    /**
     * Register handlers for all notification types
     */
    private registerEventHandlers() {
        if (!this.connection) return;

        const events: NotificationType[] = [
            'TaskCompleted',
            'RewardRedeemed',
            'NewExpense',
            'GoalProgress',
            'ShoppingItemAdded',
            'NewNotice',
            'DirectNotification'
        ];

        events.forEach(eventName => {
            this.connection!.on(eventName, (data: any) => {
                const notification: RealTimeNotification = {
                    type: eventName,
                    message: data.message || '',
                    timestamp: data.timestamp || new Date().toISOString(),
                    data
                };

                console.log(`SignalR: ${eventName}`, notification);

                // Notify all listeners
                this.listeners.forEach(listener => listener(notification));
            });
        });
    }

    /**
     * Subscribe to notifications
     */
    subscribe(listener: NotificationListener): () => void {
        this.listeners.push(listener);

        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    /**
     * Check if connected
     */
    get connected(): boolean {
        return this.isConnected;
    }
}

// Export singleton instance
export const signalRService = new SignalRService();
