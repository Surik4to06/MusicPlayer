import React, { useEffect, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, Modal } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, collection, query, where } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

import { Auth, db } from "../../Services/firebaseConfig";
import MyMusics from "../MyMusics";
import Likeds from "../Likeds";
import { styles } from './styles';

const Tab = createMaterialTopTabNavigator();

const ProfileScreen = ({ route }) => {
    const navigation = useNavigation();
    const currentUser = Auth.currentUser;
    const userId = route.params?.userId || currentUser.uid;
    const isCurrentUser = userId === currentUser.uid;

    const [userData, setUserData] = useState({});
    const [isFollowing, setIsFollowing] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const [userMusics, setUserMusics] = useState([]);

    useEffect(() => {
        if (!userId) return;

        // Referência para a coleção "musics" filtrando pelo "authorId"
        const musicsRef = collection(db, "musics");
        const q = query(musicsRef, where("authorId", "==", userId));

        // Listener para atualizar em tempo real
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const musics = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUserMusics(musics);
        });

        return () => unsubscribe();
    }, [userId]);

    useEffect(() => {
        // Referência do documento do usuário no Firestore
        const userRef = doc(db, "users", userId);

        // Listener para monitorar mudanças em tempo real
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserData(data);
                setIsFollowing(data.followers.some(follower => follower.uid === currentUser.uid));
            }
        });

        // Remover listener ao desmontar o componente
        return () => unsubscribe();
    }, [userId]);

    const handleFollow = async () => {
        const userRef = doc(db, "users", userId);
        const currentUserRef = doc(db, "users", currentUser.uid);

        try {
            // Criar objeto do usuário logado
            const currentUserData = {
                uid: currentUser.uid,
                displayName: currentUser.displayName,
                photo: currentUser.photoURL
            };

            // Criar objeto do usuário seguido
            const followedUserData = {
                uid: userId,
                displayName: userData.displayName,
                photo: userData.photo
            };

            if (isFollowing) {
                // Remover seguidor e seguindo
                await updateDoc(userRef, {
                    followers: arrayRemove(currentUserData),
                    followersCount: Math.max(0, userData.followersCount - 1)
                });
                await updateDoc(currentUserRef, {
                    following: arrayRemove(followedUserData),
                    followingCount: Math.max(0, userData.followingCount - 1)
                });
            } else {
                // Adicionar seguidor e seguindo
                await updateDoc(userRef, {
                    followers: arrayUnion(currentUserData),
                    followersCount: userData.followersCount + 1
                });
                await updateDoc(currentUserRef, {
                    following: arrayUnion(followedUserData),
                    followingCount: userData.followingCount + 1
                });
            }
        } catch (error) {
            console.error("Erro ao atualizar seguidores:", error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.containerSecond}>
                {/* Botão voltar para a pesquisa */}
                <Pressable
                    style={styles.btnSettings}
                    onPress={() => {
                        setShowSettings(true);
                    }}>
                    <Ionicons name="settings-outline" color='#FFF' size={30} />
                </Pressable>

                <Image source={{ uri: userData.wallpaper }} style={[StyleSheet.absoluteFillObject, { backgroundColor: '#96969696', position: 'absolute', top: 0, left: 0, zIndex: 1 }]} />

                <View style={styles.containerTerd}>
                    <Pressable>
                        <Image source={{ uri: userData.photo }} style={{ width: 150, height: 150, borderRadius: 999 }} />
                    </Pressable>

                    <Text style={styles.username}>{userData.displayName}</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '50%', marginTop: 10 }}>
                        <View>
                            <Text style={styles.numDados}>{userData.followersCount}</Text>
                            <Text style={styles.textDados}>Seguidores</Text>
                        </View>
                        <View>
                            <Text style={styles.numDados}>{userData.followingCount}</Text>
                            <Text style={styles.textDados}>Seguindo</Text>
                        </View>
                    </View>

                    {!isCurrentUser && (
                        <Pressable onPress={handleFollow} style={styles.btnProfile}>
                            <Text style={styles.btnProfileText}>{isFollowing ? "Deixar de Seguir" : "Seguir"}</Text>
                        </Pressable>
                    )}
                </View>
            </View>

            <Tab.Navigator screenOptions={{
                tabBarStyle: { backgroundColor: '#000' },
                tabBarInactiveTintColor: 'gray',
                tabBarActiveTintColor: '#FFF',
            }}>
                <Tab.Screen 
                name="MyMusics" 
                initialParams={userId} 
                component={MyMusics} 
                options={{
                    title: 'Minhas Musicas',
                }}/>
                <Tab.Screen 
                name="Liked" 
                component={Likeds} 
                options={{
                    title: 'Curtidas',
                }}/>
            </Tab.Navigator>

            <Modal
                visible={showSettings}
                transparent={true}
                animationType="slide">
                <Pressable style={styles.modalBackground}
                onPress={() => setShowSettings(false)} />

                <View style={styles.modal}>
                    <Pressable onPress={() => {
                        navigation.navigate('EditProfile');
                        setShowSettings(false);
                    }}>
                        <Text>Editar Perfil</Text>
                    </Pressable>

                    <Pressable onPress={() => {
                        navigation.reset({
                            routes: [{name: 'Login'}]
                        });
                        setShowSettings(false);
                    }}>
                        <Text>Sair</Text>
                    </Pressable>
                </View>
            </Modal>
        </View>
    );
};

export default ProfileScreen;
