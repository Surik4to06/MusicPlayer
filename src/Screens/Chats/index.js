import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, Pressable, FlatList, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { styles } from "./styles";
import { Auth } from "../../Services/firebaseConfig";
import getMessages from "../../Services/getMessages";
import sendMessage from "../../Services/sendMensage";
import getUnreadMessagesCount from "../../Services/getUnreadMessagesCount";
import { useNavigation } from "@react-navigation/native";

export default ({ friendId, photo, friendUsername }) => {
    const currentUser = Auth.currentUser;
    const navigation = useNavigation();
    const chatId = [currentUser.uid, friendId].sort().join("_");

    const flatListRef = useRef(null);
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchMessages = async () => {
            const msgs = await getMessages(chatId);
            setMessages(msgs.reverse()); // Sempre inverter para manter a ordem correta
        };

        fetchMessages();
    }, []);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            const count = await getUnreadMessagesCount(currentUser.uid);
            setUnreadCount(count);
        };

        fetchUnreadCount();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]); // Garante que a rolagem ocorra sempre que novas mensagens forem carregadas

    const scrollToBottom = () => {
        flatListRef.current?.scrollToEnd({ animated: true });
    };

    const handleSend = async () => {
        if (newMessage.trim() !== "") {
            await sendMessage(chatId, currentUser.uid, friendId, newMessage);
            setNewMessage("");

            // Busca novamente as mensagens e mantém a ordem correta
            const updatedMessages = await getMessages(chatId);
            setMessages(updatedMessages.reverse()); // Inverte para manter o estilo WhatsApp
            scrollToBottom(); // Role para o final após enviar
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.mensages}>
            <Text>{item.text}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Cabeçalho */}
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

            {/* Lista de mensagens */}
            <FlatList
                style={styles.flatList}
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                inverted // Garante que as mensagens novas aparecem embaixo
            />

            {/* Campo de envio */}
            <View style={styles.footer}>
                <TextInput
                    style={styles.input}
                    placeholder="Mensagem"
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholderTextColor="#FFF"
                />
                <Pressable style={styles.btnSendMensage} onPress={handleSend}>
                    <Ionicons name="send" color="#FFF" size={25} />
                </Pressable>
            </View>
        </View>
    );
};
