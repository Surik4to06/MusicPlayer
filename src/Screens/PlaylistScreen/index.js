import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, Modal, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FlatList } from "react-native-gesture-handler";

import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from "expo-media-library";

import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Auth, db } from "../../Services/firebaseConfig";

import { styles } from './styles';
import CompartilharPlaylistModal from '../../Components/modalSharePlaylist';

const PlaylistScreen = ({ route }) => {
    const { playlist, friendName } = route.params;
    const navigation = useNavigation();

    const [showEmptyPlaylistModal, setShowEmptyPlaylistModal] = useState(false);
    const [musics, setMusics] = useState([]);
    const [selecteds, setSelecteds] = useState([]);
    const [userPhotos, setUserPhotos] = useState({});
    const [playlistData, setPlaylistData] = useState(playlist);
    const [showShareModal, setShowShareModal] = useState(false);

    useEffect(() => {
        fetchAllAudioFiles();

        const playlistRef = doc(db, "playlists", playlist.id);
        const unsubscribe = onSnapshot(playlistRef, (snapshot) => {
            if (snapshot.exists()) {
                const updatedPlaylist = snapshot.data();
                setPlaylistData({ ...updatedPlaylist, id: snapshot.id });

                const uniqueUids = [...new Set(updatedPlaylist.songs.map(song => song.addedByUid))];
                uniqueUids.forEach(uid => getUserPhoto(uid));
            }
        });

        return () => unsubscribe(); // Limpa o listener ao desmontar
    }, []);

    const getUserPhoto = async (uid) => {
        if (userPhotos[uid]) return;

        try {
            const userDocRef = doc(db, "users", uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                setUserPhotos(prev => ({
                    ...prev,
                    [uid]: userData.photo || null,
                }));
            }
        } catch (error) {
            console.error("Erro ao buscar foto do usuário:", error);
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

            const storage = getStorage();

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
            } else {
                Alert.alert("Nenhuma música nova para adicionar.");
            }
        } catch (error) {
            console.error("Erro ao adicionar músicas:", error);
            Alert.alert("Erro", "Não foi possível adicionar as músicas.");
        }
    };

    const renderItemMusics = ({ item, index }) => {
        const userPhoto = userPhotos[item.addedByUid];

        return (
            <Pressable
                onPress={() => {
                    navigation.navigate(
                        "PlayerTeste", {
                        playlist: playlistData.songs,
                        playlistId: playlistData.id,
                        initialIndex: index ?? null,
                    });
                }}
                style={styles.songItem}>
                <Image
                    source={item.thumbnail
                        ? { uri: item.thumbnail }
                        : require('../../../assets/musica.png')}
                    style={styles.songThumbnail}
                />
                <View style={{ width: '70%', justifyContent: 'center' }}>
                    <Text numberOfLines={1} style={styles.songTitle}>{item.title}</Text>
                    <Text numberOfLines={1} style={styles.songAuthor}>{item.author}</Text>
                </View>
                {userPhoto && (
                    <Image source={{ uri: userPhoto }} style={{ width: 20, height: 20, borderRadius: 999 }} />
                )}
            </Pressable>
        );
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
                    <Image
                        source={item.thumbnail ? item.thumbnail : require('../../../assets/musica.png')}
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

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Pressable
                    style={[styles.backBtn, { left: 5 }]}
                    onPress={() => navigation.goBack()}>
                    <Ionicons style={{ marginLeft: -3 }} name='chevron-back' color="#FFF" size={30} />
                </Pressable>

                <Text style={styles.friendName}>Playlist com {friendName}</Text>

                <Pressable
                    onPress={() => {
                        navigation.navigate('EditPlaylist', { playlist: playlistData });
                    }}
                    style={[styles.backBtn, { right: 5 }]}>
                    <Ionicons name="settings-outline" size={30} color="#FFF" />
                </Pressable>
            </View>

            {playlistData.thumbnail === null ?
                <Image source={require('../../../assets/musica.png')} style={[styles.playlistImage, { backgroundColor: "#AAA" }]} />
                :
                <Image source={{ uri: playlistData.thumbnail }} style={styles.playlistImage} />
            }

            <Text style={styles.playlistTitle}>{playlistData.name}</Text>
            <Text style={styles.songCount}>{playlistData.songs.length} Músicas</Text>

            <View style={styles.buttonContainer}>
                <Pressable
                    onPress={() => {
                        if (!playlistData.songs || playlistData.songs.length === 0) {
                            setShowEmptyPlaylistModal(true);
                            return;
                        }

                        navigation.navigate("PlayerTeste", {
                            playlist: playlistData.songs,
                            playlistId: playlistData.id,
                        });
                    }}
                    style={styles.button}
                >
                    <Ionicons name="play" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Play</Text>
                </Pressable>

                <Pressable 
                onPress={() => {setShowShareModal(true)}}
                style={styles.button}>
                    <Ionicons name="arrow-redo-outline" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Compartilhar</Text>
                </Pressable>
            </View>

            <FlatList
                style={{ paddingBottom: 30 }}
                data={playlistData.songs}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
                renderItem={renderItemMusics}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
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
                    marginBottom: 65,
                    marginTop: -70,
                    borderWidth: 1,
                    borderColor: '#333',
                }}
            >
                <Ionicons name="add-circle-outline" size={24} color="#FFF" style={{ marginRight: 10 }} />
                <Text style={{ color: '#FFF', fontSize: 16 }}>Adicionar mais músicas</Text>
            </Pressable>


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
                            renderItem={renderItem}
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

            {/* Modal pra adicionar usuarios na playlist com aviso de confirmação */}
            <CompartilharPlaylistModal
                user={Auth.currentUser.uid}
                showShareModal={showShareModal}
                setShowShareModal={setShowShareModal}
                playlist={playlist}
            />
        </ScrollView>
    );
};

export default PlaylistScreen;
