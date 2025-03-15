import React, { useContext, useState, useRef, useEffect } from "react";
import { View, Text, Image, FlatList, Pressable, Animated, Easing, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import * as Progress from "react-native-progress";

import { styles } from "./styles";
import { AuthContext } from "../../Context/AuthContext";

export default () => {
    const { musicsList } = useContext(AuthContext);

    const progressAnim = useRef(new Animated.Value(0)).current;

    const [currentSound, setCurrentSound] = useState(null);
    const [currentMusicId, setCurrentMusicId] = useState(null);
    const [playerMusic, setPlayerMusic] = useState(null);
    const [durationMusicTime, setDurationMusicTime] = useState(0);
    const [position, setPosition] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [durationMillis, setDurationMillis] = useState(0);

    const [favorite, setFavorite] = useState(false);

    const spinValue = useRef(new Animated.Value(0)).current;
    const spinAnimation = useRef(null);

    const AUDIO_URL = playerMusic === null ? '' : playerMusic.url;

    useEffect(() => {
        if (currentMusicId) {
            startRotation();
        } else {
            stopRotation();
        }

        return () => stopRotation();
    }, [currentMusicId]);

    useEffect(() => {
        return currentSound
            ? () => {
                currentSound.unloadAsync();
            }
            : undefined;
    }, [currentSound]);

    const onPlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            if (status.durationMillis) {
                formatDuration(status.durationMillis / 1000); // Converte para segundos
            }

            Animated.timing(progressAnim, {
                toValue: status.positionMillis,
                duration: 500,
                easing: Easing.linear,
                useNativeDriver: false,
            }).start();

            if (status.didJustFinish) {
                setIsPlaying(false);
            }
        }
    };

    const loadAndPlaySound = async () => {
        try {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: AUDIO_URL },
                { shouldPlay: true },
                onPlaybackStatusUpdate
            );
            setCurrentSound(newSound);
            setIsPlaying(true);

            const status = await newSound.getStatusAsync();
            if (status.isLoaded && status.durationMillis) {
                formatDuration(status.durationMillis / 1000);
            } else {
                console.warn("Erro ao carregar duração da música.");
            }
        } catch (error) {
            console.error("Erro ao carregar a música:", error);
        }
    };

    const seek = async (value) => {
        if (currentSound) {
            await currentSound.setPositionAsync(value);
            setPosition(value);
        }
    };

    const startRotation = () => {
        spinValue.setValue(0);
        spinAnimation.current = Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        spinAnimation.current.start();
    };

    const stopRotation = () => {
        if (spinAnimation.current) {
            spinAnimation.current.stop();
        }
        spinValue.setValue(0);
    };

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const togglePlay = async (item) => {
        if (currentSound) {
            await currentSound.stopAsync();
            await currentSound.unloadAsync();
            setCurrentSound(null);
            setCurrentMusicId(null);
        }

        if (currentMusicId === item.id) {
            stopRotation();
            return;
        }

        try {
            const { sound } = await Audio.Sound.createAsync(
                { uri: item.url },
                { shouldPlay: true }
            );
            setCurrentSound(sound);
            setCurrentMusicId(item.id);
            startRotation();
        } catch (error) {
            console.error("Erro ao tocar música:", error);
        }
    };

    const getMusicDuration = async (url) => {
        try {
            const { sound } = await Audio.Sound.createAsync({ uri: url });
            const status = await sound.getStatusAsync();

            if (status.isLoaded && status.durationMillis) {
                formatDuration(status.durationMillis / 1000); // Converte para segundos
            } else {
                console.warn("Falha ao carregar a música");
                formatDuration(0);
            }
        } catch (error) {
            console.error("Erro ao pegar a duração:", error);
            formatDuration(0);
        }
    };

    const formatDuration = (seconds) => {
        if (isNaN(seconds) || seconds === null || seconds === undefined) {
            setDurationMusicTime("0:00");
            setDurationMillis(0);
            return;
        }

        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        setDurationMusicTime(`${min}:${sec.toString().padStart(2, "0")}`);
        setDurationMillis(seconds * 1000); // Converte de segundos para milissegundos
    };

    const renderItem = ({ item }) => {
        const isPlaying = currentMusicId === item.id;

        return (
            <Pressable onPress={() => {
                setPlayerMusic(item)
                getMusicDuration(item.url)
            }} style={styles.cardMusic}>
                <View style={styles.containerCard}>
                    <View style={{ flexDirection: "row", padding: 10 }}>
                        {isPlaying ? (
                            <Animated.Image
                                source={{ uri: item.thumbnail }}
                                style={[styles.thumbnail, { transform: [{ rotate: spin }] }]}
                            />
                        ) : (
                            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                        )}
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.author}>{item.author}</Text>
                        </View>
                    </View>
                    <Pressable onPress={() => togglePlay(item)} style={styles.btnPlayMusic}>
                        {isPlaying ? (
                            <Ionicons name="pause" size={30} color="#FFF" />
                        ) : (
                            <Ionicons style={{marginLeft: 3}} name="play" size={30} color="#FFF" />
                        )}
                    </Pressable>
                </View>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                style={styles.flatList}
                data={musicsList}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
            />

            {playerMusic && (
                <Modal
                    transparent={true}
                    visible={!!playerMusic}
                >
                    <View style={styles.containerModal}>
                        <Image blurRadius={4} source={{ uri: playerMusic.thumbnail }} style={[styles.imageMusicBluer, StyleSheet.absoluteFillObject]} />
                        <Pressable style={styles.containerIconModal} onPress={() => setPlayerMusic(null)} >

                            <View style={styles.containerIcon}>
                                <Ionicons style={styles.backIcon} name="chevron-back-outline" size={30} color='#FFF' />
                            </View>

                            <View style={styles.containerIcon}>
                                <Ionicons name="list-outline" size={30} color='#FFF' />
                            </View>
                        </Pressable>

                        <View style={styles.containerGeral}>
                            <Image source={{ uri: playerMusic.thumbnail }} style={styles.imageMusic} />

                            <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                <View style={{ flexDirection: 'column'}}>
                                    <Text style={styles.titlePopup}>{playerMusic.title}</Text>
                                    <Text style={[styles.titlePopup, { fontSize: 16 }]}>{playerMusic.author}</Text>
                                </View>

                                <View style={styles.containerBtns}>
                                    <Pressable onPress={() => {
                                        if (favorite === true) {
                                            setFavorite(false);
                                        } else {
                                            setFavorite(true);
                                        }

                                    }}>
                                        {favorite ? 
                                        (<Ionicons name="heart" size={37} color='red' />)
                                        : (<Ionicons name="heart-outline" size={37} color='#FFF' />)} 
                                        
                                    </Pressable>
                                    <Pressable>
                                        <Ionicons name="chatbubble-ellipses-outline" size={37} color='#FFF' />
                                    </Pressable>
                                    <Pressable>
                                        <Ionicons name="musical-notes-outline" size={37} color='#FFF' />
                                    </Pressable>
                                </View>
                            </View>

                            <View>
                                {/* ProgressBar pra mostrar tempo de musica  */}
                                <Text style={{ color: '#000' }}>{durationMusicTime}</Text>
                                <Text>{}</Text>
                                <Slider
                                    style={{ width: 300, height: 10 }}
                                    minimumValue={0}
                                    maximumValue={durationMillis} // Agora recebe o valor correto
                                    value={position}
                                    onValueChange={(value) => seek(value)}
                                    minimumTrackTintColor="#000"
                                    maximumTrackTintColor="#ccc"
                                    thumbTintColor="skyblue"
                                />

                                <Pressable
                                    onPress={() => togglePlay(playerMusic)}
                                    style={{ marginTop: 20, padding: 10, backgroundColor: "#343434", borderRadius: 999, width: 70, height: 70, justifyContent: 'center', alignItems: 'center', position: 'relative', left: '45%', top: '30%', transform: 'translate(-50%, -50%)' }}>
                                    {currentSound ?
                                        (<Ionicons name='pause' size={50} color="#FFF" />)
                                        :
                                        (<Ionicons style={{marginLeft: 3}} name="play" size={50} color='#FFF' />)
                                    }
                                </Pressable>
                            </View>
                        </View>
                    </View>

                </Modal>
            )}

        </View>

    );
};
