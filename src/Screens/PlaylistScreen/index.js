import React from 'react';
import { View, Text, Image, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { styles } from './styles';

const PlaylistScreen = ({ route }) => {
    const { playlist } = route.params;

    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {/* Imagem da playlist */}
            <Image source={{ uri: playlist.thumbnail }} style={styles.playlistImage} />

            {/* Nome e quantidade de músicas */}
            <Text style={styles.playlistTitle}>{playlist.name}</Text>
            <Text style={styles.songCount}>{playlist.songs.length} Músicas</Text>

            {/* Botões de ação */}
            <View style={styles.buttonContainer}>
                <Pressable
                    onPress={() => {
                        navigation.navigate("PlayerTeste", { playlist: playlist.songs, playlistId: playlist.id });
                    }}
                    style={styles.button}>
                    <Ionicons name="play" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Play</Text>
                </Pressable>

                <Pressable style={styles.button}>
                    <Ionicons name="shuffle" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Shuffle</Text>
                </Pressable>
            </View>

            {/* Lista de músicas */}
            <FlatList
                data={playlist.songs}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (

                    <View style={styles.songItem}>
                        <Image
                            source={
                                item.thumbnail
                                    ? { uri: item.thumbnail }
                                    : require('../../../assets/musica.png')
                            }
                            style={styles.songThumbnail} />
                        <View>
                            <Text style={styles.songTitle}>{item.title}</Text>
                            <Text style={styles.songAuthor}>{item.author}</Text>
                        </View>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default PlaylistScreen;
