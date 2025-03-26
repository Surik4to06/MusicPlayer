import React, { createContext, useState } from "react";

export const AuthContext = createContext({});

function AuthProvider({ children }) {

    const [musicsList, setMusicList] = useState([]);
    const [playerMusic, setPlayerMusic] = useState(null);
    const [likedSongs, setLikedSongs] = useState([]); // Armazena os IDs das músicas curtidas
    const [teste, setTeste] = useState([]); // Armazena os IDs das músicas curtidas
    const [usersList, setUsersList] = useState([]);
    const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
    const [friendsList, setFriendsList] = useState([]);

    const togglePlay = async (item) => {
        if (currentSound) {
            await currentSound.stopAsync();
            await currentSound.unloadAsync();
            setCurrentSound(null);
            setCurrentMusicId(null);
        }

        if (currentMusicId === item.id) return;

        try {
            const { sound, status } = await Audio.Sound.createAsync(
                { uri: item.url },
                { shouldPlay: true }
            );
            setCurrentSound(sound);
            setCurrentMusicId(item.id);
            setPosition(0);
            setDuration(status.durationMillis || 1);
        } catch (error) {
            console.error("Erro ao tocar música:", error);
        }
    };


    return (
        <AuthContext.Provider value={{ musicsList, setMusicList, playerMusic, setPlayerMusic, togglePlay, likedSongs, setLikedSongs, teste, setTeste, usersList, setUsersList, totalUnreadMessages, setTotalUnreadMessages, friendsList, setFriendsList }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;