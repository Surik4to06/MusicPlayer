import React, { useEffect, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, ScrollView, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Ionicons } from '@expo/vector-icons';
import { Audio } from "expo-av";

import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, collection, query, where } from "firebase/firestore";
import { Auth, db } from "../Services/firebaseConfig";

const ProfileScreen = ({ route }) => {
    const navigation = useNavigation();
    const currentUser = Auth.currentUser;
    const { userId } = route.params;
    const isCurrentUser = userId === currentUser.uid;

    const [userData, setUserData] = useState({});
    const [isFollowing, setIsFollowing] = useState(false);
    const [userMusics, setUserMusics] = useState([]);
    const [durations, setDurations] = useState({});

    useEffect(() => {
        if (!userId) return;

        // Referência para a coleção "musics" filtrando pelo "authorId"
        const musicsRef = collection(db, "musics");
        const q = query(musicsRef, where("uidAuthor", "==", userId));

        // Listener para atualizar em tempo real
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const musics = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUserMusics(musics);
        });

        return () => unsubscribe();
    }, [userId]);

    useEffect(() => {
        // Referência do documento do usuário no Firestore
        const userRef = doc(db, "users", userId);

        // Listener para monitorar mudanças em tempo real
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserData(data);
                setIsFollowing(data.followers.some(follower => follower.uid === currentUser.uid));
            }
        });

        // Remover listener ao desmontar o componente
        return () => unsubscribe();
    }, [userId]);

    useEffect(() => {
        userMusics.forEach(music => {
            if (!durations[music.id]) {
                fetchMusicDuration(music);
            }
        });
    }, [userMusics]);

    //pega a duração de cada musica
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


    const renderItem = ({ item }) => {
        return (
            <Pressable
                onPress={() => navigation.navigate("PlayerMusic", { playerMusic: item })}
                style={styles.musicsItem}>
                {item.thumbnail ?
                    <Image source={{ uri: item.thumbnail }} style={{ width: 80, height: 80, borderRadius: 15, backgroundColor: '#AAA' }} />
                    :
                    <Image source={require('../../assets/musica.png')} style={{ width: 80, height: 80, borderRadius: 15, backgroundColor: '#AAA' }} />
                }
                <View style={styles.musicData}>
                    <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
                    <Text style={styles.author}>{item.author}</Text>
                    <Text style={styles.duration}>{formatDuration(durations[item.id])}</Text>
                </View>
            </Pressable>
        );
    };

    const handleFollow = async () => {
        const userRef = doc(db, "users", userId);
        const currentUserRef = doc(db, "users", currentUser.uid);

        try {
            // Criar objeto do usuário logado
            const currentUserData = {
                uid: currentUser.uid,
                displayName: currentUser.displayName,
                photo: currentUser.photoURL
            };

            // Criar objeto do usuário seguido
            const followedUserData = {
                uid: userId,
                displayName: userData.displayName,
                photo: userData.photo
            };

            if (isFollowing) {
                // Remover seguidor e seguindo
                await updateDoc(userRef, {
                    followers: arrayRemove(currentUserData),
                    followersCount: Math.max(0, userData.followersCount - 1)
                });
                await updateDoc(currentUserRef, {
                    following: arrayRemove(followedUserData),
                    followingCount: Math.max(0, userData.followingCount - 1)
                });
            } else {
                // Adicionar seguidor e seguindo
                await updateDoc(userRef, {
                    followers: arrayUnion(currentUserData),
                    followersCount: userData.followersCount + 1
                });
                await updateDoc(currentUserRef, {
                    following: arrayUnion(followedUserData),
                    followingCount: userData.followingCount + 1
                });
            }
        } catch (error) {
            console.error("Erro ao atualizar seguidores:", error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.containerSecond}>
                {/* Botão voltar para a pesquisa */}
                <Pressable
                    style={styles.btnBack}
                    onPress={() => {
                        navigation.reset({
                            routes: [{ name: 'Main' }]
                        });
                    }}>
                    <Ionicons style={{ marginLeft: -3 }} name="chevron-back-outline" color='#FFF' size={30} />
                </Pressable>

                <Image source={{ uri: userData.wallpaper }} style={[StyleSheet.absoluteFillObject, { backgroundColor: '#96969696', position: 'absolute', top: 0, left: 0, zIndex: 1 }]} />

                <View style={styles.containerTerd}>
                    <Pressable>
                        <Image source={{ uri: userData.photo }} style={{ width: 150, height: 150, borderRadius: 999 }} />
                    </Pressable>

                    <Text style={styles.username}>{userData.displayName}</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '50%', marginTop: 10 }}>
                        <View>
                            <Text style={styles.numDados}>{userData.followersCount}</Text>
                            <Text style={styles.textDados}>Seguidores</Text>
                        </View>
                        <View>
                            <Text style={styles.numDados}>{userData.followingCount}</Text>
                            <Text style={styles.textDados}>Seguindo</Text>
                        </View>
                    </View>

                    {!isCurrentUser && (
                        <Pressable onPress={handleFollow} style={styles.btnProfile}>
                            <Text style={styles.btnProfileText}>{isFollowing ? "Deixar de Seguir" : "Seguir"}</Text>
                        </Pressable>
                    )}
                </View>
            </View>

            <Text style={{ color: '#FFF', backgroundColor: '#3c3c3c', textAlign: 'center', fontSize: 20, paddingVertical: 8 }}>Músicas</Text>
            <FlatList
                scrollEnabled={false}
                data={userMusics}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 3 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    btnBack: {
        position: 'absolute',
        left: 10,
        top: 10,
        width: 50,
        height: 50,
        backgroundColor: '#212121',
        zIndex: 999,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 999,
    },
    containerSecond: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 30,
    },
    containerTerd: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        zIndex: 10,
        backgroundColor: 'transparent',
        marginTop: 20
    },
    username: {
        fontSize: 23,
        marginTop: 10,
        color: "#FFF",
    },
    numDados: {
        fontSize: 18,
        textAlign: 'center',
        color: '#FFF',
    },
    textDados: {
        fontSize: 18,
        color: '#FFF',
    },
    btnProfile: {
        backgroundColor: '#353535',
        padding: 10,
        borderRadius: 15,
        marginTop: 20,
    },
    btnProfileText: {
        fontSize: 18,
        color: '#FFF',
    },
    containerTopTab: {
        flex: 1,
    },
    profileContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#000',
        zIndex: 2,
    },
    musicsItem: {
        flexDirection: 'row',
        backgroundColor: '#3c3c3c',
        padding: 3,
        paddingHorizontal: 5,
        borderRadius: 15,
        marginTop: 10,
    },
    musicData: {
        marginTop: 3,
        marginLeft: 20,
        width: '70%',
    },
    title: {
        color: '#FFF',
        fontSize: 18,
    },
    author: {
        color: '#b5b5b5',
    },
    duration: {
        color: '#b5b5b5',
        fontSize: 18,
        marginTop: 5,
    },
});


export default ProfileScreen;
