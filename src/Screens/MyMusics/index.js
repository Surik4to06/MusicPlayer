import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Audio } from "expo-av";
import { Ionicons } from '@expo/vector-icons';

import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Auth, db } from "../../Services/firebaseConfig";

import { styles } from "./styles";

export default () => {
    const [userMusics, setUserMusics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [durations, setDurations] = useState({});

    const navigation = useNavigation();
    const route = useRoute();

    // Obtém o userId da rota ou usa o do usuário logado
    const userId = route.params?.userId || Auth.currentUser?.uid;

    useEffect(() => {
        if (userId) {
            fetchUserMusics();
        }
    }, [userId]);

    useEffect(() => {
        userMusics.forEach(music => {
            if (!durations[music.id]) {
                fetchMusicDuration(music);
            }
        });
    }, [userMusics]);

    const fetchUserMusics = () => {
        setLoading(true);

        try {
            const q = query(collection(db, "musics"), where("uidAuthor", "==", Auth.currentUser.uid));

            // Escuta mudanças em tempo real
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const musics = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setUserMusics(musics);
                setLoading(false);
            });

            // Retorna a função para cancelar a escuta ao desmontar o componente
            return () => unsubscribe();

        } catch (error) {
            console.error("Erro ao buscar músicas do usuário:", error);
            setLoading(false);
        }
    };

    const fetchMusicDuration = async (music) => {
        try {
            const { sound } = await Audio.Sound.createAsync(
                { uri: music.url },
                { shouldPlay: false }
            );

            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
                setDurations(prev => ({
                    ...prev,
                    [music.id]: status.durationMillis
                }));
            }

            await sound.unloadAsync();
        } catch (error) {
            console.log("Erro ao buscar duração da música:", error);
        }
    };

    //formata o tempo da musica
    const formatDuration = (millis) => {
        if (!millis) return '...';
        const totalSec = Math.floor(millis / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#FFF" />
            ) : userMusics.length > 0 ? (
                <FlatList
                    contentContainerStyle={{ paddingBottom: 61 }}
                    data={userMusics}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => {
                                navigation.navigate('PlayerMusic', { playerMusic: item })
                            }}
                            style={styles.musicsItem}>
                            <View>
                                <View style={styles.playBtnMusic}>
                                <Ionicons name="play" color='#FFF' size={30} style={{marginLeft: 3}} />
                                </View>
                                {item.thumbnail ?
                                    <Image source={{ uri: item.thumbnail }} style={{ width: 80, height: 80, borderRadius: 15, backgroundColor: '#AAA' }} />
                                    :
                                    <Image source={require('../../../assets/musica.png')} style={{ width: 80, height: 80, borderRadius: 15, backgroundColor: '#AAA' }} />
                                }
                            </View>
                            <View style={styles.musicData}>
                                <Text numberOfLines={1} style={styles.title}>{item.title || 'Sem título'}</Text>
                                <Text style={styles.author}>{item.author || 'Desconhecido'}</Text>
                                <Text style={styles.duration}>{formatDuration(durations[item.id])}</Text>
                            </View>
                        </Pressable>
                    )}
                />
            ) : (
                <Text style={styles.emptyText}>Usuário não possui nenhuma música</Text>
            )}
        </View>
    );
};
