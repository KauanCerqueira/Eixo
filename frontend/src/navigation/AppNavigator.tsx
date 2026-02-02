import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
    Home, Calendar, User, ClipboardList, Activity, Layers, Wallet, Landmark, Target, ShoppingCart,
    Dumbbell, Utensils, BookOpen, Moon, Palette, Banknote
} from 'lucide-react-native';
import { Header } from '../components/layout/Header';
import { useApp } from '../context/AppContext';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { AgendaScreen } from '../screens/AgendaScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { FamilyFinanceScreen } from '../screens/FamilyFinanceScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { ShoppingScreen } from '../screens/ShoppingScreen';

// EU Screens
import PersonalFinanceScreen from '../screens/PersonalFinanceScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import DietScreen from '../screens/DietScreen';
import StudyScreen from '../screens/StudyScreen';
import CycleScreen from '../screens/CycleScreen';
import { HobbiesScreen } from '../screens/HobbiesScreen';

const Tab = createBottomTabNavigator();

const ScreenWrapper = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.wrapper}>
        <Header />
        <View style={styles.content}>{children}</View>
    </View>
);

// Common
const HomeWithHeader = () => <ScreenWrapper><HomeScreen /></ScreenWrapper>;
const ProfileWithHeader = () => <ScreenWrapper><ProfileScreen /></ScreenWrapper>;

// NÓS Mode
const TasksWithHeader = () => <ScreenWrapper><TasksScreen /></ScreenWrapper>;
const AgendaWithHeader = () => <ScreenWrapper><AgendaScreen /></ScreenWrapper>;
const FamilyFinanceWithHeader = () => <ScreenWrapper><FamilyFinanceScreen /></ScreenWrapper>;
const GoalsWithHeader = () => <ScreenWrapper><GoalsScreen /></ScreenWrapper>;
const ShoppingWithHeader = () => <ScreenWrapper><ShoppingScreen /></ScreenWrapper>;

// EU Mode
const PersonalFinanceWithHeader = () => <ScreenWrapper><PersonalFinanceScreen /></ScreenWrapper>;
const WorkoutWithHeader = () => <ScreenWrapper><WorkoutScreen /></ScreenWrapper>;
const DietWithHeader = () => <ScreenWrapper><DietScreen /></ScreenWrapper>;
const StudyWithHeader = () => <ScreenWrapper><StudyScreen /></ScreenWrapper>;
const CycleWithHeader = () => <ScreenWrapper><CycleScreen /></ScreenWrapper>;
const HobbiesWithHeader = () => <ScreenWrapper><HobbiesScreen /></ScreenWrapper>;

const NavigatorContent = () => {
    const { contextMode, userSettings } = useApp();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#FACC15',
                tabBarInactiveTintColor: '#94A3B8',
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabLabel,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeWithHeader}
                options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size} strokeWidth={2.5} />, tabBarLabel: 'Início' }}
            />

            {contextMode === 'nos' ? (
                /* ========== NÓS MENU ========== */
                <>
                    <Tab.Screen
                        name="Tasks"
                        component={TasksWithHeader}
                        options={{ tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} strokeWidth={2.5} />, tabBarLabel: 'Tarefas' }}
                    />
                    <Tab.Screen
                        name="Agenda"
                        component={AgendaWithHeader}
                        options={{ tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} strokeWidth={2.5} />, tabBarLabel: 'Agenda' }}
                    />
                    <Tab.Screen
                        name="Finance"
                        component={FamilyFinanceWithHeader}
                        options={{ tabBarIcon: ({ color, size }) => <Landmark color={color} size={size} strokeWidth={2.5} />, tabBarLabel: 'Finanças' }}
                    />
                    <Tab.Screen
                        name="Shopping"
                        component={ShoppingWithHeader}
                        options={{ tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} strokeWidth={2.5} />, tabBarLabel: 'Compras' }}
                    />
                    <Tab.Screen
                        name="Goals"
                        component={GoalsWithHeader}
                        options={{ tabBarIcon: ({ color, size }) => <Target color={color} size={size} strokeWidth={2.5} />, tabBarLabel: 'Metas' }}
                    />
                    <Tab.Screen
                        name="Profile"
                        component={ProfileWithHeader}
                        options={{ tabBarIcon: ({ color, size }) => <User color={color} size={size} strokeWidth={2.5} />, tabBarLabel: 'Perfil' }}
                    />
                </>
            ) : (
                /* ========== EU MENU ========== */
                <>
                    <Tab.Screen
                        name="PersonalFinance"
                        component={PersonalFinanceWithHeader}
                        options={{ tabBarIcon: ({ color, size }) => <Banknote color={color} size={size} strokeWidth={2.5} />, tabBarLabel: 'Finanças' }}
                    />
                    <Tab.Screen
                        name="Workout"
                        component={WorkoutWithHeader}
                        options={{ tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} strokeWidth={2.5} />, tabBarLabel: 'Treino' }}
                    />
                    <Tab.Screen
                        name="Diet"
                        component={DietWithHeader}
                        options={{ tabBarIcon: ({ color, size }) => <Utensils color={color} size={size} strokeWidth={2.5} />, tabBarLabel: 'Dieta' }}
                    />
                    <Tab.Screen
                        name="Study"
                        component={StudyWithHeader}
                        options={{ tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} strokeWidth={2.5} />, tabBarLabel: 'Estudos' }}
                    />
                    <Tab.Screen
                        name="Hobbies"
                        component={HobbiesWithHeader}
                        options={{ tabBarIcon: ({ color, size }) => <Palette color={color} size={size} strokeWidth={2.5} />, tabBarLabel: 'Hobbies' }}
                    />
                    {userSettings?.trackCycle && (
                        <Tab.Screen
                            name="Cycle"
                            component={CycleWithHeader}
                            options={{ tabBarIcon: ({ color, size }) => <Moon color={color} size={size} strokeWidth={2.5} />, tabBarLabel: 'Ciclo' }}
                        />
                    )}
                    <Tab.Screen
                        name="Profile"
                        component={ProfileWithHeader}
                        options={{ tabBarIcon: ({ color, size }) => <User color={color} size={size} strokeWidth={2.5} />, tabBarLabel: 'Perfil' }}
                    />
                </>
            )}

        </Tab.Navigator>
    );
};

export const AppNavigator = () => (
    <NavigationContainer>
        <NavigatorContent />
    </NavigationContainer>
);

const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1 },
    tabBar: { height: 70, paddingBottom: 12, paddingTop: 8, borderTopWidth: 2, borderTopColor: '#000', backgroundColor: '#fff' },
    tabLabel: { fontSize: 10, fontWeight: '600' },
});
