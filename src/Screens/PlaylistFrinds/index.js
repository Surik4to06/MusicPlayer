import React, { useContext, useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, arrayUnion, arrayRemove } from "firebase/firestore";
import { Auth, db } from "../../Services/firebaseConfig";
import { styles } from "./styles";
import { AuthContext } from "../../Context/AuthContext";

export default ({ friendId, friendUsername }) => {
    const { addSong } = useContext(AuthContext);
    const [playlists, setPlaylists] = useState([]);
    const [playlistName, setPlaylistName] = useState("");
    const [newSong, setNewSong] = useState({ title: "", author: "", url: "" });
    const currentUser = Auth.currentUser;

    useEffect(() => {
        const q = query(collection(db, "playlists"), where("members", "array-contains", currentUser.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPlaylists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const createPlaylist = async () => {
        if (!playlistName.trim()) return;
        await addDoc(collection(db, "playlists"), {
            name: playlistName,
            members: [currentUser.uid, friendId],
            songs: [],
        });
        setPlaylistName("");
    };

    const addSongToPlaylist = async (playlistId) => {
        if (!newSong.title || !newSong.url) return;
        const playlistRef = doc(db, "playlists", playlistId);
        await updateDoc(playlistRef, {
            songs: arrayUnion({ ...newSong, addedBy: currentUser.uid })
        });
        setNewSong({ title: "", author: "", url: "" });
    };

    const removeSong = async (playlistId, song) => {
        const playlistRef = doc(db, "playlists", playlistId);
        await updateDoc(playlistRef, {
            songs: arrayRemove(song),
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Playlists com {friendUsername}</Text>

            <TextInput
                placeholder="Nome da Playlist"
                value={playlistName}
                onChangeText={setPlaylistName}
                style={styles.input}
            />

            <Pressable onPress={createPlaylist} style={styles.button}>
                <Text style={styles.buttonText}>Criar Playlist</Text>
            </Pressable>

            <FlatList
                data={playlists}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.playlistCard}>
                        <Text style={styles.playlistName}>{item.name}</Text>

                        <TextInput
                            placeholder="Nome da Música"
                            value={newSong.title}
                            onChangeText={(text) => setNewSong({ ...newSong, title: text })}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Autor"
                            value={newSong.author}
                            onChangeText={(text) => setNewSong({ ...newSong, author: text })}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="URL da Música"
                            value={newSong.url}
                            onChangeText={(text) => setNewSong({ ...newSong, url: text })}
                            style={styles.input}
                        />

                        <Pressable onPress={() => addSongToPlaylist(item.id)} style={styles.button}>
                            <Text style={styles.buttonText}>Adicionar Música</Text>
                        </Pressable>

                        <FlatList
                            data={item.songs}
                            keyExtractor={(song) => song.url}
                            renderItem={({ item: song }) => (
                                <View style={styles.songItem}>
                                    <Text>{song.title} - {song.author}</Text>
                                    <Pressable onPress={() => removeSong(item.id, song)}>
                                        <Text style={styles.removeButton}>❌</Text>
                                    </Pressable>
                                </View>
                            )}
                        />
                    </View>
                )}
            />
        </View>
    );
};