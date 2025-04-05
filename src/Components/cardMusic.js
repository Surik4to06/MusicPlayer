import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const CardMusic = ({ item, togglePlay, isPlaying }) => {
    const navigation = useNavigation();

    if (!item || !item.title || !item.author) {
        return null; // Se os dados estiverem incompletos, evita erro
    }

    return (
        <Pressable
            onPress={() => {
                navigation.navigate('PlayerMusic', { playerMusic: item })
            }}
            style={styles.cardMusic}
        >
            <View style={styles.containerCard}>
                <View style={{ flexDirection: "row", padding: 10 }}>

                    {/* Muda a foto da musica caso ela não tenha foto */}
                    {item.thumbnail === null ?
                        <Image source={require('../../assets/musica.png')} style={[styles.thumbnail, { backgroundColor: '#BCBCBC' }]} />
                        :
                        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                    }
                    <View style={{ flex: 1, marginLeft: 10, overflow: "hidden" }}>
                        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.author} numberOfLines={1}>{item.author}</Text>
                    </View>

                </View>
                <Pressable onPress={() => togglePlay(item)} style={styles.btnPlayMusic}>
                    {isPlaying ? (
                        <Ionicons name="pause" size={30} color="#FFF" />
                    ) : (
                        <Ionicons style={{ marginLeft: 3 }} name="play" size={30} color="#FFF" />
                    )}
                </Pressable>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    cardMusic: {
        marginBottom: 10,
        height: 90,
        padding: 3,
        backgroundColor: '#212121',
        borderRadius: 45,
    },
    containerCard: {
        flexDirection: "row", // Corrigido para alinhar horizontalmente
        justifyContent: "space-between",
        alignItems: "center",
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 9999,
    },
    thumbnailNull: {
        backgroundColor: '#DFDEE4',
        width: 60,
        height: 60,
        borderRadius: 9999,
    },
    title: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    author: {
        color: "#FFF",
    },
    btnPlayMusic: {
        position: 'absolute',
        right: 20,
        backgroundColor: '#515151',
        borderRadius: 999,
        width: 37,
        height: 37,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CardMusic;
