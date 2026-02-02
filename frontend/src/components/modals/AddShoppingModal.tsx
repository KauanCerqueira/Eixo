import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

interface AddShoppingModalProps {
    visible: boolean;
    onClose: () => void;
}

export const AddShoppingModal = ({ visible, onClose }: AddShoppingModalProps) => {
    const { currentUser, addShoppingItem } = useApp();

    if (!currentUser) return null;

    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');

    const handleSave = () => {
        if (!name.trim()) return;
        addShoppingItem({
            name: name.trim(),
            addedByUserId: currentUser.id,
            quantity: quantity.trim() || '1 un'
        });
        setName('');
        setQuantity('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Adicionar Item</Text>
                        <TouchableOpacity onPress={onClose}><X size={24} color="#000" /></TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.label}>Item</Text>
                        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ex: Leite" placeholderTextColor="#94a3b8" />

                        <Text style={styles.label}>Quantidade</Text>
                        <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} placeholder="Ex: 2L" placeholderTextColor="#94a3b8" />
                    </View>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveBtnText}>Adicionar à Lista</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    title: { fontSize: 20, fontWeight: '900' },
    content: { padding: 20 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 8, marginTop: 12 },
    input: { borderWidth: 2, borderColor: '#000', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#f8fafc' },
    saveBtn: { backgroundColor: '#22C55E', margin: 20, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#000' },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
