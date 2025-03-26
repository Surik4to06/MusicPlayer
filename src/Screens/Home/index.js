import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, Alert, PermissionsAndroid, Platform } from "react-native";
import * as MediaLibrary from "expo-media-library";
import { useNavigation } from "@react-navigation/native";

export default function AudioList() {
    const [audioFiles, setAudioFiles] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        (async () => {
            const hasPermission = await requestStoragePermission();
            if (hasPermission) {
                fetchAllAudioFiles();
            } else {
                Alert.alert("Permissão Negada", "Conceda acesso aos arquivos para ver as músicas.");
            }
        })();
    }, []);

    // 🛑 Pede permissão corretamente (Android 13+ precisa de permissão extra)
    async function requestStoragePermission() {
        if (Platform.OS === "android") {
            const { granted } = await MediaLibrary.requestPermissionsAsync();
            if (!granted) return false;

            if (Platform.Version >= 33) { // Android 13+ precisa dessa permissão
                const permission = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
                );
                return permission === PermissionsAndroid.RESULTS.GRANTED;
            }
            return true;
        }
        return true;
    }

    // 🔍 Busca todas as músicas com metadados
    const fetchAllAudioFiles = async () => {
        try {
            let allAudio = [];
            let hasNextPage = true;
            let after = null;

            while (hasNextPage) {
                const media = await MediaLibrary.getAssetsAsync({
                    mediaType: MediaLibrary.MediaType.audio,
                    first: 100,
                    after: after,
                });

                allAudio = [...allAudio, ...media.assets];
                after = media.endCursor;
                hasNextPage = media.hasNextPage;
            }

            // 🏷️ Buscar metadados (autor e capa)
            const detailedAudio = await Promise.all(
                allAudio.map(async (item) => {
                    const info = await MediaLibrary.getAssetInfoAsync(item.id);
                    return {
                        ...item,
                        url: info.localUri || info.uri, // 🔹 Garante que há uma URL válida
                        title: info.filename,
                        author: info.artist || "Desconhecido",
                        thumbnail: info?.album?.artwork || null,
                    };
                })
            );

            setAudioFiles(detailedAudio);
        } catch (error) {
            Alert.alert("Erro ao buscar músicas", error.message);
            console.error("Erro ao buscar músicas:", error);
        }
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
                🎵 Músicas no Celular
            </Text>
            {audioFiles.length === 0 ? (
                <Text>Nenhuma música encontrada.</Text>
            ) : (
                <FlatList
                    data={audioFiles}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={{ flexDirection: "row", padding: 10, borderBottomWidth: 1 }}
                            onPress={() => navigation.navigate("PlayerMusic", { playerMusic: item })}
                        >
                            {/* Exibir capa do álbum, se disponível */}
                            {item.thumbnail ? (
                                <Image 
                                    source={{ uri: item.thumbnail }} 
                                    style={{ width: 50, height: 50, borderRadius: 5 }} 
                                />
                            ) : (
                                <View style={{ width: 50, height: 50, backgroundColor: "#ccc", borderRadius: 5 }} />
                            )}

                            <View style={{ marginLeft: 10 }}>
                                <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.filename}</Text>
                                <Text style={{ fontSize: 14, color: "#555" }}>{item.author}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}
