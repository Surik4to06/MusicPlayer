import React, { useEffect, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, BackHandler, Animated, FlatList, TextInput, Modal } from "react-native";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import { getDoc, updateDoc, doc, arrayUnion, onSnapshot, query, collection, where, addDoc, serverTimestamp, arrayRemove } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { Auth, db, storage } from "../../Services/firebaseConfig";
import { downloadMusic } from '../../Services/downloadMusics';
import { styles } from './styles';
import LikeButton from "../animatedLikeButton";

const PlayerMusic = ({ route }) => {
    const { playerMusic } = route.params;

    const navigation = useNavigation();

    const [newMessage, setNewMessage] = useState(""); // Mensagem a ser enviada
    const [sound, setSound] = useState(null);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(1);
    const [bottomSheetHeightPlaylist, setBottomSheetHeightPlaylist] = useState(new Animated.Value(0));
    const [bottomSheetHeightChat, setBottomSheetHeightChat] = useState(new Animated.Value(0));
    const popupAnim = useState(new Animated.Value(0))[0]; // Para controlar a opacidade
    const [likedSongs, setLikedSongs] = useState([]);
    const [likedMusicLength, setLikedMusicLength] = useState(0);
    const [playlists, setPlaylists] = useState([]); // Para armazenar as playlists do usuário
    const [messages, setMessages] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [shareModalVisible, setShareModalVisible] = useState(false); // Controle do modal
    const [musicSettings, setMusicSettings] = useState(false);
    const [showPopup, setShowPopup] = useState(false);


    // Verifica se a música está curtida pelo usuário atual
    const isLiked = likedSongs.some((song) => song.id === playerMusic.id && song.uid === Auth.currentUser.uid);

    // Busca amigos para compartilhar a musica
    const currentUser = Auth.currentUser;

    useEffect(() => {
        const musicRef = doc(db, 'musics', playerMusic.id); // ID da música
        const unsubscribe = onSnapshot(musicRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const likedBy = data.likedBy || [];
                setLikedMusicLength(likedBy.length); // quantidade de likes
            }
        });

        return () => unsubscribe();
    }, [playerMusic.id]);

    useEffect(() => {
        if (!currentUser) return;

        const userRef = doc(db, "users", currentUser.uid);

        // Ouve mudanças na lista de amigos em tempo real
        const unsubscribe = onSnapshot(userRef, async (userSnap) => {
            if (!userSnap.exists()) return;

            const following = userSnap.data().following || [];
            let mutualFriends = [];

            // Verifica quais amigos seguem de volta (amizade mútua)
            for (const friend of following) {
                const isMutual = await checkMutualFollow(currentUser.uid, friend.uid);
                if (isMutual) {
                    mutualFriends.push(friend);
                }
            }

            // Busca dados atualizados dos amigos
            const updatedFriends = await Promise.all(mutualFriends.map(async (friend) => {
                const friendRef = doc(db, "users", friend.uid);
                return new Promise((resolve) => {
                    const unsubscribeFriend = onSnapshot(friendRef, (friendSnap) => {
                        if (friendSnap.exists()) {
                            resolve({ ...friend, ...friendSnap.data() });
                        } else {
                            resolve(friend); // Se o amigo for deletado, mantém os dados antigos
                        }
                    });

                    return () => unsubscribeFriend(); // Remove listener ao desmontar
                });
            }));

            setFriendsList(updatedFriends);
        });

        return () => unsubscribe(); // Remove o listener ao desmontar
    }, []);

    const checkMutualFollow = async (userId1, userId2) => {
        try {
            const user2Ref = doc(db, "users", userId2);
            const user2Snap = await getDoc(user2Ref);
            if (!user2Snap.exists()) return false;
            return user2Snap.data().following?.some(following => following.uid === userId1) || false;
        } catch (error) {
            console.error("Erro ao verificar follow mútuo:", error);
            return false;
        }
    };

    useEffect(() => {
        // Verificar as músicas curtidas em tempo real
        const unsubscribe = checkLikedSongsRealTime();

        // Limpar o listener quando a tela for fechada
        return () => unsubscribe();
    }, []);

    // Carregar as playlists do usuário ao montar o componente
    useEffect(() => {
        const unsubscribe = onSnapshot(query(collection(db, "playlists"), where("members", "array-contains", Auth.currentUser.uid)), (snapshot) => {
            setPlaylists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, []);

    // Carregar chat da musica
    useEffect(() => {
        const chatRef = collection(db, "chats", playerMusic.id, "messages");
        const q = query(chatRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, [playerMusic.id]);

    useEffect(() => {
        const loadMusic = async () => {
            try {
                const { sound, status } = await Audio.Sound.createAsync(
                    { uri: playerMusic.url },
                    { shouldPlay: false }
                );
                setSound(sound);
                setDuration(status.durationMillis || 1);
                sound.setOnPlaybackStatusUpdate(updateStatus);
            } catch (error) {
                console.error("Erro ao carregar música:", error);
            }
        };

        loadMusic();

        return () => {
            if (sound) {
                sound.stopAsync();
                sound.unloadAsync();
            }
        };
    }, [playerMusic.url]);

    useEffect(() => {
        const backAndPauseMusic = () => {
            if (sound) {
                sound.pauseAsync();
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAndPauseMusic);
        return () => backHandler.remove();
    }, [sound]);

    // verifica em tempo real se a musica foi curtida
    const checkLikedSongsRealTime = () => {
        const userId = Auth.currentUser.uid;
        const userRef = doc(db, "users", userId);

        const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
            const likedSongs = docSnapshot.data()?.likedSongs || [];
            setLikedSongs(likedSongs); // Atualiza o estado com as músicas curtidas em tempo real
        });

        return unsubscribe; // Retorne a função de unsubscribe para quando não precisar mais ouvir as mudanças
    };

    const handleToggleLike = async () => {
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.4, duration: 100, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
      
        await playSound();
      
        toggleLikedSong(playerMusic, setLikedSongs); // APENAS setLiked aqui
      };

    // enviar mensagens 
    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const chatRef = collection(db, "chats", playerMusic.id, "messages");

        await addDoc(chatRef, {
            text: newMessage,
            sender: Auth.currentUser.displayName,
            senderUid: Auth.currentUser.uid,
            senderPhoto: Auth.currentUser.photoURL,
            timestamp: serverTimestamp(),
        });

        setNewMessage(""); // Limpa o campo após enviar
    };

    const showSharedPopup = () => {
        setShowPopup(true);
        Animated.timing(popupAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setTimeout(() => {
                Animated.timing(popupAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => setShowPopup(false));
            }, 2000);
        });
    };

    const handleSendMusic = async (musicData, friendId) => {
        const chatId = [Auth.currentUser.uid, friendId].sort().join("_");
        if (!musicData) return;

        const message = {
            senderId: Auth.currentUser.uid,
            to: friendId,
            type: "music",
            timestamp: serverTimestamp(),
            isRead: false,
            music: {
                id: musicData.id,
                title: musicData.title,
                author: musicData.author,
                thumbnail: musicData.thumbnail,
                url: musicData.url,
            }
        };

        const messagesRef = collection(db, `chats/${chatId}/messages`);
        await addDoc(messagesRef, message);

        showSharedPopup();
    };



    const updateStatus = (status) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 1);
            setIsPlaying(status.isPlaying);
        }
    };

    const togglePlayPause = async () => {
        if (sound) {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleBottomSheetPlaylist = () => {
        Animated.timing(bottomSheetHeightPlaylist, {
            toValue: bottomSheetHeightPlaylist._value === 0 ? 500 : 0,
            duration: 300,
            useNativeDriver: false, // Usa a animação nativa para melhorar o desempenho
        }).start();
    };

    const toggleBottomSheetChat = () => {
        Animated.timing(bottomSheetHeightChat, {
            toValue: bottomSheetHeightChat._value === 0 ? 500 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    // Atualiza a playlist ao adicionar ou remover música
    const addSongToPlaylist = async (playlistId) => {
        if (!playerMusic?.id || !playerMusic?.url) return;

        const playlistRef = doc(db, "playlists", playlistId);
        const playlistDoc = await getDoc(playlistRef);

        if (!playlistDoc.exists()) {
            console.error("Playlist não encontrada!");
            return;
        }

        const playlistData = playlistDoc.data();
        const songExists = playlistData.songs?.some((song) => song.id === playerMusic.id);

        if (songExists) {
            // Remover a música da playlist
            await updateDoc(playlistRef, {
                songs: playlistData.songs.filter((song) => song.id !== playerMusic.id)
            });
        } else {
            try {
                // Upload da música para o Firebase Storage
                const response = await fetch(playerMusic.url);
                const blob = await response.blob();

                const storageRef = ref(storage, `playlistMusics/${playerMusic.id}.mp3`);
                await uploadBytes(storageRef, blob);

                const downloadUrl = await getDownloadURL(storageRef);

                const songToAdd = {
                    id: playerMusic.id,
                    title: playerMusic.title,
                    author: playerMusic.author,
                    thumbnail: playerMusic.thumbnail,
                    url: downloadUrl,
                    addedBy: Auth.currentUser.displayName,
                    addedByUid: Auth.currentUser.uid,
                };

                await updateDoc(playlistRef, {
                    songs: arrayUnion(songToAdd),
                });
            } catch (error) {
                console.error("Erro ao fazer upload da música:", error);
            }
        }
    };

    const renderItemPlaylist = ({ item }) => {
        const songInPlaylist = item.songs.some((song) => song.id === playerMusic.id);

        return (
            <Pressable onPress={() => addSongToPlaylist(item.id)} style={styles.playlistItem}>

                {item.thumbnail === null ?
                    <Image source={require('../../../assets/musica.png')} style={styles.playlistThumbnail} />
                    :
                    <Image source={{ uri: item.thumbnail }} style={styles.playlistThumbnail} />
                }
                <View style={{ marginLeft: 5 }}>

                    <Text numberOfLines={1} style={styles.playlistName}>{item.name}</Text>
                    <View style={styles.addButton}>
                        <Ionicons
                            name={songInPlaylist ? "remove-circle-outline" : "add-circle-outline"}
                            size={28}
                            color={songInPlaylist ? 'red' : 'lightgreen'}
                            style={{ marginRight: 5 }}
                        />
                        <Text style={styles.addButtonText}>{songInPlaylist ? "Remover música" : "Adicionar música"}</Text>
                    </View>
                </View>
            </Pressable>
        );
    };

    const renderItemChat = ({ item }) => (
        <View style={styles.messageContainer}>
            <Image source={{ uri: item.senderPhoto }} style={styles.userPhoto} />
            <View style={styles.messageBox}>
                <Text style={styles.senderName}>{item.sender}</Text>
                <Text style={styles.messageText}>{item.text}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Image blurRadius={6} source={{ uri: playerMusic.thumbnail }} style={StyleSheet.absoluteFillObject} />

            {/* Botão pra voltar a tela */}
            <Pressable style={styles.backButton} onPress={async () => {
                navigation.goBack();
                await sound.pauseAsync();
            }}>
                <Ionicons style={{ marginLeft: -3 }} name="chevron-back-outline" size={30} color="#FFF" />
            </Pressable>

            {/* Botão pra editar a musica caso ela seja do usuario */}
            {currentUser.uid === playerMusic.uidAuthor &&
                <Pressable style={[styles.backButton, { right: 20, left: 'none' }]} onPress={() => {
                    navigation.navigate("EditMusic", {
                        musicData: playerMusic
                    });
                }}>
                    <Ionicons name="settings-outline" size={30} color="#FFF" />
                </Pressable>
            }

            <View style={styles.content}>
                {playerMusic.thumbnail === null ?
                    <Image source={require('../../../assets/musica.png')} style={[styles.image, { backgroundColor: '#BCBCBC' }]} />
                    :
                    <Image source={{ uri: playerMusic.thumbnail }} style={styles.image} />
                }
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 30 }}>
                    <View style={{ width: 290, gap: 10 }}>
                        <Text numberOfLines={2} style={styles.title}>{playerMusic.title}</Text>
                        <Text style={styles.author}>{playerMusic.author}</Text>
                    </View>

                    <View style={styles.containerBtns}>
                        <Pressable onPress={() => {handleToggleLike}}>
                            <LikeButton song={playerMusic} />
                        </Pressable>

                        <Pressable onPress={toggleBottomSheetChat}>
                            <Ionicons name="chatbubble-ellipses-outline" size={37} color='#FFF' />
                        </Pressable>

                        <Pressable onPress={toggleBottomSheetPlaylist}>
                            <Ionicons name="musical-notes-outline" size={37} color='#FFF' />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.sliderContainer}>
                    <Text style={styles.timeText}>{(position / 60000).toFixed(2)}</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={duration}
                        value={position}
                        minimumTrackTintColor="#1db954"
                        maximumTrackTintColor="#ffffff"
                        thumbTintColor="#1db954"
                        onSlidingComplete={(value) => sound.setPositionAsync(value)}
                    />
                    <Text style={styles.timeText}>{(duration / 60000).toFixed(2)}</Text>
                </View>

                <Pressable style={styles.playButton} onPress={togglePlayPause}>
                    {isPlaying ? (
                        <Ionicons name="pause" size={50} color="#FFF" />
                    ) : (<Ionicons style={{ marginLeft: 3 }} name="play" size={50} color="#FFF" />)}
                </Pressable>

                {/* boões da parte de baixo do player */}
                <Pressable style={[styles.btnListMusics, { right: 'none', left: 20 }]} onPress={() => {
                    const musicUrl = playerMusic.url;
                    const fileName = playerMusic.title; // Nome do arquivo salvo no celular
                    downloadMusic(musicUrl, fileName);
                }}>
                    <Image source={require('../../../assets/downloads.png')} style={{ width: 30, height: 30 }} />
                </Pressable>
                <Pressable style={styles.btnListMusics} onPress={() => setShareModalVisible(true)}>
                    <Ionicons name="arrow-redo-outline" color="#FFF" size={40} />
                </Pressable>
            </View>

            {/* Bottom */}
            <Animated.View style={[styles.bottomSheet, { height: bottomSheetHeightPlaylist }]}>
                <Pressable onPress={toggleBottomSheetPlaylist} style={styles.close}>
                    <Ionicons name="close" size={37} color="#FFF" />
                </Pressable>

                <Text style={styles.bottomSheetText}>Minhas Playlists</Text>

                <FlatList
                    data={playlists}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItemPlaylist}
                />
            </Animated.View>

            <Animated.View style={[styles.bottomSheet, { height: bottomSheetHeightChat }]}>
                <Pressable onPress={toggleBottomSheetChat} style={styles.close}>
                    <Ionicons name="close" size={37} color="#FFF" />
                </Pressable>

                <Text style={styles.bottomSheetText}>Chat</Text>

                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItemChat}
                    inverted={true}
                />
                <View style={styles.sendMessageContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite sua mensagem..."
                        placeholderTextColor="#ccc"
                        value={newMessage}
                        onChangeText={setNewMessage}
                    />
                    <Pressable onPress={sendMessage} style={styles.sendButton}>
                        <Ionicons name="send" size={24} color="#FFF" />
                    </Pressable>
                </View>

            </Animated.View>

            {/* Modal para Exibir Amigos que o Seguem de Volta */}
            <Modal
                visible={shareModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShareModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>

                        <Text style={{ color: '#FFF', fontSize: 20, textAlign: 'left', width: '100%' }}>Compartilhar com... </Text>
                        <Pressable
                            style={styles.closeButtonText}
                            onPress={() => setShareModalVisible(false)}
                        >
                            <Ionicons name="close" color="#FFF" size={40} />
                        </Pressable>

                        <FlatList
                            data={friendsList}
                            keyExtractor={(item) => item.uid}
                            contentContainerStyle={{ marginTop: 10 }}
                            renderItem={({ item }) => (
                                <View style={styles.friendItem}>
                                    <Pressable
                                        style={styles.containerItems}
                                        onPress={() => handleSendMusic(playerMusic, item.uid)}>

                                        <Image source={{ uri: item.wallpaper }} style={[StyleSheet.absoluteFillObject, { borderRadius: 10, backgroundColor: 'gray' }]} />

                                        <Image source={{ uri: item.photo }} style={styles.friendImage} />

                                        <Text style={styles.friendName}>{item.displayName}</Text>

                                    </Pressable>
                                </View>
                            )}
                        />
                    </View>
                </View>

                {/* Popup de feedback pra aparecer que foi compartilhada a musica */}
                {showPopup && (
                    <Animated.View
                        style={{
                            position: "absolute",
                            bottom: 40,
                            left: 0,
                            right: 0,
                            alignItems: "center",
                            opacity: popupAnim,
                            transform: [{
                                translateY: popupAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [20, 0],
                                })
                            }],
                            zIndex: 999999999,
                        }}
                    >
                        <View style={{
                            backgroundColor: "#222",
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 20,
                        }}>
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>Música compartilhada com sucesso!</Text>
                        </View>
                    </Animated.View>
                )}
            </Modal>

            {/* Modal para permitir edição da musica pelo usuario mesmo após ja publicar */}

            <Modal
                visible={musicSettings}
                animationType="slide"
                transparent={true}>

                <Pressable
                    style={styles.modalBackground}
                    onPress={() => setMusicSettings(false)}>

                    <View style={styles.modalSettings}><Text style={{ color: '#FFF' }}>teste pra saber onde sa porra ta kkkk</Text></View>

                </Pressable>
            </Modal>

        </View>
    );
};

export default PlayerMusic;
