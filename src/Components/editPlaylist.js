import React, { useState } from "react";
import { Pressable, StyleSheet, View, Text, Image, TextInput, FlatList, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from "@expo/vector-icons";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"; 
import { db, storage } from "../Services/firebaseConfig"; 

import DeleteMusicModal from "../Components/modalDeleteMusic";

const EditPlaylist = ({ route }) => {
    const { playlist } = route.params;
    const navigation = useNavigation();

    const [playlistName, setPlaylistName] = useState(playlist.name);
    const [songs, setSongs] = useState(playlist.songs);
    const [newThumbnail, setNewThumbnail] = useState(playlist.thumbnail);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setDataModal] = useState({});

    const pickImage = async (setImage, path) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const uploadedUrl = await uploadImageAsync(result.assets[0].uri, path);
            setImage(uploadedUrl);
        }
    };

    const uploadImageAsync = async (uri, path) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
    };

    const handleSave = async () => {
        try {
            const playlistRef = doc(db, 'playlists', playlist.id);

            await updateDoc(playlistRef, {
                name: playlistName,
                thumbnail: newThumbnail,
            });

            Alert.alert('Sucesso', 'Playlist atualizada!');
            navigation.goBack();
        } catch (error) {
            console.error('Erro ao atualizar playlist:', error);
            Alert.alert('Erro', 'Não foi possível atualizar a playlist.');
        }
    };

    const handleDelete = async (idPlaylist, idMusic) => {
        try {
            const playlistRef = doc(db, "playlists", idPlaylist);
            const playlistSnap = await getDoc(playlistRef);

            if (playlistSnap.exists()) {
                const data = playlistSnap.data();
                const updatedSongs = data.songs.filter((song) => song.id !== idMusic);

                await updateDoc(playlistRef, {
                    songs: updatedSongs,
                });

                setSongs(updatedSongs);
                Alert.alert("Música removida com sucesso!");
            } else {
                Alert.alert("Playlist não encontrada");
            }
        } catch (error) {
            console.error("Erro ao remover música:", error);
        }
        setModalVisible(false);
    };

    const renderItem = ({ item }) => (
        <View>
            <View style={styles.itemPlaylist}>
                {item.thumbnail ? (
                    <Image source={{ uri: item.thumbnail }} style={styles.songThumbnail} />
                ) : (
                    <Image source={require("../../assets/musica.png")} style={styles.songThumbnail} />
                )}

                <View style={{ width: "70%" }}>
                    <Text numberOfLines={1} style={styles.songTitle}>
                        {item.title}
                    </Text>
                    <Text style={styles.songAuthor}>{item.author}</Text>
                </View>

                <Pressable
                    style={styles.removeBtn}
                    onPress={() => {
                        setModalVisible(true);
                        setDataModal({
                            title: item.title,
                            author: item.author,
                            thumbnail: item.thumbnail,
                            idMusic: item.id,
                        });
                    }}
                >
                    <Ionicons name="trash-outline" color="#FF0000" size={24} />
                </Pressable>
            </View>
            <View style={styles.lineItems} />
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={songs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListHeaderComponent={
                    <View>
                        <View style={styles.header}>
                            <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
                                <Ionicons style={{ marginLeft: -3 }} name="chevron-back" color="#FFF" size={30} />
                            </Pressable>

                            <Pressable style={styles.backBtn} onPress={handleSave}>
                                <Ionicons name="document-outline" color="#FFF" size={30} />
                            </Pressable>
                        </View>

                        <View style={{ justifyContent: "center", alignItems: "center" }}>
                            <Pressable onPress={() => pickImage(setNewThumbnail, `playlists/${playlist.id}.jpg`)}>
                                <Ionicons style={styles.editImage} name="create-outline" color="#FFF" size={60} />
                                <Image source={{ uri: newThumbnail }} style={styles.thumbnailPlaylist} />
                            </Pressable>

                            <TextInput
                                style={styles.input}
                                numberOfLines={2}
                                multiline
                                onChangeText={setPlaylistName}
                                value={playlistName}
                                placeholder="Nome da playlist"
                                placeholderTextColor="#AAA"
                                textAlign="center"
                            />
                        </View>
                    </View>
                }
                ListFooterComponent={
                    <DeleteMusicModal
                        visible={modalVisible}
                        onClose={() => setModalVisible(false)}
                        onDelete={() => handleDelete(playlist.id, modalData.idMusic)}
                        music={{
                            title: modalData.title,
                            artist: modalData.author,
                            thumbnail: modalData.thumbnail,
                        }}
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    backBtn: {
        width: 45,
        height: 45,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#212121",
        borderRadius: 999,
    },
    header: {
        backgroundColor: "#313131",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 5,
    },
    editImage: {
        position: "absolute",
        top: "57%",
        left: "35%",
        transform: [{ translateX: -60 }, { translateY: -30 }],
        zIndex: 999,
    },
    thumbnailPlaylist: {
        width: 200,
        height: 200,
        borderRadius: 15,
        marginTop: 50,
    },
    input: {
        marginTop: 20,
        marginBottom: 20,
        color: "#FFF",
        fontSize: 20,
        width: "80%",
        paddingVertical: 10,
        textAlign: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#444",
    },
    itemPlaylist: {
        flexDirection: "row",
        marginTop: 10,
        alignItems: "center",
        paddingHorizontal: 15,
    },
    songThumbnail: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: "#AAA",
        marginRight: 10,
    },
    songTitle: {
        color: "#fff",
        fontWeight: "bold",
    },
    songAuthor: {
        color: "#aaa",
        fontSize: 12,
    },
    removeBtn: {
        marginLeft: "auto",
    },
    lineItems: {
        borderBottomWidth: 1,
        borderColor: "#444",
        marginVertical: 10,
        marginHorizontal: 15,
    },
});

export default EditPlaylist;
