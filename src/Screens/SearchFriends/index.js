import React, { useContext, useState } from "react";
import { View, Text, FlatList, Image, Pressable, Modal, StyleSheet } from "react-native";
import { AuthContext } from "../../Context/AuthContext";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";

import { styles } from './styles';

export default function SearchFriends() {
    const navigation = useNavigation();
    const { usersList } = useContext(AuthContext);

    const [showProfile, setShowProfile] = useState(null); 

    const goToProfile = (userId) => {
        navigation.navigate("ProfileScreen", { userId }); // Passa o ID do usuário ao navegar
    };

    const renderItem = ({ item }) => (
        <Pressable style={{ height: 100, width: '100%', marginBottom: 10, }} onPress={() => setShowProfile(item)}>
            <Image source={{ uri: item.wallpaper }} style={[StyleSheet.absoluteFillObject, { borderRadius: 20, backgroundColor: "#ccc" }]} />
            <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
                <Image source={{ uri: item.photo }} style={{ width: 80, height: 80, borderRadius: 999 }} />
                <Text style={styles.username}>{item.displayName}</Text>
            </View>
        </Pressable>
    );

    return (
        <View style={{ flex: 1, padding: 15, backgroundColor: '#353535', }}>
            <FlatList
                data={usersList}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />

            {/* Modal para Exibir Perfil */}
            {showProfile && (
                <Modal visible={!!showProfile} transparent={true}>
                    <View style={styles.modalBackground}>
                        <View style={styles.modal}>
                            {/* Botão de Fechar */}
                            <Pressable style={{ position: 'absolute', right: 15, top: -20, zIndex: 999, borderRadius: 999 }}
                                onPress={() => setShowProfile(null)}>
                                <Ionicons style={{ backgroundColor: '#212121', borderRadius: 999 }} name="close" size={45} color="#FFF" />
                            </Pressable>

                            {/* Cabeçalho com a Imagem de Capa */}
                            <View style={{ width: '100%', height: 170 }}>
                                <Image source={{ uri: showProfile.wallpaper }} style={[StyleSheet.absoluteFillObject, { borderTopLeftRadius: 20, borderTopRightRadius: 20 }]} />
                            </View>

                            {/* Foto de Perfil e Nome */}
                            <View style={styles.photoProfile}>
                                <Image style={{ borderRadius: 999, width: '100%', height: '100%' }} source={{ uri: showProfile.photo }} />
                            </View>
                            <Text style={[styles.username, { marginLeft: 0 }]}>{showProfile.displayName}</Text>

                            {/* Descrição */}
                            <View style={{ padding: 20 }}>
                                <Text style={[styles.username, { marginLeft: 0, fontSize: 18 }]}>Descrição</Text>
                                <Text style={[styles.username, { marginLeft: 0, fontSize: 15, marginTop: 5 }]}>{showProfile.description}</Text>
                            </View>

                            {/* Botões */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, width: '100%', paddingHorizontal: 20 }}>
                                <Pressable onPress={() => goToProfile(showProfile.uid)} style={{ backgroundColor: 'skyblue', padding: 15, borderRadius: 999 }}>
                                    <Text style={[styles.username, { fontSize: 20, marginLeft: 0 }]}>Perfil</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}
