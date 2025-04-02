import React, { useContext, useEffect, useState } from "react";
import { FlatList, Pressable, View, Image, Text, ActivityIndicator, TextInput } from "react-native";
import { getDoc, doc, collection, query, where, onSnapshot } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

import { Auth, db } from "../../Services/firebaseConfig";
import markMessagesAsRead from "../../Services/markMessagesAsRead"; 
import { AuthContext } from "../../Context/AuthContext";

import { styles } from "./styles";

export default () => {
    const { setTotalUnreadMessages, friendsList, setFriendsList } = useContext(AuthContext);
    const [unreadMessages, setUnreadMessages] = useState({});
    const [isLoading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');  // Estado para armazenar o texto de pesquisa
    const [filteredFriends, setFilteredFriends] = useState(friendsList);  // Estado para armazenar amigos filtrados

    const currentUser = Auth.currentUser;
    const navigation = useNavigation();

    useEffect(() => {
        if (!currentUser) return;
        setLoading(true);

        const userRef = doc(db, "users", currentUser.uid);
    
        // Ouve mudanças na lista de amigos em tempo real
        const unsubscribe = onSnapshot(userRef, async (userSnap) => {
            if (!userSnap.exists()) return;
    
            const following = userSnap.data().following || [];
            let mutualFriends = [];
    
            for (const friend of following) {
                const isMutual = await checkMutualFollow(currentUser.uid, friend.uid);
                if (isMutual) {
                    mutualFriends.push(friend);
                }
            }
    
            // Escutar mudanças nos perfis dos amigos em tempo real
            const updatedFriends = await Promise.all(mutualFriends.map(async (friend) => {
                return new Promise((resolve) => {
                    const friendRef = doc(db, "users", friend.uid);
                    const unsubscribeFriend = onSnapshot(friendRef, (friendSnap) => {
                        if (friendSnap.exists()) {
                            resolve({ ...friend, ...friendSnap.data() });
                        } else {
                            resolve(friend);
                        }
                    });
    
                    return () => unsubscribeFriend(); // Remove listener ao desmontar
                });
            }));
    
            setFriendsList(updatedFriends);
            setFilteredFriends(updatedFriends);
            setLoading(false);
        });
    
        return () => unsubscribe();
    }, []);
    

    useEffect(() => {
        if (friendsList.length > 0) {
            listenForUnreadMessages(friendsList);
        }
    }, [friendsList]);

    useEffect(() => {
        // Atualiza o número total de conversas não lidas
        const totalUnreadFriends = Object.values(unreadMessages).filter(count => count > 0).length;
        setTotalUnreadMessages(totalUnreadFriends);
    }, [unreadMessages]);

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

    const listenForUnreadMessages = (friends) => {
        friends.forEach((friend) => {
            const chatId = [currentUser.uid, friend.uid].sort().join("_");
            const messagesRef = collection(db, `chats/${chatId}/messages`);
            const q = query(messagesRef, where("to", "==", currentUser.uid), where("isRead", "==", false));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                setUnreadMessages(prevState => ({
                    ...prevState,
                    [friend.uid]: snapshot.size,
                }));
            });

            return unsubscribe;
        });
    };

    const handleOpenChat = async (friend) => {
        const chatId = [currentUser.uid, friend.uid].sort().join("_");
        await markMessagesAsRead(chatId, friend.uid, currentUser.uid);

        setUnreadMessages((prevState) => ({ ...prevState, [friend.uid]: 0 }));
    };

    const renderItem = ({ item }) => {
        const amountMessages = unreadMessages[item.uid] || 0;

        return (
            <Pressable onPress={() => {
                handleOpenChat(item);
                navigation.navigate("TopTab", {
                    userId: currentUser.uid,
                    friendId: item.uid,
                    photo: item.photo,
                    friendUsername: item.displayName,
                });
            }} style={styles.containerCard}>
                {amountMessages > 0 && (
                    <Text style={styles.amountMessages}>{amountMessages}</Text>
                )}

                <View style={{ flexDirection: "row", flex: 1 }}>
                    <Image source={{ uri: item.photo }} style={styles.profileImage} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.username}>{item.displayName}</Text>
                        <Text style={styles.lastMessage}>👥 Amigos mútuos</Text>
                    </View>
                </View>
                <View style={styles.lineContainer} />
            </Pressable>
        );
    };

    // Função para filtrar amigos baseado no nome
    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text === '') {
            setFilteredFriends(friendsList);
        } else {
            const filtered = friendsList.filter(friend => 
                friend.displayName.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredFriends(filtered);
        }
    };

    return (
        <View style={styles.container}>
            {/* Campo de Pesquisa */}
            <TextInput
                style={styles.searchInput}
                placeholder="Filtrar amigos..."
                value={searchQuery}
                onChangeText={handleSearch}
            />
            {/* Se a lista ainda estiver carregando */}
            {isLoading && <ActivityIndicator style={styles.loading} color='#FFF' size="large" />}

            <FlatList
                data={filteredFriends} 
                keyExtractor={(item) => item.uid}
                renderItem={renderItem}
            />
        </View>
    );
};
