import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface ProgressChartProps {
    title: string;
    data: number[];
    labels: string[];
    color?: string;
}

export const ProgressChart = ({ title, data, labels, color = '#8B5CF6' }: ProgressChartProps) => {
    const chartData = {
        labels,
        datasets: [{ data, strokeWidth: 3 }],
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <LineChart
                data={chartData}
                width={Dimensions.get('window').width - 64}
                height={160}
                chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    color: () => color,
                    labelColor: () => '#64748b',
                    propsForDots: {
                        r: '4',
                        strokeWidth: '2',
                        stroke: color,
                    },
                }}
                bezier
                style={styles.chart}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginVertical: 8 },
    title: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 12 },
    chart: { borderRadius: 12 },
});
