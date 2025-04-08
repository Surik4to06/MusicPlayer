import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View, Text, Image, TextInput, FlatList, Alert, Modal, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";

import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage, Auth } from "../Services/firebaseConfig";

import DeleteMusicModal from "../Components/modalDeleteMusic";

const EditPlaylist = ({ route }) => {
    const { playlist } = route.params;
    const navigation = useNavigation();

    const [playlistName, setPlaylistName] = useState(playlist.name);
    const [songs, setSongs] = useState(playlist.songs);
    const [newThumbnail, setNewThumbnail] = useState(playlist.thumbnail);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setDataModal] = useState({});
    const [showEmptyPlaylistModal, setShowEmptyPlaylistModal] = useState(false);
    const [musics, setMusics] = useState([]);
    const [selecteds, setSelecteds] = useState([]);

    useEffect(() => {
        fetchAllAudioFiles();
        const playlistRef = doc(db, "playlists", playlist.id);
    
        const unsubscribe = onSnapshot(playlistRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setSongs(data.songs || []);
            }
        });
    
        return () => unsubscribe(); // para remover o listener ao desmontar o componente
    }, [playlist.id]);

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

    // listar musicas do celular
    const fetchAllAudioFiles = async () => {
        try {
            let allAudio = [];
            let hasNextPage = true;
            let after = null;

            while (hasNextPage) {
                const media = await MediaLibrary.getAssetsAsync({
                    mediaType: MediaLibrary.MediaType.audio,
                    first: 100,
                    after: after,
                });

                allAudio = [...allAudio, ...media.assets];
                after = media.endCursor;
                hasNextPage = media.hasNextPage;
            }

            const detailedAudio = await Promise.all(
                allAudio.map(async (item) => {
                    const info = await MediaLibrary.getAssetInfoAsync(item.id);
                    return {
                        ...item,
                        url: info.localUri || info.uri,
                        title: info.filename.replace(/\.[^/.]+$/, ""),
                        author: info.artist || "Desconhecido",
                        thumbnail: info?.album?.artwork || null,
                    };
                })
            );

            setMusics(detailedAudio);
        } catch (error) {
            Alert.alert("Erro ao buscar músicas", error.message);
            console.error("Erro ao buscar músicas:", error);
        }
    };

    const toggleSelect = (item) => {
        if (selecteds.includes(item.id)) {
            setSelecteds(selecteds.filter(id => id !== item.id));
        } else {
            setSelecteds([...selecteds, item.id]);
        }
    };

    const handleAddSongs = async () => {
        try {
            const playlistRef = doc(db, "playlists", playlist.id);
            const playlistSnap = await getDoc(playlistRef);

            if (!playlistSnap.exists()) {
                console.error("Playlist não encontrada!");
                return;
            }

            const currentData = playlistSnap.data();
            const selectedSongs = musics.filter(song => selecteds.includes(song.id));

            const uploadedSongs = [];

            for (const song of selectedSongs) {
                const alreadyExists = currentData.songs?.some((s) => s.id === song.id);
                if (alreadyExists) continue;

                const response = await fetch(song.url);
                const blob = await response.blob();

                const storageRef = ref(storage, `playlistMusics/${song.id}.mp3`);
                await uploadBytes(storageRef, blob);

                const url = await getDownloadURL(storageRef);

                const songToAdd = {
                    id: song.id,
                    title: song.title,
                    author: song.author,
                    thumbnail: song.thumbnail,
                    url: url,
                    addedBy: Auth.currentUser.displayName,
                    addedByUid: Auth.currentUser.uid,
                };

                uploadedSongs.push(songToAdd);
            }

            if (uploadedSongs.length > 0) {
                await updateDoc(playlistRef, {
                    songs: [...(currentData.songs || []), ...uploadedSongs],
                });

                Alert.alert("Músicas adicionadas!", `${uploadedSongs.length} música(s) adicionada(s) à playlist.`);
                setSelecteds([]);
            } else {
                Alert.alert("Nenhuma música nova para adicionar.");
            }
        } catch (error) {
            console.error("Erro ao adicionar músicas:", error);
            Alert.alert("Erro", "Não foi possível adicionar as músicas.");
        }
    };

    // render das musicas a para adicionar
    const renderAddItem = ({ item }) => {
        const selected = selecteds.includes(item.id);

        return (
            <TouchableOpacity style={styles.item} onPress={() => toggleSelect(item)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                    <Ionicons
                        name={selected ? "checkbox-outline" : "square-outline"}
                        size={24}
                        color={selected ? "skyblue" : "#ccc"}
                        style={{ marginRight: 10 }}
                    />
                    <Image
                        source={item.thumbnail ? item.thumbnail : require('../../assets/musica.png')}
                        style={{ width: 50, height: 50, backgroundColor: '#AAA' }}
                    />
                    <View style={{ marginLeft: 5, width: '60%' }}>
                        <Text numberOfLines={2} style={{ color: '#FFF' }}>{item.title}</Text>
                        <Text style={{ color: 'gray' }}>{item.author}</Text>
                    </View>
                </View>
                <View style={{ borderWidth: 1, borderColor: '#AAA', marginTop: 10 }} />
            </TouchableOpacity>
        );
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
                    <View>
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
                        <Pressable
                            onPress={() => setShowEmptyPlaylistModal(true)}
                            style={{
                                backgroundColor: '#1E1E1E',
                                padding: 16,
                                borderRadius: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginHorizontal: 16,
                                marginBottom: 5,
                                borderWidth: 1,
                                borderColor: '#333',
                            }}
                        >
                            <Ionicons name="add-circle-outline" size={24} color="#FFF" style={{ marginRight: 10 }} />
                            <Text style={{ color: '#FFF', fontSize: 16 }}>Adicionar mais músicas</Text>
                        </Pressable>
                    </View>
                }
            />

            <Modal
                visible={showEmptyPlaylistModal}
                transparent
                animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Pressable
                            onPress={() => setShowEmptyPlaylistModal(false)}
                            style={{ position: 'absolute', top: 20, left: 20 }}>
                            <Ionicons name="chevron-back" color="#FFF" size={30} />
                        </Pressable>

                        <Text style={styles.modalText}>Sua playlist está vazia!</Text>

                        <FlatList
                            style={{ width: '100%' }}
                            data={musics}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderAddItem}
                        />

                        <Pressable
                            style={styles.modalButton}
                            onPress={() => {
                                if (selecteds.length === 0) {
                                    Alert.alert("Selecione pelo menos uma música");
                                    return;
                                }
                                setShowEmptyPlaylistModal(false);
                                handleAddSongs();
                            }}>
                            <Text style={styles.modalButtonText}>Adicionar Músicas</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
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
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        flex: 1,
        width: '100%',
        backgroundColor: "#000",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    modalText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: '#FFF',
    },
    modalButton: {
        backgroundColor: "#7CACF8",
        padding: 10,
        borderRadius: 5,
    },
    modalButtonText: {
        color: "#FFF",
        fontSize: 16,
    },
});

export default EditPlaylist;
