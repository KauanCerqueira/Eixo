import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { X, CheckCircle, Info, AlertTriangle } from 'lucide-react-native';
import { useApp, ToastNotification } from '../../context/AppContext';

const TOAST_DURATION = 5000;

interface ToastItemProps {
    toast: ToastNotification;
    onDismiss: (id: string) => void;
}

const ToastItem = ({ toast, onDismiss }: ToastItemProps) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-20)).current;

    useEffect(() => {
        // Animate in
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto dismiss
        const timer = setTimeout(() => {
            animateOut();
        }, TOAST_DURATION - 300);

        return () => clearTimeout(timer);
    }, []);

    const animateOut = () => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -20,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onDismiss(toast.id);
        });
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircle size={20} color="#22C55E" />;
            case 'warning':
                return <AlertTriangle size={20} color="#F59E0B" />;
            default:
                return <Info size={20} color="#3B82F6" />;
        }
    };

    const getBorderColor = () => {
        switch (toast.type) {
            case 'success': return '#22C55E';
            case 'warning': return '#F59E0B';
            default: return '#3B82F6';
        }
    };

    return (
        <Animated.View
            style={[
                styles.toast,
                { borderLeftColor: getBorderColor(), opacity, transform: [{ translateY }] }
            ]}
        >
            <View style={styles.iconContainer}>{getIcon()}</View>
            <Text style={styles.message} numberOfLines={2}>{toast.message}</Text>
            <TouchableOpacity onPress={animateOut} style={styles.closeBtn}>
                <X size={16} color="#64748b" />
            </TouchableOpacity>
        </Animated.View>
    );
};

export const ToastContainer = () => {
    const { toasts, dismissToast } = useApp();

    if (toasts.length === 0) return null;

    return (
        <View style={styles.container} pointerEvents="box-none">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 100,
        left: 16,
        right: 16,
        zIndex: 9999,
        elevation: 9999,
        gap: 8,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        paddingRight: 8,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    iconContainer: {
        marginRight: 10,
    },
    message: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: '#0f172a',
        lineHeight: 18,
    },
    closeBtn: {
        padding: 4,
        marginLeft: 8,
    },
});
