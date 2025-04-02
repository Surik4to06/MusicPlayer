import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, Pressable, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, where, getDocs, addDoc, onSnapshot } from "firebase/firestore";
import { Auth, db } from "../../Services/firebaseConfig";

export default function PlaylistsScreen({ friendId }) {
    const currentUser = Auth.currentUser;
    const [playlists, setPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState("");

    // Acompanhamento em tempo real
    useEffect(() => {
        // Certifique-se de que o friendId está correto
        if (!friendId) {
            console.log("Erro: friendId não está definido");
            return;
        }

        const unsubscribe = onSnapshot(collection(db, "playlists"), (snapshot) => {
            const playlistsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const filteredPlaylists = playlistsList.filter(playlist => 
                playlist.members.includes(currentUser.uid) && playlist.members.includes(friendId) // Verifica se os dois estão na playlist
            );
            setPlaylists(filteredPlaylists);
        });

        return () => unsubscribe();
    }, [friendId]); // Certifique-se de que friendId é uma dependência do useEffect

    const createPlaylist = async () => {
        if (newPlaylistName.trim() === "") return;
        await addDoc(collection(db, "playlists"), {
            name: newPlaylistName,
            thumbnail: "https://via.placeholder.com/150", // Pode ser uma imagem padrão ou um upload
            songs: [],
            members: [currentUser.uid] // Inicialmente, apenas o usuário criador
        });
        setNewPlaylistName("");
    };

    const renderPlaylist = ({ item }) => (
        <Pressable style={styles.playlistContainer}>
            <Image source={{ uri: item.thumbnail }} style={styles.playlistImage} />
            <Text style={styles.playlistName}>{item.name}</Text>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={playlists}
                keyExtractor={(item) => item.id}
                renderItem={renderPlaylist}
            />
            <View style={styles.footer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nova Playlist"
                    value={newPlaylistName}
                    onChangeText={setNewPlaylistName}
                />
                <Pressable style={styles.addButton} onPress={createPlaylist}>
                    <Ionicons name="add" size={24} color="white" />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#121212", padding: 10 },
    playlistContainer: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
    playlistImage: { width: 50, height: 50, borderRadius: 10, marginRight: 10 },
    playlistName: { color: "#fff", fontSize: 18 },
    footer: { flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "#1e1e1e" },
    input: { flex: 1, backgroundColor: "#333", color: "#fff", padding: 10, borderRadius: 5 },
    addButton: { marginLeft: 10, backgroundColor: "#1DB954", padding: 10, borderRadius: 5 }
});
