import React, { useState, useEffect } from "react";
import { View, Text, Image, Pressable, Modal, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { FlatList } from "react-native-gesture-handler";
import * as MediaLibrary from "expo-media-library";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import { Auth, db } from "../Services/firebaseConfig";

const Player = ({ route }) => {
    const { playlist: initialPlaylist, playlistId } = route.params;
    const navigation = useNavigation();

    const [playlist, setPlaylist] = useState(initialPlaylist);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isChangingTrack, setIsChangingTrack] = useState(false);
    const [musics, setMusics] = useState([]);
    const [selecteds, setSelecteds] = useState([]);
    const [showEmptyPlaylistModal, setShowEmptyPlaylistModal] = useState(false);

    useEffect(() => {
        fetchAllAudioFiles();

        if (!playlist || playlist.length === 0) {
            setShowEmptyPlaylistModal(true);
            return;
        }

    }, []);

    useEffect(() => {
        if (playlist.length > 0 && currentIndex >= 0) {
            playMusic(playlist[currentIndex]?.url);
        }
    }, [currentIndex]);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const playMusic = async (url) => {
        if (!url || isChangingTrack) return;

        setIsChangingTrack(true);

        try {
            if (sound !== null) {
                try {
                    await sound.stopAsync();
                    await sound.unloadAsync();
                } catch (e) {
                    console.warn("Erro ao parar/descarregar som anterior:", e);
                }
                setSound(null);
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: true }
            );

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    nextTrack();
                }
            });

            setSound(newSound);
            setIsPlaying(true);
        } catch (error) {
            console.error("Erro ao tocar música:", error);
        } finally {
            setIsChangingTrack(false);
        }
    };

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
                        title: info.filename.replace(/\.[^/.]+$/, ""), // remove a estenção da musica
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

    const handleAddSongs = async () => {
        if (!playlistId) return;

        try {
            const playlistRef = doc(db, "playlists", playlistId);
            const playlistDoc = await getDoc(playlistRef);

            if (!playlistDoc.exists()) {
                console.error("Playlist não encontrada!");
                return;
            }

            const playlistData = playlistDoc.data();
            const selectedSongs = musics.filter(song => selecteds.includes(song.id));

            const newMusics = selectedSongs.filter(
                (song) => !playlistData.songs.some((s) => s.id === song.id)
            ).map(song => ({
                ...song,
                addedBy: Auth.currentUser.displayName
            }));

            const playlistAtualizada = [...(playlistData.songs || []), ...newMusics];

            await updateDoc(playlistRef, {
                songs: playlistAtualizada
            });

            setPlaylist(playlistAtualizada);

            Alert.alert("Músicas adicionadas!", `${newMusics.length} música(s) adicionada(s) à playlist.`);
        } catch (error) {
            console.error("Erro ao adicionar músicas:", error);
            Alert.alert("Erro", "Não foi possível adicionar as músicas.");
        }
    };

    const toggleSelect = (item) => {
        if (selecteds.includes(item.id)) {
            setSelecteds(selecteds.filter(id => id !== item.id));
        } else {
            setSelecteds([...selecteds, item.id]);
        }
    };

    const togglePlayPause = async () => {
        if (!sound) return;

        if (isPlaying) {
            await sound.pauseAsync();
        } else {
            await sound.playAsync();
        }

        setIsPlaying(!isPlaying);
    };

    const nextTrack = () => {
        if (isChangingTrack) return;

        if (currentIndex < playlist.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(0);
        }
    };

    const prevTrack = () => {
        if (isChangingTrack) return;

        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else {
            setCurrentIndex(playlist.length - 1);
        }
    };

    const renderItem = ({ item }) => {
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
                    {item.thumbnail === null ?
                        <Image source={require('../../assets/musica.png')} style={{ width: 50, height: 50, backgroundColor: '#AAA' }} />
                        :
                        <Image source={item.thumbnail} style={{ width: 50, height: 50, backgroundColor: '#AAA' }} />
                    }
                    <View style={{ marginLeft: 5, width: '60%' }}>
                        <Text numberOfLines={2} style={{ color: '#FFF' }}>{item.title ? item.title.replace(/\.[^/.]+$/, "") : "Sem título"}</Text>
                        <Text style={{ color: 'gray' }}>{item.author}</Text>
                    </View>
                </View>
                <View style={{ borderWidth: 1, borderColor: '#AAA', marginTop: 10 }} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Pressable
                style={styles.backBtn}
                onPress={async () => {
                    navigation.goBack();
                    if (sound) {
                        await sound.stopAsync();
                        await sound.unloadAsync();
                        setSound(null);
                    }
                }}>
                <Ionicons style={{marginLeft: -3}} name='chevron-back' size={40} color="#FFF" />
            </Pressable>

            <View style={{ padding: 3, backgroundColor: "#AAA", borderRadius: 15, marginBottom: 20 }}>

                {playlist[currentIndex]?.thumbnail === null ?
                    <Image source={require('../../assets/musica.png')} style={styles.image} />
                    :
                    <Image source={{ uri: playlist[currentIndex]?.thumbnail }} style={styles.image} />
                }
            </View>

            <Text style={styles.text}>{playlist[currentIndex]?.title.replace(/\.[^/.]+$/, "") || "Sem título"}</Text>
            <Text style={styles.text}>{playlist[currentIndex]?.author || ""}</Text>

            <View style={styles.controls}>
                <Pressable onPress={prevTrack} disabled={isChangingTrack}>
                    <Ionicons name="play-back" size={50} color={isChangingTrack ? "#888" : "#FFF"} />
                </Pressable>

                <Pressable onPress={togglePlayPause} disabled={isChangingTrack}>
                    <Ionicons name={isPlaying ? "pause" : "play"} size={70} color={isChangingTrack ? "#888" : "#FFF"} />
                </Pressable>

                <Pressable onPress={nextTrack} disabled={isChangingTrack}>
                    <Ionicons name="play-forward" size={50} color={isChangingTrack ? "#888" : "#FFF"} />
                </Pressable>
            </View>

            <Modal
                visible={showEmptyPlaylistModal}
                transparent
                animationType="slide">

                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Pressable
                            onPress={() => navigation.goBack()}
                            style={{
                                position: 'absolute',
                                top: 20,
                                left: 20,
                            }}>
                            <Ionicons name="chevron-back" color="#FFF" size={30} />
                        </Pressable>

                        <Text style={styles.modalText}>Sua playlist está vazia!</Text>

                        <FlatList
                            style={{ width: '100%' }}
                            data={musics}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderItem} />

                        <Pressable
                            style={styles.modalButton}
                            onPress={() => {
                                if (selecteds.length === 0) {
                                    Alert.alert("Selecione pelo menos uma música");
                                    return;
                                }
                                setShowEmptyPlaylistModal(false);
                                handleAddSongs();
                            }}
                        >
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
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
    },
    backBtn: {
        position: 'absolute',
        top: 20, 
        left: 20,
        backgroundColor: '#212121',
        height: 50,
        width: 50,
        borderRadius: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 150,
        height: 150,
    },
    text: {
        color: "#FFF",
        fontSize: 18,
        marginTop: 10,
    },
    controls: {
        flexDirection: "row",
        marginTop: 20,
        justifyContent: "center",
        alignItems: "center",
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

export default Player;
