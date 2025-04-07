import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

const DeleteMusicModal = ({ visible, onClose, onDelete, music }) => {
    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            style={styles.modal}
            backdropOpacity={0.6}
        >
            <View style={styles.content}>
                <Ionicons name="trash-bin" size={40} color="#FF3B30" />
                <Text style={styles.title}>Remover música da playlist?</Text>

                <View style={styles.musicInfo}>
                    {music.thumbnail ?
                        <Image source={{ uri: music.thumbnail }} style={styles.thumbnail} />
                        :
                        <Image source={require('../../assets/musica.png')} style={styles.thumbnail} />
                    }
                    <Text style={styles.musicTitle} numberOfLines={2}>{music.title} - {music.artist}</Text>
                </View>

                <View style={styles.buttons}>
                    <Pressable style={styles.deleteButton} onPress={onDelete}>
                        <Text style={styles.deleteText}>Remover</Text>
                    </Pressable>
                    <Pressable style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    content: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        color: '#FFF',
        fontWeight: '600',
        marginVertical: 10,
        textAlign: 'center',
    },
    musicInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 10,
        backgroundColor: '#AAA',
    },
    musicTitle: {
        color: '#CCC',
        fontSize: 16,
        flex: 1,
    },
    buttons: {
        marginTop: 20,
        width: '100%',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
    },
    deleteText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        borderColor: '#555',
        borderWidth: 1,
    },
    cancelText: {
        color: '#FFF',
        fontSize: 16,
    },
});

export default DeleteMusicModal;
