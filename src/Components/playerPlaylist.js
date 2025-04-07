import React, { useState, useEffect } from "react";
import { View, Text, Image, Pressable, StyleSheet, Modal } from "react-native";
import { Audio } from "expo-av";
import { Ionicons, Entypo, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import Slider from "@react-native-community/slider";

const Player = ({ route }) => {
    const { playlist: initialPlaylist, initialIndex = 0 } = route.params;
    const navigation = useNavigation();

    const [playlist, setPlaylist] = useState(initialPlaylist);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isChangingTrack, setIsChangingTrack] = useState(false);
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(1);
    const [playMode, setPlayMode] = useState("normal"); // normal | ramdon | loop
    const [showMusicsPlaylist, setShowMusicsPlaylist] = useState(false);

    useEffect(() => {
        if (!playlist || playlist.length === 0) return;
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
            if (sound) {
                await sound.stopAsync();
                await sound.unloadAsync();
                setSound(null);
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: true },
                onPlaybackStatusUpdate
            );

            setSound(newSound);
            setIsPlaying(true);
        } catch (error) {
            console.error("Erro ao tocar música:", error);
        } finally {
            setIsChangingTrack(false);
        }
    };

    const onPlaybackStatusUpdate = (status) => {
        if (!status.isLoaded) return;

        setPosition(status.positionMillis);
        setDuration(status.durationMillis || 1);

        if (status.didJustFinish) {
            handleNextTrack();
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

    const handleNextTrack = () => {
        if (isChangingTrack) return;

        if (playMode === "loop") {
            playMusic(playlist[currentIndex]?.url);
        } else if (playMode === "shuffle") {
            const randomIndex = Math.floor(Math.random() * playlist.length);
            setCurrentIndex(randomIndex);
        } else {
            if (currentIndex < playlist.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                setCurrentIndex(0);
            }
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

    const togglePlayMode = () => {
        if (playMode === "normal") setPlayMode("shuffle");
        else if (playMode === "shuffle") setPlayMode("loop");
        else setPlayMode("normal");
    };

    const renderPlayModeIcon = () => {
        if (playMode === "shuffle") return <Entypo name="shuffle" size={40} color="skyblue" />;
        if (playMode === "loop") return <Ionicons name="repeat" size={40} color="skyblue" />;
        return <MaterialIcons name="repeat-one" size={40} color="#FFF" />;
    };

    const formatTime = (millis) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <View style={styles.container}>
            {playlist[currentIndex]?.thumbnail && (
                <Image blurRadius={6} source={{ uri: playlist[currentIndex].thumbnail }} style={StyleSheet.absoluteFillObject} />
            )}

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
                <Ionicons name='chevron-back' size={40} color="#FFF" />
            </Pressable>

            <View style={{ marginTop: 40, marginBottom: 20 }}>
                {playlist[currentIndex]?.thumbnail === null ?
                    <Image source={require('../../assets/musica.png')} style={[styles.image, { backgroundColor: '#AAA' }]} />
                    :
                    <Image source={{ uri: playlist[currentIndex]?.thumbnail }} style={styles.image} />
                }
            </View>

            <Text numberOfLines={1} style={styles.text}>{playlist[currentIndex]?.title.replace(/\.[^/.]+$/, "") || "Sem título"}</Text>
            <Text numberOfLines={1} style={styles.text}>{playlist[currentIndex]?.author || ""}</Text>

            {/* Slider com tempos */}
            <View style={styles.sliderContainer}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>

                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={duration}
                    value={position}
                    minimumTrackTintColor="#1db954"
                    maximumTrackTintColor="#ffffff"
                    thumbTintColor="#1db954"
                    onSlidingComplete={(value) => sound && sound.setPositionAsync(value)}
                />

                <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>

            <View style={styles.controls}>
                <Pressable onPress={prevTrack} disabled={isChangingTrack}>
                    <Ionicons name="play-back" size={50} color={isChangingTrack ? "#888" : "#FFF"} />
                </Pressable>

                <Pressable onPress={togglePlayPause} disabled={isChangingTrack}>
                    <Ionicons name={isPlaying ? "pause" : "play"} size={70} color={isChangingTrack ? "#888" : "#FFF"} />
                </Pressable>

                <Pressable onPress={handleNextTrack} disabled={isChangingTrack}>
                    <Ionicons name="play-forward" size={50} color={isChangingTrack ? "#888" : "#FFF"} />
                </Pressable>
            </View>

            <View style={{ paddingHorizontal: 20, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                {/* Botão de modo de reprodução */}
                <Pressable onPress={togglePlayMode}>
                    {renderPlayModeIcon()}
                </Pressable>

                <Pressable
                    onPress={() => setShowMusicsPlaylist(true)}>
                    <Ionicons name="list-outline" color="#FFF" size={40} />
                </Pressable>
            </View>

            {/* BottomSheet das musicas na playlist */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showMusicsPlaylist}
                onRequestClose={() => setShowMusicsPlaylist(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Pressable onPress={() => setShowMusicsPlaylist(false)} style={styles.closeButton}>
                            <Ionicons name="close" size={30} color="#FFF" />
                        </Pressable>

                        <Text style={styles.modalTitle}>Músicas da Playlist</Text>

                        {playlist.map((music, index) => (
                            <Pressable
                                key={index}
                                onPress={() => {
                                    setCurrentIndex(index);
                                    setShowMusicsPlaylist(false);
                                }}
                                style={styles.musicItem}
                            >
                                <View style={{ flexDirection: 'row' }}>
                                    {music.thumbnail === null ?
                                        <Image source={require('../../assets/musica.png')} style={[styles.playlistImage, { backgroundColor: "#AAA" }]} />
                                        :
                                        <Image source={{ uri: music.thumbnail }} style={styles.playlistImage} />
                                    }
                                    <View style={{width: '100%'}}>
                                        <Text numberOfLines={1} style={styles.musicTitle}>{music.title.replace(/\.[^/.]+$/, "")}</Text>
                                        <Text numberOfLines={1} style={styles.musicAuthor}>{music.author}</Text>
                                    </View>
                                </View>
                            </Pressable>
                        ))}
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
        width: 300,
        height: 300,
        borderRadius: 15,
    },
    text: {
        color: "#FFF",
        fontSize: 18,
        marginTop: 10,
        textAlign: 'center'
    },
    controls: {
        flexDirection: "row",
        marginTop: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    slider: {
        width: "100%",
        height: 40,
    },
    sliderContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "90%",
        marginTop: 30,
    },
    slider: {
        flex: 1,
    },
    timeText: {
        color: "#FFF",
        fontSize: 12,
        width: 40,
        textAlign: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '100%',
        backgroundColor: '#121212',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    closeButton: {
        alignSelf: 'flex-end',
        marginBottom: 10,
        zIndex: 9999,
    },
    modalTitle: {
        marginTop: -40,
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    musicItem: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 10,
    },
    playlistImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#AAA',
        marginRight: 10,
    },
    musicTitle: {
        color: '#FFF',
        fontSize: 16,
        width: '80%',
    },
    musicAuthor: {
        color: '#AAA',
        fontSize: 14,
    },
});

export default Player;
