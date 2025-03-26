import React, { useContext, useEffect, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, BackHandler, Animated, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import { AuthContext } from "../Context/AuthContext"; // Importa o contexto
import { Auth, db } from "../Services/firebaseConfig";
import { getDoc, updateDoc, doc, arrayUnion, onSnapshot, query, collection, where } from "firebase/firestore";

const PlayerMusic = ({ route, navigation }) => {
    const { playerMusic } = route.params;
    const { likedSongs, setLikedSongs } = useContext(AuthContext); // Obtém usuário e lista de curtidas

    const [sound, setSound] = useState(null);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [bottomSheetHeight, setBottomSheetHeight] = useState(new Animated.Value(0));
    const [playlists, setPlaylists] = useState([]); // Para armazenar as playlists do usuário

    // Verifica se a música está curtida pelo usuário atual
    const isLiked = likedSongs.some((song) => song.id === playerMusic.id && song.uid === Auth.currentUser.uid);

    // Carregar as playlists do usuário ao montar o componente
    useEffect(() => {
        const unsubscribe = onSnapshot(query(collection(db, "playlists"), where("members", "array-contains", Auth.currentUser.uid)), (snapshot) => {
            setPlaylists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const loadMusic = async () => {
            try {
                const { sound, status } = await Audio.Sound.createAsync(
                    { uri: playerMusic.url },
                    { shouldPlay: false }
                );
                setSound(sound);
                setDuration(status.durationMillis || 1);
                sound.setOnPlaybackStatusUpdate(updateStatus);
            } catch (error) {
                console.error("Erro ao carregar música:", error);
            }
        };

        loadMusic();

        return () => {
            if (sound) {
                sound.stopAsync();
                sound.unloadAsync();
            }
        };
    }, [playerMusic.url]);

    useEffect(() => {
        const backAndPauseMusic = () => {
            if (sound) {
                sound.pauseAsync();
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAndPauseMusic);
        return () => backHandler.remove();
    }, [sound]);

    const toggleLikedSong = (song) => {
        setLikedSongs((prevLikedSongs) => {
            const songExists = prevLikedSongs.some((s) => s.id === song.id && s.uid === Auth.currentUser.uid);

            if (songExists) {
                return prevLikedSongs.filter((s) => !(s.id === song.id && s.uid === Auth.currentUser.uid));
            } else {
                return [...prevLikedSongs, { ...song, uid: Auth.currentUser.uid }];
            }
        });
    };

    const updateStatus = (status) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 1);
            setIsPlaying(status.isPlaying);
        }
    };

    const togglePlayPause = async () => {
        if (sound) {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleBottomSheet = () => {
        Animated.timing(bottomSheetHeight, {
            toValue: bottomSheetHeight._value === 0 ? 500 : 0,  // Altere o valor 350 para a altura desejada
            duration: 300,
            useNativeDriver: false, // Usa a animação nativa para melhorar o desempenho
        }).start();
    };

    // Atualiza a playlist ao adicionar ou remover música
    const addSongToPlaylist = async (playlistId) => {
        if (!playerMusic.id) return;

        const playlistRef = doc(db, "playlists", playlistId);
        
        try {
            const playlistDoc = await getDoc(playlistRef);
            if (!playlistDoc.exists()) {
                console.error("Playlist não encontrada!");
                return;
            }

            const playlistData = playlistDoc.data();
            const songExists = playlistData.songs && playlistData.songs.some((song) => song.id === playerMusic.id);

            if (songExists) {
                // Remover a música da playlist
                await updateDoc(playlistRef, {
                    songs: playlistData.songs.filter((song) => song.id !== playerMusic.id)
                });
            } else {
                // Adicionar a música na playlist
                await updateDoc(playlistRef, {
                    songs: arrayUnion({ ...playerMusic, addedBy: Auth.currentUser.displayName })
                });
            }
        } catch (error) {
            console.error("Erro ao atualizar playlist:", error);
        }
    };

    const renderItem = ({ item }) => {
        const songInPlaylist = item.songs.some((song) => song.id === playerMusic.id);
    
        return (
            <Pressable onPress={() => addSongToPlaylist(item.id)} style={styles.playlistItem}>
                <Text style={styles.playlistName}>{item.name}</Text>
                <View style={styles.addButton}>
                    <Ionicons
                        name={songInPlaylist ? "remove-circle-outline" : "add-circle-outline"}
                        size={28}
                        color={songInPlaylist ? 'red' : 'lightgreen'}
                        style={{ marginRight: 5 }}
                    />
                    <Text style={styles.addButtonText}>{songInPlaylist ? "Remover música" : "Adicionar música"}</Text>
                </View>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <Image blurRadius={6} source={{ uri: playerMusic.thumbnail }} style={StyleSheet.absoluteFillObject} />
            <Pressable style={styles.backButton} onPress={async () => {
                navigation.goBack();
                await sound.pauseAsync();
            }}>
                <Ionicons style={{ marginLeft: -3 }} name="chevron-back-outline" size={30} color="#FFF" />
            </Pressable>

            <View style={styles.content}>
                <Image source={{ uri: playerMusic.thumbnail }} style={styles.image} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 30 }}>
                    <View style={{ width: 290, gap: 10 }}>
                        <Text numberOfLines={2} style={styles.title}>{playerMusic.title}</Text>
                        <Text style={styles.author}>{playerMusic.author}</Text>
                    </View>

                    <View style={styles.containerBtns}>
                        <Pressable onPress={() => toggleLikedSong(playerMusic)}>
                            <Ionicons
                                name={isLiked ? "heart" : "heart-outline"}
                                size={37}
                                color={isLiked ? "red" : "#FFF"}
                            />
                        </Pressable>

                        <Pressable>
                            <Ionicons name="chatbubble-ellipses-outline" size={37} color='#FFF' />
                        </Pressable>

                        <Pressable onPress={toggleBottomSheet}>
                            <Ionicons name="musical-notes-outline" size={37} color='#FFF' />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.sliderContainer}>
                    <Text style={styles.timeText}>{(position / 60000).toFixed(2)}</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={duration}
                        value={position}
                        minimumTrackTintColor="#1db954"
                        maximumTrackTintColor="#ffffff"
                        thumbTintColor="#1db954"
                        onSlidingComplete={(value) => sound.setPositionAsync(value)}
                    />
                    <Text style={styles.timeText}>{(duration / 60000).toFixed(2)}</Text>
                </View>

                <Pressable style={styles.playButton} onPress={togglePlayPause}>
                    {isPlaying ? (
                        <Ionicons name="pause" size={50} color="#FFF" />
                    ) : (<Ionicons style={{ marginLeft: 3 }} name="play" size={50} color="#FFF" />)}
                </Pressable>
            </View>

            <Animated.View style={[styles.bottomSheet, { height: bottomSheetHeight }]}>
                <Pressable onPress={toggleBottomSheet} style={styles.close}>
                    <Ionicons name="close" size={37} color="#FFF" />
                </Pressable>

                <Text style={styles.bottomSheetText}>Minhas Playlists</Text>

                <FlatList
                    data={playlists}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
    },
    backButton: {
        position: "absolute",
        top: 30,
        left: 20,
        zIndex: 1,
        backgroundColor: '#212121',
        height: 45,
        width: 45,
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 40,
    },
    image: {
        width: 250,
        height: 250,
        borderRadius: 10,
        marginBottom: 20
    },
    title: {
        fontSize: 22,
        color: "#FFF",
        fontWeight: "bold",
        textAlign: "left",
    },
    author: {
        fontSize: 18,
        color: "#CCC",
        marginTop: 5,
        textAlign: "left",
    },
    containerBtns: {
        gap: 15,
    },
    sliderContainer: {
        width: "90%",
        marginTop: 40,
        flexDirection: 'row',
    },
    slider: {
        flex: 1,
    },
    timeText: {
        color: "#FFF",
        textAlign: "center",
        fontSize: 18,
    },
    playButton: {
        marginTop: 20,
        backgroundColor: '#212121',
        height: 70,
        width: 70,
        borderRadius: 999,
        marginTop: 30,
        marginBottom: -40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomSheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#333",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        zIndex: 999,
    },
    close: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    bottomSheetText: {
        color: "#FFF",
        fontSize: 20,
        marginTop: 16,
        marginBottom: 20,
        textAlign: 'center',
        marginLeft: 60,
        marginRight: 60,
    },
    playlistItem: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#595959',
        flex: 1,
        marginBottom: 20,
        borderRadius: 999,
        width: "95%",
        marginLeft: 10,
        padding: 5,
    },
    playlistName: {
        fontSize: 18,
        color: '#FFF',
    },
    addButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    addButtonText: {
        fontSize: 16,
        color: '#FFF',
    }
});

export default PlayerMusic;
