import React, { useState, useEffect, useRef } from "react";
import { FlatList, View, Animated, Easing } from "react-native";
import { Audio } from "expo-av"; // 🔊 Biblioteca de áudio

import CardMusic from "../../Components/cardMusic";
import { styles } from "./styles";
import { Auth, db } from "../../Services/firebaseConfig"; // Certifique-se de que o Firebase está configurado corretamente
import { doc, onSnapshot } from "firebase/firestore"; // Funções do Firestore

export default () => {
    const [likedSongs, setLikedSongs] = useState([]); // Estado para as músicas curtidas
    const [playerMusic, setPlayerMusic] = useState(null);
    const [currentMusicId, setCurrentMusicId] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState(null);
    const textAnimations = useRef({}).current;

    useEffect(() => {
        // Verificar se o usuário está autenticado antes de tentar buscar as músicas
        if (Auth.currentUser?.uid) {
            const userRef = doc(db, "users", Auth.currentUser.uid); // Referência ao documento do usuário

            const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
                const data = docSnapshot.data();
                const likedSongs = data?.likedSongs || [];
                setLikedSongs(likedSongs); // Atualiza o estado com as músicas curtidas em tempo real
            });

            // Limpar o listener quando o componente for desmontado
            return () => unsubscribe();
        }
    }, [Auth.currentUser?.uid]); // A dependência é o `uid` do usuário autenticado

    // Configura animações iniciais para cada música
    useEffect(() => {
        likedSongs.forEach((item) => {
            if (!textAnimations[item.id]) {
                textAnimations[item.id] = {
                    title: new Animated.Value(0),
                    author: new Animated.Value(0),
                };
            }

            startTextAnimation(item.id); // Inicia animação automaticamente
        });
    }, [likedSongs]);

    // Inicia animação do texto (infinita)
    const startTextAnimation = (id) => {
        if (!textAnimations[id]) return; // Evita erro se a animação não existir ainda

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

    // Alterna entre tocar/pausar a música
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

        // Garante que as animações foram inicializadas corretamente
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
            />
        );
    };


    return (
        <View style={styles.container}>
            <FlatList
                contentContainerStyle={{ paddingBottom: 53, paddingTop: 3 }}
                style={styles.flatList}
                data={likedSongs}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
            />
        </View>
    );
};
