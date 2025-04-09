import React, { useContext, useState, useEffect } from "react";
import { View, FlatList, Animated, Easing } from "react-native";
import { Audio } from "expo-av";
import { useIsFocused } from "@react-navigation/native";

import { styles } from "./styles";
import { AuthContext } from "../../Context/AuthContext";
import CardMusic from "../../Components/cardMusic";

const MusicList = () => {
    const { musicsList, currentSound, setCurrentSound } = useContext(AuthContext);
    const isFocused = useIsFocused();

    const [currentMusicId, setCurrentMusicId] = useState(null);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(1);
    const [textAnimations, setTextAnimations] = useState({});

    useEffect(() => {
        const newAnimations = {};
        musicsList.forEach((item) => {
            newAnimations[item.id] = {
                title: new Animated.Value(0),
                author: new Animated.Value(0),
            };
        });
        setTextAnimations(newAnimations);
    }, [musicsList]);

    useEffect(() => {
        musicsList.forEach((item) => {
            if (textAnimations[item.id]) {
                if (item.title.length > 20) {
                    Animated.loop(
                        Animated.timing(textAnimations[item.id].title, {
                            toValue: -200,
                            duration: 4000,
                            easing: Easing.linear,
                            useNativeDriver: true,
                        })
                    ).start();
                }

                if (item.author.length > 15) {
                    Animated.loop(
                        Animated.timing(textAnimations[item.id].author, {
                            toValue: -150,
                            duration: 3500,
                            easing: Easing.linear,
                            useNativeDriver: true,
                        })
                    ).start();
                }
            }
        });
    }, [textAnimations]);

    useEffect(() => {
        let interval;
        if (currentSound) {
            interval = setInterval(async () => {
                const status = await currentSound.getStatusAsync();
                if (status.isLoaded && status.isPlaying) {
                    setPosition(status.positionMillis);
                    setDuration(status.durationMillis || 1);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [currentSound]);

    // PAUSAR QUANDO PERDER FOCO DA TELA
    useEffect(() => {
        if (!isFocused && currentSound) {
            currentSound.pauseAsync();
        }
    }, [isFocused]);

    const togglePlay = async (item) => {
        // Pausar música atual
        if (currentSound) {
            await currentSound.stopAsync();
            await currentSound.unloadAsync();
            setCurrentSound(null);
            setCurrentMusicId(null);
        }

        // Se clicou na mesma música, só para
        if (currentMusicId === item.id) return;

        // Toca a nova música
        try {
            const { sound, status } = await Audio.Sound.createAsync(
                { uri: item.url },
                { shouldPlay: true }
            );
            setCurrentSound(sound);
            setCurrentMusicId(item.id);
            setPosition(0);
            setDuration(status.durationMillis || 1);
        } catch (error) {
            console.error("Erro ao tocar música:", error);
        }
    };

    const renderItem = ({ item }) => (
        <CardMusic
            item={item}
            togglePlay={togglePlay}
            isPlaying={currentMusicId === item.id.toString()}
        />
    );

    return (
        <View style={styles.container}>
            <FlatList
                style={styles.flatList}
                data={musicsList}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 53 }}
            />
        </View>
    );
};

export default MusicList;
