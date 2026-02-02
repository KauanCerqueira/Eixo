import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.0.2.2:5000/api';
const TOKEN_KEY = '@eixo_token';
const USER_KEY = '@eixo_user';

export interface AuthUser {
    id: number;
    name: string;
    initials: string;
    color: string;
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

    /**
     * Initialize auth state from storage
     */
    async initialize(): Promise<AuthState> {
        try {
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
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, pin })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
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
     * Quick login by user ID (no PIN required)
     */
    async quickLogin(userId: number): Promise<AuthState> {
        const response = await fetch(`${API_BASE_URL}/auth/quick-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Quick login failed');
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
            const response = await fetch(`${API_BASE_URL}/auth/validate`, {
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
