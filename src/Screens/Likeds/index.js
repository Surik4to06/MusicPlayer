import React, { useState, useEffect, useRef, useContext } from "react";
import { FlatList, View, Animated, Easing } from "react-native";

import CardMusic from "../../Components/cardMusic";
import { styles } from "./styles";
import { AuthContext } from "../../Context/AuthContext";

export default () => {
    const { likedSongs, setLikedSongs } = useContext(AuthContext); // Garante que setLikedSongs está acessível
    const [playerMusic, setPlayerMusic] = useState(null);
    const [currentMusicId, setCurrentMusicId] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const textAnimations = useRef({}).current;

    console.log("Liked Songs Data:", likedSongs);

    // Garante que likedSongs seja um array válido e remove músicas duplicadas
    useEffect(() => {
        if (!Array.isArray(likedSongs)) {
            console.error("❌ likedSongs não é um array válido!");
            return;
        }

        // Remove músicas duplicadas pelo ID corretamente
        const uniqueSongs = likedSongs.filter(
            (song, index, self) => song?.id && index === self.findIndex((s) => s.id === song.id)
        );

        if (uniqueSongs.length !== likedSongs.length) {
            console.log("⚠️ Removendo músicas duplicadas...");
            setLikedSongs(uniqueSongs);
        }

        // Inicializa animações para cada música única
        uniqueSongs.forEach((music) => {
            if (music?.id && !textAnimations[music.id]) {
                textAnimations[music.id] = {
                    title: new Animated.Value(0),
                    author: new Animated.Value(0),
                };
            }
        });
    }, [likedSongs, setLikedSongs]);

    // Inicia a animação do texto
    const startTextAnimation = (id) => {
        if (textAnimations[id]) {
            textAnimations[id].title.stopAnimation();
            textAnimations[id].author.stopAnimation();

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
        }
    };

    // Alterna entre tocar/pausar música
    const togglePlay = (item) => {
        if (!item?.id) return;

        if (currentMusicId === item.id) {
            setIsPlaying(!isPlaying);
        } else {
            setCurrentMusicId(item.id);
            setPlayerMusic(item);
            setIsPlaying(true);
            startTextAnimation(item.id);
        }
    };

    // Renderiza o card de cada música
    const renderItem = ({ item }) => {
        if (!item?.id) return null; // Evita erro de undefined

        if (!textAnimations[item.id]) {
            textAnimations[item.id] = {
                title: new Animated.Value(0),
                author: new Animated.Value(0),
            };
        }

        return (
            <CardMusic
                item={item} // Passa corretamente o item
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
                data={likedSongs} // Garante que likedSongs seja um array
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()} // Garante uma chave única como string
            />
        </View>
    );
};
