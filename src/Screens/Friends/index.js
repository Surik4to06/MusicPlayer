import React, { useContext, useEffect, useState } from "react";
import { FlatList, Pressable, View, Image, Text } from "react-native";
import { getDoc, doc, collection, query, where, getDocs } from "firebase/firestore";
import { Auth, db } from "../../Services/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import markMessagesAsRead from "../../Services/markMessagesAsRead"; 
import { styles } from "./styles";
import { AuthContext } from "../../Context/AuthContext";

export default () => {

    const {setTotalUnreadMessages} = useContext(AuthContext);

    const [friendsList, setFriendsList] = useState([]);
    const [unreadMessages, setUnreadMessages] = useState({});
    const currentUser = Auth.currentUser;
    const navigation = useNavigation();

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (!userSnap.exists()) return;

                const following = userSnap.data().following || [];
                let mutualFriends = [];

                for (const friend of following) {
                    const isMutual = await checkMutualFollow(currentUser.uid, friend.uid);
                    if (isMutual) {
                        mutualFriends.push(friend);
                    }
                }

                setFriendsList(mutualFriends);
            } catch (error) {
                console.error("Erro ao buscar amigos:", error);
            }
        };

        fetchFriends();
    }, []);

    useEffect(() => {
        if (friendsList.length > 0) {
            fetchAllUnreadMessages(friendsList);
        }
    }, [friendsList]);

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

    const fetchUnreadMessages = async (chatId, friendId) => {
        try {
            if (!chatId || !friendId) return 0;

            const messagesRef = collection(db, `chats/${chatId}/messages`);
            const q = query(
                messagesRef,
                where("to", "==", currentUser.uid),
                where("senderId", "==", friendId),
                where("isRead", "==", false)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.size;
        } catch (error) {
            console.error("Erro ao buscar mensagens não lidas:", error);
            return 0;
        }
    };

    const fetchAllUnreadMessages = async (friends) => {
        const newUnreadMessages = {};
        let totalUnreadFriends = 0;

        await Promise.all(
            friends.map(async (friend) => {
                const friendId = friend.uid;
                const chatId = [currentUser.uid, friendId].sort().join("_");
                if (!friendId) return;

                const count = await fetchUnreadMessages(chatId, friendId);
                newUnreadMessages[friendId] = count;
                if (count > 0) totalUnreadFriends += 1;
            })
        );

        setUnreadMessages(newUnreadMessages);
        setTotalUnreadMessages(totalUnreadFriends);
    };

    const handleOpenChat = async (friend) => {
        const chatId = [currentUser.uid, friend.uid].sort().join("_");
        await markMessagesAsRead(chatId, friend.uid, currentUser.uid);
        
        setUnreadMessages((prevState) => ({ ...prevState, [friend.uid]: 0 }));
        setTotalUnreadMessages((prevTotal) => prevTotal - (unreadMessages[friend.uid] || 0));
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

    return (
        <View style={styles.container}>
            <FlatList
                data={friendsList}
                keyExtractor={(item) => item.uid}
                renderItem={renderItem}
            />
        </View>
    );
};