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
    private connectPromise: Promise<void> | null = null;

    /**
     * Start connection to SignalR hub
     */
    async connect(userId?: number): Promise<void> {
        if (userId) {
            this.userId = userId;
        }

        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            this.isConnected = true;
            await this.joinCurrentUserChannel();
            return;
        }

        if (this.connectPromise) {
            await this.connectPromise;
            await this.joinCurrentUserChannel();
            return;
        }

        if (!this.connection) {
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(HUB_URL)
                .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Retry intervals
                .configureLogging(__DEV__ ? signalR.LogLevel.Information : signalR.LogLevel.Error)
                .build();

            // Register event handlers once
            this.registerEventHandlers();

            // Handle reconnection lifecycle
            this.connection.onreconnecting(() => {
                this.isConnected = false;
            });

            this.connection.onreconnected(async () => {
                this.isConnected = true;
                await this.joinCurrentUserChannel();
            });

            this.connection.onclose(() => {
                this.isConnected = false;
            });
        }

        this.connectPromise = (async () => {
            try {
                await this.connection!.start();
                this.isConnected = true;
                await this.joinCurrentUserChannel();
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                const handshakeInterrupted = message.toLowerCase().includes('stopped before the hub handshake could complete');
                if (handshakeInterrupted) {
                    console.warn('SignalR: handshake interrupted, aguardando próxima tentativa automática');
                } else {
                    console.warn('SignalR: Connection failed', error);
                }
                this.isConnected = false;
            } finally {
                this.connectPromise = null;
            }
        })();

        await this.connectPromise;
    }

    /**
     * Disconnect from SignalR hub
     */
    async disconnect(): Promise<void> {
        if (!this.connection) return;
        try {
            await this.connection.stop();
        } catch (error) {
            console.warn('SignalR: stop failed', error);
        } finally {
            this.isConnected = false;
        }
    }

    private async joinCurrentUserChannel(): Promise<void> {
        if (!this.connection || !this.userId) return;
        if (this.connection.state !== signalR.HubConnectionState.Connected) return;

        try {
            await this.connection.invoke('JoinUserChannel', this.userId);
        } catch (error) {
            // Avoid crashing UI with redbox when reconnect races happen.
            console.warn('SignalR: JoinUserChannel failed', error);
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

                if (__DEV__) {
                    console.log(`SignalR: ${eventName}`, notification);
                }

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
