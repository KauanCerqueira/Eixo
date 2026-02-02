import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { Utensils, Droplets, Flame } from 'lucide-react-native';
import { Card } from '../components/ui/Card';
import { FAB } from '../components/ui/FAB';
import { ProgressBar } from '../components/ui/ProgressBar';
import { AddMealModal } from '../components/modals/AddMealModal';

const DietScreen = () => {
    const { meals, userSettings } = useApp();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [waterIntake, setWaterIntake] = useState(0);

    const todayMeals = meals.filter(m => new Date(m.date).toDateString() === new Date().toDateString());
    const totalCalories = todayMeals.reduce((acc, m) => acc + (m.calories || 0), 0);
    const calorieProgress = Math.min(100, (totalCalories / userSettings.dailyCalorieGoal) * 100);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <Text style={styles.title}>Minha Dieta</Text>
                    <Text style={styles.subtitle}>Nutrição e hidratação diária.</Text>
                </View>

                {/* Calorie Goal */}
                <Card style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <View>
                            <Text style={styles.summaryTitle}>Calorias Hoje</Text>
                            <Text style={styles.summaryValue}>{totalCalories} / {userSettings.dailyCalorieGoal} kcal</Text>
                        </View>
                        <Flame size={24} color="#EF4444" />
                    </View>
                    <ProgressBar progress={calorieProgress} color={calorieProgress > 100 ? '#EF4444' : '#10B981'} />
                </Card>

                {/* Water Tracker (Mini Widget) */}
                <Card style={styles.waterCard}>
                    <View style={styles.waterHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Droplets size={20} color="#3B82F6" />
                            <Text style={styles.waterTitle}>Água</Text>
                        </View>
                        <Text style={styles.waterValue}>{waterIntake} ml</Text>
                    </View>
                    <View style={styles.waterControls}>
                        <TouchableOpacity onPress={() => setWaterIntake(Math.max(0, waterIntake - 250))} style={styles.waterBtn}>
                            <Text style={styles.waterBtnText}>-250</Text>
                        </TouchableOpacity>
                        <ProgressBar progress={(waterIntake / userSettings.dailyWaterGoal) * 100} style={{ flex: 1, marginHorizontal: 12 }} color="#3B82F6" />
                        <TouchableOpacity onPress={() => setWaterIntake(waterIntake + 250)} style={styles.waterBtn}>
                            <Text style={styles.waterBtnText}>+250</Text>
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* Meals List */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>REFEIÇÕES DE HOJE</Text>
                </View>

                {todayMeals.length > 0 ? (
                    todayMeals.map(meal => (
                        <Card key={meal.id} style={styles.mealCard}>
                            <View style={styles.mealLeft}>
                                <View style={styles.mealIcon}>
                                    <Utensils size={18} color="#fff" />
                                </View>
                                <View>
                                    <Text style={styles.mealName}>{meal.items?.[0] || 'Refeição'}</Text>
                                    <View style={styles.mealMeta}>
                                        <Text style={styles.mealType}>{meal.type === 'breakfast' ? 'Café' : meal.type === 'lunch' ? 'Almoço' : meal.type === 'dinner' ? 'Jantar' : 'Lanche'}</Text>
                                        {meal.protein && <Text style={styles.mealMacros}> • {meal.protein}g prot</Text>}
                                    </View>
                                </View>
                            </View>
                            <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
                        </Card>
                    ))
                ) : (
                    <Card style={styles.emptyCard}>
                        <Text style={styles.emptyText}>Nenhuma refeição registrada hoje.</Text>
                    </Card>
                )}

            </ScrollView>

            <FAB onPress={() => setIsModalVisible(true)} />

            <AddMealModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
    header: { marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b' },

    summaryCard: { padding: 20, backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1, marginBottom: 16 },
    summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    summaryTitle: { fontSize: 12, fontWeight: 'bold', color: '#EF4444', textTransform: 'uppercase' },
    summaryValue: { fontSize: 24, fontWeight: '900', color: '#B91C1C', marginTop: 4 },

    waterCard: { padding: 16, marginBottom: 32 },
    waterHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    waterTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
    waterValue: { fontSize: 16, fontWeight: '900', color: '#3B82F6' },
    waterControls: { flexDirection: 'row', alignItems: 'center' },
    waterBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#EFF6FF', borderRadius: 8 },
    waterBtnText: { color: '#3B82F6', fontWeight: 'bold', fontSize: 12 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 13, fontWeight: '900', color: '#64748b', letterSpacing: 0.5 },

    mealCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginBottom: 12 },
    mealLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    mealIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center' },
    mealName: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
    mealMeta: { flexDirection: 'row', alignItems: 'center' },
    mealType: { fontSize: 12, color: '#64748b', textTransform: 'capitalize' },
    mealMacros: { fontSize: 12, color: '#64748b', fontWeight: 'bold' },
    mealCalories: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },

    emptyCard: { padding: 32, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#94a3b8', fontStyle: 'italic' },
});

export default DietScreen;
