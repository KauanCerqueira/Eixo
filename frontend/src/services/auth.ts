import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';

const API_BASE_URL = ENV.API_BASE;
const TOKEN_KEY = '@eixo_token';
const USER_KEY = '@eixo_user';
const FIRST_LAUNCH_KEY = '@eixo_first_launch_done';

export interface AuthUser {
    id: number;
    name: string;
    initials: string;
    color: string;
    familyRole?: 'master' | 'admin' | 'member';
    familyRelation?: string;
    points: number;
    level: number;
    xp: number;
}

export interface AuthState {
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
}

class AuthService {
    private token: string | null = null;
    private user: AuthUser | null = null;
    private readonly timeoutMs = 15000;

    private async fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            return await fetch(input, { ...init, signal: controller.signal });
        } finally {
            clearTimeout(timeout);
        }
    }

    private async parseError(response: Response): Promise<string> {
        const fallback = `Erro de rede (${response.status})`;
        const contentType = response.headers.get('content-type') || '';
        try {
            if (contentType.includes('application/json')) {
                const json = await response.json();
                return json?.message || fallback;
            }
            const text = await response.text();
            return text || fallback;
        } catch {
            return fallback;
        }
    }

    private async ensureFirstLaunchRequiresLogin(): Promise<void> {
        const firstLaunchDone = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
        if (firstLaunchDone) return;

        // If the app was restored with stale storage, force fresh auth on first launch.
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
        this.token = null;
        this.user = null;
        await AsyncStorage.setItem(FIRST_LAUNCH_KEY, '1');
    }

    /**
     * Initialize auth state from storage
     */
    async initialize(): Promise<AuthState> {
        try {
            await this.ensureFirstLaunchRequiresLogin();

            const [storedToken, storedUser] = await Promise.all([
                AsyncStorage.getItem(TOKEN_KEY),
                AsyncStorage.getItem(USER_KEY)
            ]);

            if (storedToken && storedUser) {
                this.token = storedToken;
                this.user = JSON.parse(storedUser);

                // Validate token is still valid
                const isValid = await this.validateToken();
                if (!isValid) {
                    await this.logout();
                    return { token: null, user: null, isAuthenticated: false };
                }
            }

            return {
                token: this.token,
                user: this.user,
                isAuthenticated: !!this.token
            };
        } catch (error) {
            console.error('Auth initialization failed:', error);
            return { token: null, user: null, isAuthenticated: false };
        }
    }

    /**
     * Login with name and PIN
     */
    async login(name: string, pin: string): Promise<AuthState> {
        let response: Response;
        try {
            response = await this.fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, pin })
            });
        } catch (error: any) {
            const isTimeout = error?.name === 'AbortError';
            throw new Error(
                isTimeout
                    ? `Tempo de conexão excedido. Verifique a API: ${API_BASE_URL}`
                    : `Falha de rede. Verifique a API: ${API_BASE_URL}`
            );
        }

        if (!response.ok) {
            throw new Error(await this.parseError(response));
        }

        const data = await response.json();
        await this.setAuthState(data.token, data.user);

        return {
            token: data.token,
            user: data.user,
            isAuthenticated: true
        };
    }

    /**
     * Register and authenticate a new user
     */
    async register(name: string, pin: string): Promise<AuthState> {
        let response: Response;
        try {
            response = await this.fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, pin })
            });
        } catch (error: any) {
            const isTimeout = error?.name === 'AbortError';
            throw new Error(
                isTimeout
                    ? `Tempo de conexão excedido. Verifique a API: ${API_BASE_URL}`
                    : `Falha de rede. Verifique a API: ${API_BASE_URL}`
            );
        }

        if (!response.ok) {
            throw new Error(await this.parseError(response));
        }

        const data = await response.json();
        await this.setAuthState(data.token, data.user);

        return {
            token: data.token,
            user: data.user,
            isAuthenticated: true
        };
    }

    /**
     * Logout and clear storage
     */
    async logout(): Promise<void> {
        this.token = null;
        this.user = null;
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    }

    /**
     * Validate current token
     */
    async validateToken(): Promise<boolean> {
        if (!this.token) return false;

        try {
            const response = await this.fetchWithTimeout(`${API_BASE_URL}/auth/validate`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * Get current token
     */
    getToken(): string | null {
        return this.token;
    }

    /**
     * Get current user
     */
    getUser(): AuthUser | null {
        return this.user;
    }

    /**
     * Get auth header for API calls
     */
    getAuthHeader(): { Authorization: string } | {} {
        return this.token ? { Authorization: `Bearer ${this.token}` } : {};
    }

    /**
     * Store auth state
     */
    private async setAuthState(token: string, user: AuthUser): Promise<void> {
        this.token = token;
        this.user = user;
        await AsyncStorage.setItem(TOKEN_KEY, token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    }
}

export const authService = new AuthService();
