import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { THEME } from '../../theme';

export const ShoppingWidget = () => {
    // @ts-ignore
    const { shoppingLists } = useApp();
    // In a real app we'd aggregate, but for now let's just grab items from the first list or dummy data
    // Assuming context has shoppingLists. If not, we might need to adjust.
    // Based on previous read, it used `shopping` from context. Let's revert to `shopping` if that was correct.
    // Actually the read file showed: `const { shopping, toggleShoppingItem } = useApp();`
    // I will stick to that.
    const { shopping, toggleShoppingItem } = useApp();
    
    const missingItems = shopping ? shopping.filter((item: any) => !item.isBought) : [];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>LISTA DE COMPRAS 🛒</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{missingItems.length} ITENS</Text>
                </View>
            </View>

            <Card style={styles.card}>
                {missingItems.length > 0 ? (
                    <View>
                        {missingItems.slice(0, 4).map((item: any) => (
                            <TouchableOpacity 
                                key={item.id} 
                                // @ts-ignore
                                onPress={() => toggleShoppingItem(item.id)} 
                                style={styles.itemRow}
                            >
                                <View style={[styles.checkCircle, item.isBought && styles.checkedCircle]}>
                                    {item.isBought && <Check size={14} color="#FFF" strokeWidth={4} />}
                                </View>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemQty}>{item.quantity}</Text>
                            </TouchableOpacity>
                        ))}
                         {missingItems.length > 4 && (
                            <View style={styles.moreContainer}>
                                <Text style={styles.moreText}>+ {missingItems.length - 4} OUTROS ITENS</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.empty}>
                        <Check size={32} color={THEME.colors.success} strokeWidth={4} />
                        <Text style={styles.emptyText}>GENIAL! TUDO COMPRADO.</Text>
                    </View>
                )}
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 24 },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 12, 
        paddingHorizontal: 4 
    },
    title: { 
        fontSize: 14, 
        fontWeight: '900', 
        color: THEME.colors.text, 
        letterSpacing: 0.5 
    },
    countBadge: { 
        backgroundColor: THEME.colors.text, 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 8,
        borderWidth: 2,
        borderColor: THEME.colors.text
    },
    countText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '900'
    },

    card: { 
        padding: 0, 
        overflow: 'hidden',
        backgroundColor: '#FFF'
    },
    itemRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 16, 
        borderBottomWidth: 2, 
        borderBottomColor: '#F1F5F9' 
    },
    checkCircle: { 
        width: 24, 
        height: 24, 
        borderRadius: 12, 
        borderWidth: 3, 
        borderColor: THEME.colors.textSecondary, 
        marginRight: 12, 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#FFF'
    },
    checkedCircle: {
        backgroundColor: THEME.colors.success,
        borderColor: THEME.colors.text,
    },
    itemName: { 
        flex: 1, 
        fontSize: 16, 
        fontWeight: '700', 
        color: THEME.colors.text 
    },
    itemQty: { 
        fontSize: 14, 
        fontWeight: '900', 
        color: THEME.colors.textSecondary 
    },

    empty: { 
        alignItems: 'center', 
        padding: 32, 
        gap: 12 
    },
    emptyText: { 
        color: THEME.colors.success, 
        fontWeight: '900',
        fontSize: 16
    },

    moreContainer: {
        padding: 12,
        backgroundColor: THEME.colors.primaryLight,
        borderTopWidth: 2,
        borderTopColor: THEME.colors.text
    },
    moreText: { 
        textAlign: 'center', 
        fontSize: 12, 
        color: THEME.colors.text, 
        fontWeight: '900' 
    }
});
