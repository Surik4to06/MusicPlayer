import React, { useContext, useState, useEffect } from "react";
import { View, FlatList, Animated, Easing } from "react-native";
import { Audio } from "expo-av";

import { styles } from "./styles";
import { AuthContext } from "../../Context/AuthContext";

import CardMusic from "../../Components/cardMusic";
import { useNavigation } from "@react-navigation/native";

const MusicList = () => {

    const { musicsList } = useContext(AuthContext);

    const [playerMusic, setPlayerMusic] = useState(null);
    const [currentSound, setCurrentSound] = useState(null);
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

    const togglePlay = async (item) => {
        if (currentSound) {
            await currentSound.stopAsync();
            await currentSound.unloadAsync();
            setCurrentSound(null);
            setCurrentMusicId(null);
        }

        if (currentMusicId === item.id) return;

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

    const renderItem = ({ item }) => {
        const isPlaying = currentMusicId === item.id;
        const animation = textAnimations[item.id] || {
            title: new Animated.Value(0),
            author: new Animated.Value(0)
        };

        return (
            <CardMusic
                item={item}
                setPlayerMusic={setPlayerMusic}
                togglePlay={togglePlay}
                isPlaying={isPlaying}
                animation={animation}
            />
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
        </View>
    );
};

export default MusicList;