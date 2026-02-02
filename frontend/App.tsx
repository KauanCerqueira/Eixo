import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ToastContainer } from './src/components/ui/ToastContainer';

export default function App() {
  return (
    <AppProvider>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <AppNavigator />
        <ToastContainer />
      </View>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
