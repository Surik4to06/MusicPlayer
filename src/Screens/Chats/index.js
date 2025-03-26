import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, Pressable, FlatList, TextInput, Alert, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { styles } from "./styles";
import { Auth, db, storage } from "../../Services/firebaseConfig";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import sendMessage from "../../Services/sendMensage";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

export default ({ friendId, photo, friendUsername }) => {
    const currentUser = Auth.currentUser;

    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const flatListRef = useRef(null);
    const videoRef = useRef(null);

    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showVideo, setShowVideo] = useState(false);
    const [uriVideo, setUriVideo] = useState(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showPhoto, setShowPhoto] = useState(false);
    const [uriPhoto, setUriPhoto] = useState(null);

    const chatId = [currentUser.uid, friendId].sort().join("_");

    useEffect(() => {
        const messagesRef = collection(db, "chats", chatId, "messages");
        const q = query(messagesRef, orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setMessages(msgs);
            setTimeout(() => scrollToBottom(), 100);

            // Atualizar contagem de mensagens não lidas
            const unread = msgs.filter(msg => msg.to === currentUser.uid && !msg.isRead).length;
            setUnreadCount(unread);

            // Se a tela estiver focada, marca mensagens como lidas
            if (isFocused) {
                marcarMensagensComoLidas();
            }
        });

        return () => unsubscribe();
    }, [chatId]);

    useEffect(() => {
        if (isFocused) {
            marcarMensagensComoLidas();
        }
    }, [isFocused, messages]);

    // Controles de video
    const closeModal = () => {
        setShowVideo(false);
        if (videoRef.current) {
            videoRef.current.pauseAsync(); // Pausa ao fechar
            setIsPlaying(false);
        }
    };

    const VideoMessage = ({ uri }) => {
        return (
            <Pressable
                onPress={() => {
                    setShowVideo(true)
                    setUriVideo(uri)
                }}>
                <Video
                    ref={videoRef}
                    source={{ uri }}
                    style={{ width: 200, height: 200, borderRadius: 10 }}
                    resizeMode="contain"
                />
                <View style={styles.playVideo}>
                    <Ionicons name="play" color='#ccc' size={35} style={{ marginLeft: 3 }} />
                </View>
            </Pressable>
        );
    };

    // mostrar modal da foto em tela cheia

    const PhotoMessage = ({ uri }) => {
        return (
            <Pressable onPress={() => {
                setShowPhoto(true);
                setUriPhoto(uri);
            }}>
                <Image source={{ uri: uri }} style={{ width: 200, height: 200, borderRadius: 10 }} />
            </Pressable>
        );
    }

    // controle de mensagens nn lidas e lidas

    const marcarMensagensComoLidas = async () => {
        try {
            const chatDoc = doc(db, "chats", chatId);
            await updateDoc(chatDoc, {
                [`unread.${currentUser.uid}`]: 0 // Reseta contador de mensagens não lidas para esse usuário
            });

            // Atualiza cada mensagem individualmente como lida
            messages.forEach(async (msg) => {
                if (msg.to === currentUser.uid && !msg.isRead) {
                    const msgDoc = doc(db, "chats", chatId, "messages", msg.id);
                    await updateDoc(msgDoc, { isRead: true });
                }
            });
        } catch (error) {
            console.error("Erro ao marcar mensagens como lidas:", error);
        }
    };

    // controle de mensagens

    const scrollToBottom = () => {
        flatListRef.current?.scrollToEnd({ animated: true });
    };

    const handleSend = async () => {
        if (newMessage.trim() !== "") {
            await sendMessage(chatId, currentUser.uid, friendId, newMessage, "", "text");
            setNewMessage("");
            setTimeout(() => scrollToBottom(), 100);
        }
    };

    const pickMedia = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            await uploadMedia(result.assets[0].uri);
        }
    };

    // "abre" galeria para escolher a midia a ser enviada
    const uploadMedia = async (uri) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();

            const filename = `chats/${chatId}/${Date.now()}`;
            const mediaRef = ref(storage, filename);

            await uploadBytes(mediaRef, blob);
            const downloadURL = await getDownloadURL(mediaRef);

            const mediaType = uri.endsWith(".mp4") || uri.endsWith(".mov") ? "video" : "image";
            await sendMessage(chatId, currentUser.uid, friendId, "", downloadURL, mediaType);
        } catch (error) {
            Alert.alert("Erro", "Falha ao enviar mídia.");
        }
    };

    const renderItem = ({ item }) => (
        item.senderId === currentUser.uid ? (
            <View style={[styles.mensages, { justifyContent: 'flex-end' }]}>
                <View style={styles.messagesCurrentUser}>
                    {item.type === 'text' && <Text style={{ fontSize: 18 }}>{item.text}</Text>}
                    {item.type === 'image' && <PhotoMessage uri={item.mediaUrl} />}
                    {item.type === 'video' && <VideoMessage uri={item.mediaUrl} />}
                </View>
            </View>
        ) : (
            <View style={[styles.mensages]}>
                <Image source={{ uri: photo }} style={styles.friendPhotoMessage} />
                <View style={styles.friendMessages}>
                    {item.type === 'text' && <Text style={{ fontSize: 18 }}>{item.text}</Text>}
                    {item.type === 'image' && <PhotoMessage uri={item.mediaUrl} />}
                    {item.type === 'video' && <VideoMessage uri={item.mediaUrl} />}
                </View>
            </View>
        )
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={[styles.headerIcon, styles.btnBack]}>
                    <Ionicons name="chevron-back" size={34} color="#FFF" style={{ marginLeft: -3 }} />
                </Pressable>
                <View style={styles.headerFriendInfo}>
                    <Image source={{ uri: photo }} style={styles.friendPhoto} />
                    <Text style={styles.friendUsername}>{friendUsername}</Text>
                </View>
                <Ionicons name="ellipsis-horizontal" size={34} color="#FFF" style={styles.headerIcon} />
            </View>

            <FlatList
                style={styles.flatList}
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                onContentSizeChange={scrollToBottom}
                onLayout={scrollToBottom}
            />

            <View style={styles.footer}>
                <Pressable style={styles.btnMedia} onPress={pickMedia}>
                    <Ionicons name="image" color="#FFF" size={25} />
                </Pressable>
                <TextInput
                    style={styles.input}
                    placeholder="Mensagem"
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholderTextColor="#FFF"
                    multiline={true}
                />
                <Pressable style={styles.btnSendMensage} onPress={handleSend}>
                    <Ionicons name="send" color="#FFF" size={25} />
                </Pressable>
            </View>

            {/* Modal para exibir o vídeo */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showVideo}
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.videoContainer}>
                        {/* Vídeo */}
                        <Video
                            ref={videoRef}
                            source={{ uri: uriVideo }}
                            style={styles.video}
                            resizeMode="contain"
                            useNativeControls={true}
                            shouldPlay
                        />

                        {/* Botão de fechar */}
                        <Pressable onPress={closeModal} style={styles.closeButton}>
                            <Ionicons name="close" size={30} color="white" />
                        </Pressable>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={showPhoto}
            >
                <Pressable onPress={() => {
                    setShowPhoto(false)
                    }}
                    style={[{backgroundColor: "rgba(0, 0, 0, 0.8)"}, StyleSheet.absoluteFillObject]}/>
                <Image source={{ uri: uriPhoto }} style={styles.modalPhoto} />
            </Modal>
        </View>
    );
};
