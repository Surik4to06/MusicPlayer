import React, { useContext, useEffect, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, BackHandler } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import { AuthContext } from "../Context/AuthContext"; // Importa o contexto
import { Auth } from "../Services/firebaseConfig";

const PlayerMusic = ({ route, navigation }) => {
    const { playerMusic } = route.params;
    const { likedSongs, setLikedSongs, user } = useContext(AuthContext); // Obtém usuário e lista de curtidas

    const [sound, setSound] = useState(null);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);

    // Verifica se a música está curtida pelo usuário atual
    const isLiked = likedSongs.some((song) => song.id === playerMusic.id && song.uid === Auth.currentUser.uid);

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
    }, []);

    useEffect(() => {
        const backAndPauseMusic = () => {
            if (sound && sound.pauseAsync) {
                sound.pauseAsync();
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAndPauseMusic);
        return () => backHandler.remove();
    }, [sound]);

    // Alterna entre curtir/descurtir a música e armazena o UID do usuário
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
                        {/* Botão de curtir com estado atualizado */}
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
                        <Pressable>
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
});

export default PlayerMusic;
