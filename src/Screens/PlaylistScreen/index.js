import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, Modal, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FlatList } from "react-native-gesture-handler";

import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from "expo-media-library";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Auth, db } from "../../Services/firebaseConfig";

import { styles } from './styles';

const PlaylistScreen = ({ route }) => {
    const { playlist, friendName } = route.params;

    const navigation = useNavigation();

    const [showEmptyPlaylistModal, setShowEmptyPlaylistModal] = useState(false);
    const [musics, setMusics] = useState([]);
    const [selecteds, setSelecteds] = useState([]);

    useEffect(() => {
        fetchAllAudioFiles();
        if (playlist.songs.length <= 0) {
            Alert.alert(
                "Aviso!",
                "Parece que vocês ainda não possuem nenhuma musica na plylist. Deseja adicionar Músicas?",
                [
                    {
                        text: "Cancelar",
                        onPress: () => console.log("Cancelado"),
                        style: "cancel",
                    },
                    {
                        text: "Adicionar",
                        onPress: () => {
                            // ação que você quiser
                            setShowEmptyPlaylistModal(true);
                        },
                    },
                ],
                { cancelable: true }
            );
        }
    }, []);

    // Puxa todas as msicas do celular do usuario para poder adicionalas na playlist
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

            Alert.alert("Músicas adicionadas!", `${newMusics.length} música(s) adicionada(s) à playlist.`);
        } catch (error) {
            console.error("Erro ao adicionar músicas:", error);
            Alert.alert("Erro", "Não foi possível adicionar as músicas.");
        }
    };

    // se a playlist nn estiver vazia renderiza as musicas
    const renderItemMusics = ({ item }) => {
        return (
            <View style={styles.songItem}>
                <Image
                    source={
                        item.thumbnail
                            ? { uri: item.thumbnail }
                            : require('../../../assets/musica.png')
                    }
                    style={styles.songThumbnail} />
                <View>
                    <Text style={styles.songTitle}>{item.title}</Text>
                    <Text style={styles.songAuthor}>{item.author}</Text>
                </View>
            </View>
        );
    }

    // renderiza os audios do celular e joga no flatlist pra selecionar
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
                        <Image source={require('../../../assets/musica.png')} style={{ width: 50, height: 50, backgroundColor: '#AAA' }} />
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
        <ScrollView style={styles.container}>
            {/* cabeçalho */}
            <View style={styles.header}>

                {/* Botões do cabeçalho */}
                <Pressable
                    style={[styles.backBtn, { left: 5 }]}
                    onPress={() => navigation.goBack()}>
                    <Ionicons style={{ marginLeft: -3 }} name='chevron-back' color="#FFF" size={30} />
                </Pressable>

                <Text style={styles.friendName}>Playlist com {friendName}</Text>

                <Pressable
                    onPress={() => {
                        navigation.navigate('EditPlaylist', { playlist: playlist });
                    }}
                    style={[styles.backBtn, { right: 5 }]}>
                    <Ionicons name="settings-outline" size={30} color="#FFF" />
                </Pressable>
            </View>

            {/* Imagem da playlist */}
            {playlist.thumbnail === null ?
            <Image source={require('../../../assets/musica.png')} style={[styles.playlistImage, { backgroundColor: "#AAA" }]} />
            :
            <Image source={{ uri: playlist.thumbnail }} style={styles.playlistImage} />
            }

            {/* Nome e quantidade de músicas */}
            <Text style={styles.playlistTitle}>{playlist.name}</Text>
            <Text style={styles.songCount}>{playlist.songs.length} Músicas</Text>

            {/* Botões de ação */}
            <View style={styles.buttonContainer}>
                <Pressable
                    onPress={() => {
                        navigation.navigate("PlayerTeste", { playlist: playlist.songs, playlistId: playlist.id });
                    }}
                    style={styles.button}>
                    <Ionicons name="play" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Play</Text>
                </Pressable>

                <Pressable style={styles.button}>
                    <Ionicons name="shuffle" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Shuffle</Text>
                </Pressable>
            </View>

            {/* Lista de músicas */}
            <FlatList
                style={{ paddingBottom: 30 }}
                data={playlist.songs}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
                renderItem={renderItemMusics}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            />

            {/* Modal pra mostrar as musicas do celular para poder adicionalas na playlist */}
            <Modal
                visible={showEmptyPlaylistModal}
                transparent
                animationType="slide">

                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Pressable
                            onPress={() => setShowEmptyPlaylistModal(false)}
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
        </ScrollView>

    );
};

export default PlaylistScreen;
