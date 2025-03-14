import React, { useContext, useState } from "react";
import { View, Text, Image, FlatList, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { styles } from "./styles";
import { AuthContext } from "../../Context/AuthContext";

export default () => {

    const {musicsList} = useContext(AuthContext);

    const [playingMusics, setPlayingMusics] = useState({});
    const [currentSound, setCurrentSound] = useState(null);

    const musics = [
        { 
            id: "1", 
            title: "Música 1", 
            author: "Fulano", 
            thumbnail: "https://i.pinimg.com/1200x/85/ab/4c/85ab4cbe8bcff67648d771d8f24dfb1c.jpg", 
            url: require("../../../assets/Music/Danny Bond feat. Mc Naninha - Cachorra Absurda prod. PZZS(MP3_160K).mp3") 
        },
        { 
            id: "2", 
            title: "Música 2", 
            author: "Beltrano", 
            thumbnail: "https://i.pinimg.com/1200x/85/ab/4c/85ab4cbe8bcff67648d771d8f24dfb1c.jpg", 
            url: require("../../../assets/Music/Doce Veneno _ Call Of The Night - Ft. _Shaman_(M4A_128K).m4a") 
        },
        { 
            id: "3", 
            title: "Música 2", 
            author: "Beltrano", 
            thumbnail: "https://i.pinimg.com/1200x/85/ab/4c/85ab4cbe8bcff67648d771d8f24dfb1c.jpg", 
            url: require("../../../assets/Music/Doce Veneno _ Call Of The Night - Ft. _Shaman_(M4A_128K).m4a") 
        },
        { 
            id: "4", 
            title: "Música 2", 
            author: "Beltrano", 
            thumbnail: "https://i.pinimg.com/1200x/85/ab/4c/85ab4cbe8bcff67648d771d8f24dfb1c.jpg", 
            url: require("../../../assets/Music/Doce Veneno _ Call Of The Night - Ft. _Shaman_(M4A_128K).m4a") 
        },
        { 
            id: "5", 
            title: "Música 2", 
            author: "Beltrano", 
            thumbnail: "https://i.pinimg.com/1200x/85/ab/4c/85ab4cbe8bcff67648d771d8f24dfb1c.jpg", 
            url: require("../../../assets/Music/Doce Veneno _ Call Of The Night - Ft. _Shaman_(M4A_128K).m4a") 
        },
        { 
            id: "6", 
            title: "Música 2", 
            author: "Beltrano", 
            thumbnail: "https://i.pinimg.com/1200x/85/ab/4c/85ab4cbe8bcff67648d771d8f24dfb1c.jpg", 
            url: require("../../../assets/Music/Doce Veneno _ Call Of The Night - Ft. _Shaman_(M4A_128K).m4a") 
        },
        { 
            id: "7", 
            title: "Música 2", 
            author: "Beltrano", 
            thumbnail: "https://i.pinimg.com/1200x/85/ab/4c/85ab4cbe8bcff67648d771d8f24dfb1c.jpg", 
            url: require("../../../assets/Music/Doce Veneno _ Call Of The Night - Ft. _Shaman_(M4A_128K).m4a") 
        },
    ];

    // É bom dar uma esperada depois de clicar para tocar, se nao toca uma em cima da outra, porem isso é só no primeiro clique!

    // Função para tocar ou pausar a música
    const togglePlay = async (item) => {
        // Se já houver uma música tocando, pare ela antes de tocar a nova
        if (currentSound) {
            await currentSound.stopAsync();
            await currentSound.unloadAsync();
            setCurrentSound(null);
        }

        // Se a música já estiver tocando, pare ela
        if (playingMusics[item.id]) {
            setPlayingMusics((prev) => ({ ...prev, [item.id]: false }));
            return;
        }

        // Criar um novo som e tocar
        const { sound } = await Audio.Sound.createAsync(item.url);
        await sound.playAsync();
        setCurrentSound(sound);

        // Atualizar estado para mostrar que essa música está tocando
        setPlayingMusics({ [item.id]: true });
    };

    // renderizando os itens na tela e setando como padrão tudo pausado no minuto 00:00
    const renderItem = ({ item }) => {
        const isPlaying = playingMusics[item.id] || false;

        return (
            <Pressable style={styles.cardMusic}>
                {/* TUDO ISSO PRA ALINHAR O CONTAINER DO CARD E MAIS ND ,_, */}
                <View style={styles.containerCard}>
                    <View style={{ flexDirection: "row", padding: 10 }}>
                        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.author}>{item.author}</Text>
                        </View>
                    </View>
                    {/* Botão pra alterar entre tocando ou pusada as musicas e mudar o icone junto */}
                    <Pressable onPress={() =>
                        togglePlay(item)}
                        style={styles.btnPlayMusic}>

                        {isPlaying ? (
                            <Ionicons name="pause" size={30} color="#FFF" />
                        ) : (
                            <Ionicons name="play" size={30} color="#FFF" style={{ marginLeft: 3 }} />
                        )}
                    </Pressable>
                </View>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                style={styles.flatList}
                data={musics}
                renderItem={renderItem}
                keyExtractor={(item) => item.id} />
        </View>
    );
};
