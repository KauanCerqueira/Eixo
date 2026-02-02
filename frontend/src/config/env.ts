/**
 * Centralized Environment Configuration
 * Uses Expo's native environment variable support (EXPO_PUBLIC_*)
 */

// Default to localhost for development if not specified
const DEV_API_URL = 'http://10.0.2.2:5000'; // Android Emulator default

export const ENV = {
    // API URL: Priority -> Environment Var -> Dev Default
    API_URL: process.env.EXPO_PUBLIC_API_URL || DEV_API_URL,

    // Derived URLs
    get API_BASE() {
        return `${this.API_URL}/api`;
    },
    get HUB_URL() {
        return `${this.API_URL}/hubs/notifications`;
    }
};

console.log('Environment Config:', ENV);
