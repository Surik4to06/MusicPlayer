import React, { createContext, useState } from "react";
import { Auth } from "../Services/firebaseConfig";

export const AuthContext = createContext({});

function AuthProvider({ children }) {

    const [musicsList, setMusicList] = useState([]);
    const [playerMusic, setPlayerMusic] = useState(null);
    const [likedSongs, setLikedSongs] = useState([]); // Armazena os IDs das músicas curtidas
    const [teste, setTeste] = useState([]); // Armazena os IDs das músicas curtidas

    const user = Auth.currentUser.uid;

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
        <AuthContext.Provider value={{ musicsList, setMusicList, playerMusic, setPlayerMusic, togglePlay, likedSongs, setLikedSongs, teste, setTeste, user }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;