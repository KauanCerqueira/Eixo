import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { X, Palette, Music, Hammer, Gamepad2, Layers } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

interface AddHobbyModalProps {
    visible: boolean;
    onClose: () => void;
}

const CATEGORIES = [
    { id: 'diy', label: 'DIY / Maker', icon: <Hammer size={20} color="#3B82F6" />, color: '#3B82F6' },
    { id: 'cursos', label: 'Cursos / Estudo', icon: <Layers size={20} color="#10B981" />, color: '#10B981' },
    { id: 'games', label: 'Games', icon: <Gamepad2 size={20} color="#8B5CF6" />, color: '#8B5CF6' },
    { id: 'musica', label: 'Música', icon: <Music size={20} color="#F59E0B" />, color: '#F59E0B' },
    { id: 'artes', label: 'Artes', icon: <Palette size={20} color="#EC4899" />, color: '#EC4899' },
];

export const AddHobbyModal = ({ visible, onClose }: AddHobbyModalProps) => {
    const { addHobby } = useApp();

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('diy');
    const [note, setNote] = useState('');

    const handleSave = () => {
        if (!title.trim()) return;

        addHobby({
            title: title.trim(),
            category: category as any,
            progress: 0,
            notes: note.trim() ? [note.trim()] : []
        });

        setTitle('');
        setCategory('diy');
        setNote('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Novo Hobby / Projeto</Text>
                        <TouchableOpacity onPress={onClose}><X size={24} color="#0f172a" /></TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                        <Text style={styles.label}>Título do Projeto</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Ex: Aprender Guitarra, Horta Vertical"
                            placeholderTextColor="#94a3b8"
                        />

                        <Text style={styles.label}>Categoria</Text>
                        <View style={styles.categoriesGrid}>
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.catBtn, category === cat.id && { borderColor: cat.color, backgroundColor: cat.color + '10' }]}
                                    onPress={() => setCategory(cat.id)}
                                >
                                    {cat.icon}
                                    <Text style={[styles.catText, category === cat.id && { color: cat.color }]}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Primeira Nota / Meta</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={note}
                            onChangeText={setNote}
                            placeholder="Ex: Comprar sementes e terra..."
                            placeholderTextColor="#94a3b8"
                            multiline
                            numberOfLines={3}
                        />

                    </ScrollView>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveBtnText}>Iniciar Projeto</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    title: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
    content: { padding: 20 },

    label: { fontSize: 13, fontWeight: 'bold', color: '#64748b', marginBottom: 8, marginTop: 4 },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 16, color: '#0f172a', fontWeight: '500', marginBottom: 16 },

    categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    catBtn: { width: '48%', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff', gap: 8 },
    catText: { fontSize: 13, fontWeight: '600', color: '#64748b' },

    textArea: { height: 80, textAlignVertical: 'top' },

    saveBtn: { margin: 20, padding: 16, borderRadius: 16, backgroundColor: '#0f172a', alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
