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
import { THEME } from '../theme';

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

// We need to pass navigation props if Header needs them, or just rely on context
// Since Header is static in this wrapper, let's keep it simply
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
                tabBarActiveTintColor: THEME.colors.text,
                tabBarInactiveTintColor: THEME.colors.textSecondary,
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabLabel,
                tabBarShowLabel: true,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeWithHeader}
                options={{ 
                    tabBarIcon: ({ color, size, focused }) => <Home color={color} size={size} strokeWidth={focused ? 3 : 2} />, 
                    tabBarLabel: 'INÍCIO' 
                }}
            />

            {contextMode === 'nos' ? (
                /* ========== NÓS MENU ========== */
                <>
                    <Tab.Screen
                        name="Tasks"
                        component={TasksWithHeader}
                        options={{ 
                            tabBarIcon: ({ color, size, focused }) => <ClipboardList color={color} size={size} strokeWidth={focused ? 3 : 2} />, 
                            tabBarLabel: 'TAREFAS' 
                        }}
                    />
                    <Tab.Screen
                        name="Agenda"
                        component={AgendaWithHeader}
                        options={{ 
                            tabBarIcon: ({ color, size, focused }) => <Calendar color={color} size={size} strokeWidth={focused ? 3 : 2} />, 
                            tabBarLabel: 'AGENDA' 
                        }}
                    />
                    <Tab.Screen
                        name="Finance"
                        component={FamilyFinanceWithHeader}
                        options={{ 
                            tabBarIcon: ({ color, size, focused }) => <Landmark color={color} size={size} strokeWidth={focused ? 3 : 2} />, 
                            tabBarLabel: 'FINANÇAS' 
                        }}
                    />
                    <Tab.Screen
                        name="Shopping"
                        component={ShoppingWithHeader}
                        options={{ 
                            tabBarIcon: ({ color, size, focused }) => <ShoppingCart color={color} size={size} strokeWidth={focused ? 3 : 2} />, 
                            tabBarLabel: 'COMPRAS' 
                        }}
                    />
                    <Tab.Screen
                        name="Goals"
                        component={GoalsWithHeader}
                        options={{ 
                            tabBarIcon: ({ color, size, focused }) => <Target color={color} size={size} strokeWidth={focused ? 3 : 2} />, 
                            tabBarLabel: 'METAS' 
                        }}
                    />
                    <Tab.Screen
                        name="Profile"
                        component={ProfileWithHeader}
                        options={{ 
                            tabBarIcon: ({ color, size, focused }) => <User color={color} size={size} strokeWidth={focused ? 3 : 2} />, 
                            tabBarLabel: 'PERFIL' 
                        }}
                    />
                </>
            ) : (
                /* ========== EU MENU ========== */
                <>
                    <Tab.Screen
                        name="PersonalFinance"
                        component={PersonalFinanceWithHeader}
                        options={{ 
                            tabBarIcon: ({ color, size, focused }) => <Banknote color={color} size={size} strokeWidth={focused ? 3 : 2} />, 
                            tabBarLabel: 'FINANÇAS' 
                        }}
                    />
                    <Tab.Screen
                        name="Workout"
                        component={WorkoutWithHeader}
                        options={{ 
                            tabBarIcon: ({ color, size, focused }) => <Dumbbell color={color} size={size} strokeWidth={focused ? 3 : 2} />, 
                            tabBarLabel: 'TREINO' 
                        }}
                    />
                    <Tab.Screen
                        name="Diet"
                        component={DietWithHeader}
                        options={{ 
                            tabBarIcon: ({ color, size, focused }) => <Utensils color={color} size={size} strokeWidth={focused ? 3 : 2} />, 
                            tabBarLabel: 'DIETA' 
                        }}
                    />
                    <Tab.Screen
                        name="Study"
                        component={StudyWithHeader}
                        options={{ 
                            tabBarIcon: ({ color, size, focused }) => <BookOpen color={color} size={size} strokeWidth={focused ? 3 : 2} />, 
                            tabBarLabel: 'ESTUDOS' 
                        }}
                    />
                    <Tab.Screen
                        name="Hobbies"
                        component={HobbiesWithHeader}
                        options={{ 
                            tabBarIcon: ({ color, size, focused }) => <Palette color={color} size={size} strokeWidth={focused ? 3 : 2} />, 
                            tabBarLabel: 'HOBBIES' 
                        }}
                    />
                    {userSettings?.trackCycle && (
                        <Tab.Screen
                            name="Cycle"
                            component={CycleWithHeader}
                            options={{ 
                                tabBarIcon: ({ color, size, focused }) => <Moon color={color} size={size} strokeWidth={focused ? 3 : 2} />, 
                                tabBarLabel: 'CICLO' 
                            }}
                        />
                    )}
                    <Tab.Screen
                        name="Profile"
                        component={ProfileWithHeader}
                        options={{ 
                            tabBarIcon: ({ color, size, focused }) => <User color={color} size={size} strokeWidth={focused ? 3 : 2} />, 
                            tabBarLabel: 'PERFIL' 
                        }}
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
    wrapper: { flex: 1, backgroundColor: THEME.colors.background },
    content: { flex: 1 },
    tabBar: { 
        height: 80, 
        paddingBottom: 20, 
        paddingTop: 8, 
        borderTopWidth: 3, 
        borderTopColor: THEME.colors.text, 
        backgroundColor: THEME.colors.card,
        elevation: 0,
        shadowOpacity: 0
    },
    tabLabel: { 
        fontSize: 10, 
        fontWeight: '800', 
        letterSpacing: 0.5 
    },
});
