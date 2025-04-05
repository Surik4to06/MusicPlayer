import React, { useState, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import { Pressable, View, Image, StyleSheet, Text, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import Input from '../../Components/textInput';
import { styles } from "./styles";

import { Auth, db, storage } from "../../Services/firebaseConfig";
import { updateProfile } from "firebase/auth";

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

    // Função para fazer upload da imagem para o Firebase Storage
    const uploadImageAsync = async (uri, path) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
    };

    const pickImage = async (setImageState, path) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const uploadedUrl = await uploadImageAsync(result.assets[0].uri, path);
            setImageState(uploadedUrl);
        }
    };

    const handleSave = async () => {
        try {
            await updateProfile(Auth.currentUser, {
                displayName: username,
                photoURL: photoUser,
            });

            const userRef = doc(db, "users", uid);
            await updateDoc(userRef, {
                displayName: username,
                description: description,
                photo: photoUser,
                wallpaper: wallpaper,
            });

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

                <Pressable style={styles.editWallpaper} onPress={() => pickImage(setWallpaper, `users/${uid}/wallpaper.jpg`)}>
                    <Ionicons name="create-outline" size={35} color='#FFF' />
                </Pressable>
            </View>

            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: -80 }} />

            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Pressable style={styles.borderPhoto} onPress={() => pickImage(setPhotoUser, `users/${uid}/profile.jpg`)}>
                    <Image source={{ uri: photoUser }} style={{ width: 150, height: 150, borderRadius: 999 }} />
                    <Ionicons name="camera" size={35} color='#FFF' style={{ position: 'absolute', right: 5, bottom: 0 }} />
                </Pressable>
            </View>

            <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.txt}>Nome</Text>
                <Input value={username} onChangeText={setUsername} placeholder="Digite o novo nome de usuário" placeholderTextColor="gray" />

                <Text style={styles.txt}>Descrição</Text>
                <Input value={description} onChangeText={setDescription} placeholder="Descrição..." placeholderTextColor="gray" />

                <Pressable onPress={handleSave} style={styles.btnSave}>
                    <Text style={styles.btnSaveText}>Salvar</Text>
                </Pressable>
            </View>
        </View>
    );
};
