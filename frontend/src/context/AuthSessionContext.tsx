import { createContext, useContext } from 'react';

type AuthSessionContextValue = {
    logout: () => Promise<void>;
};

export const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(undefined);

export const useAuthSession = () => {
    const context = useContext(AuthSessionContext);
    if (!context) throw new Error('useAuthSession must be used within AuthSessionContext');
    return context;
};

