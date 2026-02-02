import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Expense, EXPENSE_CATEGORIES } from '../../types/types';

interface ExpensesChartProps {
    expenses: Expense[];
}

export const ExpensesChart = ({ expenses }: ExpensesChartProps) => {
    // Group by category
    const grouped = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(grouped).map(([category, amount]) => {
        const cat = EXPENSE_CATEGORIES.find(c => c.id === category);
        return {
            name: cat?.label || category,
            amount,
            color: cat?.color || '#64748b',
            legendFontColor: '#64748b',
            legendFontSize: 12,
        };
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Gastos por Categoria</Text>
            <Text style={styles.total}>Total: R$ {total.toFixed(2)}</Text>
            <PieChart
                data={data}
                width={Dimensions.get('window').width - 64}
                height={160}
                chartConfig={{
                    color: () => '#000',
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginVertical: 8 },
    title: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 4 },
    total: { fontSize: 20, fontWeight: '900', marginBottom: 8 },
});
