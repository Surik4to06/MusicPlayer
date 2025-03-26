import React from "react";
import { View, Text, Image, Pressable, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const CardMusic = ({ item, togglePlay, isPlaying, animation }) => {
    const navigation = useNavigation();

    return (
        <Pressable
            onPress={() => navigation.navigate('PlayerMusic', { playerMusic: item })}
            style={styles.cardMusic}
        >
            <View style={styles.containerCard}>
                <View style={{ flexDirection: "row", padding: 10 }}>
                    <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                    <View style={{ flex: 1, marginLeft: 10, overflow: "hidden" }}>

                        {/* Animação para mover os textos da direita para a esquerda */}
                        <Animated.View style={{ transform: [{ translateX: animation.title }] }}>
                            <Text style={styles.title}>{item.title}</Text>
                        </Animated.View>
                        <Animated.View style={{ transform: [{ translateX: animation.author }] }}>
                            <Text style={styles.author}>{item.author}</Text>
                        </Animated.View>
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
        backgroundColor: '#000',
        borderRadius: 45,
    },
    containerCard: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 9999,
    },
    title: {
        color: '#FFF',
        marginBottom: 10,
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
