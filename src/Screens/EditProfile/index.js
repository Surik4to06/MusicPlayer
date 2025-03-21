import React, { useState, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import { Pressable, View, Image, StyleSheet, Text, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";

import Input from '../../Components/textInput';
import { styles } from "./styles";

import { Auth, db } from "../../Services/firebaseConfig";
import { signOut, updateProfile } from "firebase/auth";

export default () => {
    const navigation = useNavigation();
    const uid = Auth.currentUser.uid;

    const [username, setUsername] = useState(Auth.currentUser.displayName || '');
    const [description, setDescription] = useState('');
    const [photoUser, setPhotoUser] = useState(Auth.currentUser.photoURL || '');
    const [wallpaper, setWallpaper] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const userRef = doc(db, "users", uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    setUsername(userData.displayName || '');
                    setDescription(userData.description || '');
                    setPhotoUser(userData.photo || '');
                    setWallpaper(userData.wallpaper || '');
                }
            } catch (error) {
                Alert.alert('Erro ao carregar perfil');
                navigation.goBack();
            }
        };

        fetchUserProfile();
    }, [uid]);

    const pickImage = async (setImageState) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImageState(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        try {
            // Atualiza no Firebase Authentication
            await updateProfile(Auth.currentUser, {
                displayName: username,
                photoURL: photoUser,
            });

            // Atualiza no Firestore
            const userRef = doc(db, "users", uid);
            await updateDoc(userRef, {
                displayName: username,
                description: description,
                photo: photoUser,
                wallpaper: wallpaper,
            });

            setLoading(false);
            // Redireciona de volta para a tela de perfil
            navigation.goBack();
        } catch (error) {
            Alert.alert("Erro", "Não foi possível salvar as alterações.");
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#212121' }}>
            <View style={{ width: '100%', height: 200 }}>
                {wallpaper ? (
                    <Image
                        source={{ uri: wallpaper }}
                        style={[StyleSheet.absoluteFillObject, { backgroundColor: '#96969696' }]}
                    />
                ) : (
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#96969696' }]} />
                )}

                <Pressable style={styles.btnBack} onPress={() => navigation.goBack()}>
                    <Ionicons style={{ marginLeft: -3 }} name="chevron-back" size={35} color='#FFF' />
                </Pressable>

                <Pressable style={styles.editWallpaper} onPress={() => pickImage(setWallpaper)}>
                    <Ionicons name="create-outline" size={35} color='#FFF' />
                </Pressable>
            </View>

            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: -80 }} />

            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Pressable style={styles.borderPhoto} onPress={() => pickImage(setPhotoUser)}>
                    <Image source={{ uri: photoUser }} style={{ width: 150, height: 150, borderRadius: 999 }} />
                    <Ionicons name="camera" size={35} color='#FFF' style={{ position: 'absolute', right: 5, bottom: 0 }} />
                </Pressable>
            </View>

            <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ marginTop: 10, marginBottom: 10 }}>
                    <Text style={styles.txt}>Nome</Text>
                    <Input
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Digite o novo nome de usuário"
                        placeholderTextColor="gray"
                    />
                </View>

                <View style={{ marginTop: 10, marginBottom: 10 }}>
                    <Text style={styles.txt}>Descrição</Text>
                    <Input
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Descrição..."
                        placeholderTextColor="gray"
                    />
                </View>

                <Pressable onPress={handleSave} style={styles.btnSave}>
                    <Text style={styles.btnSaveText}>Salvar</Text>
                </Pressable>

                <Pressable style={[styles.btnSave, { backgroundColor: 'red' }]} onPress={() => {
                    signOut(Auth);
                    navigation.reset({
                        routes: [{ name: 'Login' }]
                    });
                }}>
                    <Text style={styles.btnSaveText}>Sair</Text>
                </Pressable>
            </View>
        </View>
    );
};
