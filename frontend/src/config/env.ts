/**
 * Centralized Environment Configuration
 * Uses Expo's native environment variable support (EXPO_PUBLIC_*)
 */

// Fallback for local development when EXPO_PUBLIC_API_URL is not set.
const DEV_API_URL = 'http://10.0.2.2:5000';
const PUBLIC_API_URL = 'http://209.50.228.235:8090';

const isLocalAddress = (url: string) =>
    /localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+/i.test(url);

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() || '';
const fallbackApiUrl = __DEV__ ? DEV_API_URL : PUBLIC_API_URL;

let resolvedApiUrl = configuredApiUrl || fallbackApiUrl;

// Prevent shipping release builds pointing to local/private addresses.
if (!__DEV__ && isLocalAddress(resolvedApiUrl)) {
    resolvedApiUrl = PUBLIC_API_URL;
}

const API_URL = resolvedApiUrl.replace(/\/+$/, '');

export const ENV = {
    // API URL: Priority -> Environment Var -> Dev Default
    API_URL,

    // Derived URLs
    get API_BASE() {
        return `${this.API_URL}/api`;
    },
    get HUB_URL() {
        return `${this.API_URL}/hubs/notifications`;
    }
};

console.log('Environment Config:', ENV);
