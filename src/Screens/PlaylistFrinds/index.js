import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, Pressable, TextInput, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import uuid from 'react-native-uuid';
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, onSnapshot } from "firebase/firestore";

import { Auth, db, storage } from "../../Services/firebaseConfig";
import { styles } from './styles';

export default function PlaylistsScreen({ friendId, friendUsername, photo }) {
    const navigation = useNavigation();

    const currentUser = Auth.currentUser;
    const [playlists, setPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);

    // Acompanhamento em tempo real
    useEffect(() => {
        if (!friendId || !currentUser) {
            console.log("Erro: friendId ou currentUser não está definido");
            return;
        }

        const unsubscribe = onSnapshot(collection(db, "playlists"), (snapshot) => {
            const playlistsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const filteredPlaylists = playlistsList.filter(playlist =>
                playlist.members?.includes(currentUser?.uid) && playlist.members?.includes(friendId)
            );
            setPlaylists(filteredPlaylists);
        });

        return () => unsubscribe();
    }, [friendId, currentUser]);

    // Função para escolher uma imagem da galeria
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

    // Criar nova playlist no Firestore
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
                console.error("Erro ao fazer upload da imagem:", error);
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

    // Renderizar cada item da lista de playlists
    const renderPlaylist = ({ item }) => (
        <Pressable
            style={styles.playlistContainer}
            onPress={() => {
                navigation.navigate("PlaylistSettings", {playlist: item});
            }}
        >
            <Text style={styles.numSongs}>{item.songs.length}</Text>

            {item.thumbnail === null ?
                <Image
                    source={require('../../../assets/musica.png')}
                    style={[styles.playlistImage, { backgroundColor: '#D1D1D1' }]}
                />
                :
                <Image
                    source={{ uri: item.thumbnail }}
                    style={styles.playlistImage}
                    />
                }

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Text numberOfLines={1} style={styles.playlistName}>{item.name}</Text>

                {item.songs && item.songs.length > 0 && (
                    item.songs.slice(-2).map((song, index) => (
                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>

                            {/* Icone pra mostrar a quantidade de musicas que tem na playlist */}
                            <Ionicons style={{ marginLeft: 5 }} name="musical-notes" color="#AAA" size={12} />
                            <Text style={styles.titleSongPreview} numberOfLines={1}>
                                {song.title}
                            </Text>
                        </View>
                    ))
                )}
            </View>

        </Pressable>
    );

    return (
        <View style={styles.container}>
            {/* Cabeçalho da Playlist */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={[styles.headerIcon, styles.btnBack]}>
                    <Ionicons name="chevron-back" size={34} color="#FFF" style={{ marginLeft: -3 }} />
                </Pressable>
                <View style={styles.headerFriendInfo}>
                    <Text numberOfLines={1} style={styles.friendUsername}>Playlists com {friendUsername}</Text>
                </View>
                <Ionicons name="ellipsis-horizontal" size={34} color="#FFF" style={styles.headerIcon} />
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
        </View>
    );
}
