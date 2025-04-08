import React, { useState, useEffect, useRef } from "react";
import { FlatList, View, Animated, Easing, Text } from "react-native";
import { Audio } from "expo-av";
import CardMusic from "../../Components/cardMusic";
import { styles } from "./styles";
import { Auth, db } from "../../Services/firebaseConfig";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

export default () => {
    const [likedSongs, setLikedSongs] = useState([]);
    const [playerMusic, setPlayerMusic] = useState(null);
    const [currentMusicId, setCurrentMusicId] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState(null);
    const textAnimations = useRef({}).current;

    useEffect(() => {
        let unsubscribe;

        const loadLikedSongs = () => {
            if (!Auth.currentUser?.uid) return;

            const userRef = doc(db, "users", Auth.currentUser.uid);
            unsubscribe = onSnapshot(userRef, async (docSnap) => {
                const data = docSnap.data();
                const likedRefs = data?.likedSongs || [];

                // Busca os dados atualizados das músicas curtidas
                const songsPromises = likedRefs.map(async (ref) => {
                    const musicDoc = await getDoc(doc(db, "musics", ref.id));
                    if (musicDoc.exists()) {
                        return { id: musicDoc.id, ...musicDoc.data() };
                    }
                    return null;
                });

                const songs = (await Promise.all(songsPromises)).filter(Boolean);
                setLikedSongs(songs); // Atualiza de forma limpa
            });
        };

        loadLikedSongs();
        return () => unsubscribe?.();
    }, []);

    useEffect(() => {
        likedSongs.forEach((item) => {
            if (!textAnimations[item.id]) {
                textAnimations[item.id] = {
                    title: new Animated.Value(0),
                    author: new Animated.Value(0),
                };
            }
            startTextAnimation(item.id);
        });
    }, [likedSongs]);

    const startTextAnimation = (id) => {
        if (!textAnimations[id]) return;

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
            {likedSongs.length <= 0 ? (
                <Text style={{ color: '#FFF', fontSize: 18, textAlign: 'center' }}>
                    Você ainda não possui nenhuma música curtida :(
                </Text>
            ) : (
                <FlatList
                    contentContainerStyle={{ paddingBottom: 53, paddingTop: 3 }}
                    style={styles.flatList}
                    data={likedSongs}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                />
            )}
        </View>
    );
};
