import React, { useState, useEffect, useRef, useContext } from "react";
import { FlatList, View, Animated, Easing } from "react-native";
import { Audio } from "expo-av"; // 🔊 Biblioteca de áudio

import CardMusic from "../../Components/cardMusic";
import { styles } from "./styles";
import { AuthContext } from "../../Context/AuthContext";

export default () => {
    const { likedSongs } = useContext(AuthContext);
    const [playerMusic, setPlayerMusic] = useState(null);
    const [currentMusicId, setCurrentMusicId] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState(null);
    const textAnimations = useRef({}).current;

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync(); // 🔄 Libera o som ao desmontar o componente
            }
        };
    }, [sound]);

    // 🔄 Configura animações iniciais para cada música
    useEffect(() => {
        likedSongs.forEach((item) => {
            if (!textAnimations[item.id]) {
                textAnimations[item.id] = {
                    title: new Animated.Value(0),
                    author: new Animated.Value(0),
                };
            }

            startTextAnimation(item.id); // 🔥 Inicia animação automaticamente
        });
    }, [likedSongs]);

    // ▶ Inicia animação do texto (infinita)
    const startTextAnimation = (id) => {
        if (!textAnimations[id]) return; // ⛔ Evita erro se a animação não existir ainda

        textAnimations[id].title.setValue(0);
        textAnimations[id].author.setValue(0);

        Animated.loop(
            Animated.sequence([
                Animated.timing(textAnimations[id].title, {
                    toValue: -150,
                    duration: 4000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(textAnimations[id].title, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(textAnimations[id].author, {
                    toValue: -150,
                    duration: 4000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(textAnimations[id].author, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    // 🎵 Alterna entre tocar/pausar a música
    const togglePlay = async (item) => {
        if (!item?.id || !item.url) return;

        if (currentMusicId === item.id) {
            if (sound) {
                if (isPlaying) {
                    await sound.pauseAsync();
                } else {
                    await sound.playAsync();
                }
                setIsPlaying(!isPlaying);
            }
        } else {
            if (sound) {
                await sound.unloadAsync();
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: item.url },
                { shouldPlay: true }
            );

            setSound(newSound);
            setCurrentMusicId(item.id);
            setPlayerMusic(item);
            setIsPlaying(true);
        }
    };

    const renderItem = ({ item }) => {
        if (!item?.id) return null;

        // ⚠ Garante que as animações foram inicializadas corretamente
        if (!textAnimations[item.id]) {
            textAnimations[item.id] = {
                title: new Animated.Value(0),
                author: new Animated.Value(0),
            };
            startTextAnimation(item.id);
        }

        return (
            <CardMusic
                item={item}
                togglePlay={togglePlay}
                isPlaying={currentMusicId === item.id && isPlaying}
                animation={textAnimations[item.id]}
            />
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                style={styles.flatList}
                data={likedSongs}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
};
