import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { UserPoints } from '../../types/types';

interface PointsChartProps {
    data: UserPoints[];
}

export const PointsChart = ({ data }: PointsChartProps) => {
    const chartData = {
        labels: data.map(d => d.user.name.slice(0, 4)),
        datasets: [{ data: data.map(d => d.points) }],
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pontos por Membro</Text>
            <BarChart
                data={chartData}
                width={Dimensions.get('window').width - 64}
                height={180}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                    labelColor: () => '#64748b',
                    style: { borderRadius: 12 },
                    barPercentage: 0.7,
                }}
                style={styles.chart}
                showValuesOnTopOfBars
                fromZero
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginVertical: 8 },
    title: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 12 },
    chart: { borderRadius: 12 },
});
