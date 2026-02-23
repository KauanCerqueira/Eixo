import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import { useApp } from './src/context/AppContext';
import { AuthSessionContext } from './src/context/AuthSessionContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ToastContainer } from './src/components/ui/ToastContainer';
import { LoginScreen } from './src/screens/LoginScreen';
import { authService, AuthUser } from './src/services/auth';
import { pushNotificationsService } from './src/services/pushNotifications';

const AuthenticatedApp = () => {
  const { setCurrentUserById, refreshUsers, isLoading: contextLoading } = useApp();
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const auth = await authService.initialize();
        if (auth.isAuthenticated && auth.user) {
          await refreshUsers(auth.user.id);
          await pushNotificationsService.registerForUser(auth.user.id);
          setIsLoggedIn(true);
        }
      } finally {
        setIsAuthReady(true);
      }
    };
    init();
  }, [refreshUsers, setCurrentUserById]);

  const handleLogin = async (user: AuthUser) => {
    await refreshUsers(user.id);
    await pushNotificationsService.registerForUser(user.id);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    const currentUser = authService.getUser();
    await pushNotificationsService.unregisterForUser(currentUser?.id);
    await authService.logout();
    setIsLoggedIn(false);
  };

  if (!isAuthReady || contextLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <AuthSessionContext.Provider value={{ logout: handleLogout }}>
      <AppNavigator />
      <ToastContainer />
    </AuthSessionContext.Provider>
  );
};

export default function App() {
  return (
    <AppProvider>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <AuthenticatedApp />
      </View>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
});
