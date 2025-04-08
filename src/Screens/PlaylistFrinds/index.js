import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, Pressable, TextInput, Alert, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import uuid from 'react-native-uuid';
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, addDoc, onSnapshot, doc, deleteDoc } from "firebase/firestore";

import { Auth, db, storage } from "../../Services/firebaseConfig";
import { styles } from './styles';

export default function PlaylistsScreen({ friendId, friendUsername }) {
    const navigation = useNavigation();
    const currentUser = Auth.currentUser;

    const [playlists, setPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [popupVisible, setPopupVisible] = useState(false);

    useEffect(() => {
        if (!friendId || !currentUser) return;

        const unsubscribe = onSnapshot(collection(db, "playlists"), (snapshot) => {
            const playlistsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const filteredPlaylists = playlistsList.filter(playlist =>
                playlist.members?.includes(currentUser?.uid) && playlist.members?.includes(friendId)
            );
            setPlaylists(filteredPlaylists);
        });

        return () => unsubscribe();
    }, [friendId, currentUser]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const createPlaylist = async () => {
        if (newPlaylistName.trim() === "") {
            Alert.alert("Erro", "Digite um nome para a playlist!");
            return;
        }

        let imageUrl = null;
        if (selectedImage) {
            try {
                const response = await fetch(selectedImage);
                const blob = await response.blob();
                const imageRef = ref(storage, `playlists/${uuid.v4()}.jpg`);
                await uploadBytes(imageRef, blob);
                imageUrl = await getDownloadURL(imageRef);
            } catch (error) {
                Alert.alert("Erro", "Falha ao enviar a imagem.");
                return;
            }
        }

        await addDoc(collection(db, "playlists"), {
            name: newPlaylistName,
            thumbnail: imageUrl,
            songs: [],
            members: [currentUser.uid, friendId]
        });

        setNewPlaylistName("");
        setSelectedImage(null);
    };

    const extractStoragePath = (url) => {
        const decodedUrl = decodeURIComponent(url);
        const match = decodedUrl.match(/\/o\/(.+)\?alt=media/);
        return match ? match[1] : null;
    };
    
    const handleDeletePlaylist = async (playlist) => {
        Alert.alert(
            "Confirmar exclusão",
            `Tem certeza que deseja excluir a playlist "${playlist.name}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sim",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Deletar thumbnail da playlist
                            if (playlist.thumbnail) {
                                const path = extractStoragePath(playlist.thumbnail);
                                if (path) {
                                    const thumbRef = ref(storage, path);
                                    await deleteObject(thumbRef).catch(() => null);
                                }
                            }
    
                            // Excluir o documento da playlist
                            await deleteDoc(doc(db, 'playlists', playlist.id));
    
                            // Mostrar popup
                            setPopupVisible(true);
                            setTimeout(() => setPopupVisible(false), 3000);
                        } catch (err) {
                            Alert.alert("Erro", "Erro ao excluir a playlist.");
                        }
                    },
                },
            ]
        );
    };
    

    const renderPlaylistItem = ({ item }) => (
        <View style={{ paddingHorizontal: 10}}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <Image
                    source={item.thumbnail ? { uri: item.thumbnail } : require('../../../assets/musica.png')}
                    style={{ width: 50, height: 50, borderRadius: 8, marginRight: 10, backgroundColor: '#AAA' }}
                />
                <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={{ fontSize: 16, color: '#FFF' }}>{item.name}</Text>
                </View>
                <Pressable onPress={() => handleDeletePlaylist(item)}>
                    <Ionicons name="trash" size={24} color="red" />
                </Pressable>
            </View>
            <View style={styles.line} />
        </View>
    );

    const renderPlaylist = ({ item }) => (
        <Pressable
            style={styles.playlistContainer}
            onPress={() => {
                navigation.navigate("PlaylistSettings", { playlist: item, friendName: friendUsername, friendId: friendId });
            }}
        >
            <Text style={styles.numSongs}>{item.songs.length}</Text>
            {item.thumbnail === null ?
                <Image source={require('../../../assets/musica.png')} style={[styles.playlistImage, { backgroundColor: '#D1D1D1' }]} />
                :
                <Image source={{ uri: item.thumbnail }} style={styles.playlistImage} />
            }
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Text numberOfLines={1} style={styles.playlistName}>{item.name}</Text>
                {item.songs && item.songs.length > 0 && (
                    item.songs.slice(-2).map((song, index) => (
                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons style={{ marginLeft: 5 }} name="musical-notes" color="#AAA" size={12} />
                            <Text style={styles.titleSongPreview} numberOfLines={1}>{song.title}</Text>
                        </View>
                    ))
                )}
            </View>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={[styles.headerIcon, styles.btnBack]}>
                    <Ionicons name="chevron-back" size={34} color="#FFF" style={{ marginLeft: -3 }} />
                </Pressable>
                <View style={styles.headerFriendInfo}>
                    <Text numberOfLines={1} style={styles.friendUsername}>Playlists com {friendUsername}</Text>
                </View>
                <Pressable onPress={() => setModalVisible(true)}>
                    <Ionicons name="ellipsis-horizontal" size={34} color="#FFF" style={styles.headerIcon} />
                </Pressable>
            </View>

            <FlatList
                style={styles.flatList}
                data={playlists}
                keyExtractor={(item) => item.id}
                renderItem={renderPlaylist}
            />

            <View style={styles.footer}>
                <Pressable onPress={pickImage} style={styles.imagePicker}>
                    {selectedImage ?
                        <Image source={{ uri: selectedImage }} style={{ width: 40, height: 40 }} />
                        :
                        <Ionicons name="image" size={24} color="white" />
                    }
                </Pressable>

                <TextInput
                    style={styles.input}
                    placeholder="Nova Playlist"
                    placeholderTextColor="#999"
                    value={newPlaylistName}
                    onChangeText={setNewPlaylistName}
                />

                <Pressable style={styles.addButton} onPress={createPlaylist}>
                    <Ionicons name="add" size={24} color="white" />
                </Pressable>
            </View>

            {/* Modal Slide */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent
            >
                <View style={{ flex: 1, justifyContent: 'flex-end', margin: 0 }}>
                    <View style={{
                        backgroundColor: '#212121',
                        padding: 10,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        height: 500,
                        position: 'relative'
                    }}>
                        {/* Botão de fechar */}
                        <Pressable
                            onPress={() => setModalVisible(false)}
                            style={{
                                position: 'absolute',
                                top: 10,
                                right: 16,
                                zIndex: 999
                            }}
                        >
                            <Ionicons name="close" size={30} color="#FFF" />
                        </Pressable>

                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginLeft: 20, paddingRight: 36, color: '#FFF' }}>
                            Playlists com {friendUsername}
                        </Text>

                        <FlatList
                            data={playlists}
                            keyExtractor={(item) => item.id}
                            renderItem={renderPlaylistItem}
                        />
                    </View>
                </View>

                {/* Popup de sucesso */}
                {popupVisible && (
                    <View style={{
                        position: 'absolute',
                        bottom: 20,
                        left: 20,
                        right: 20,
                        backgroundColor: '#222',
                        padding: 12,
                        borderRadius: 10,
                        alignItems: 'center'
                    }}>
                        <Text style={{ color: '#FFF' }}>Playlist excluída com sucesso!</Text>
                    </View>
                )}
            </Modal>

        </View>
    );
}
