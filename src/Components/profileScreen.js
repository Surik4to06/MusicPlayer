import React, { useEffect, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

import { Auth, db } from "../Services/firebaseConfig";
import MyMusics from "../Screens/MyMusics";
import Likeds from "../Screens/Likeds";

const Tab = createMaterialTopTabNavigator();

const ProfileScreen = ({ route }) => {
    const navigation = useNavigation();
    const currentUser = Auth.currentUser;
    const userId = route.params?.userId || currentUser.uid;
    const isCurrentUser = userId === currentUser.uid;

    const [userData, setUserData] = useState({});
    const [isFollowing, setIsFollowing] = useState(false);

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
                    style={styles.btnBack}
                    onPress={() => {
                        navigation.reset({
                            routes: [{name: 'Main'}]
                        });
                    }}>
                    <Ionicons style={{ marginLeft: -3 }} name="chevron-back-outline" color='#FFF' size={30} />
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
                tabBarLabelStyle: { color: '#FFF' },
                tabBarStyle: { backgroundColor: '#000' }
            }}>
                <Tab.Screen name="MyMusics" component={MyMusics} />
                <Tab.Screen name="Liked" component={Likeds} />
            </Tab.Navigator>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#9c9c9c",
    },
    btnBack: {
        position: 'absolute',
        left: 10,
        top: 10,
        width: 50,
        height: 50,
        backgroundColor: '#212121',
        zIndex: 999,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 999,
    },
    containerSecond: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    containerTerd: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        zIndex: 10,
        backgroundColor: 'transparent',
        marginTop: 20
    },
    username: {
        fontSize: 23,
        marginTop: 10,
        color: "#FFF",
    },
    numDados: {
        fontSize: 18,
        textAlign: 'center',
        color: '#FFF',
    },
    textDados: {
        fontSize: 18,
        color: '#FFF',
    },
    btnProfile: {
        backgroundColor: '#353535',
        padding: 10,
        borderRadius: 15,
    },
    btnProfileText: {
        fontSize: 18,
        color: '#FFF',
    },
    containerTopTab: {
        flex: 1,
    },
    profileContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#000',
        zIndex: 2,
    },

});


export default ProfileScreen;
