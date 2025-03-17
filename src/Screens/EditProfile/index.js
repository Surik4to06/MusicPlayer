import React, { useState, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import { Pressable, View, Image, StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";

import Input from '../../Components/textInput';
import { styles } from "./styles";

import { Auth, db } from "../../Services/firebaseConfig";
import { updateProfile } from "firebase/auth";

export default () => {

    const [username, setUsername] = useState(Auth.currentUser.displayName);
    const [description, setDescription] = useState('');
    const [photoUser, setPhotoUser] = useState(Auth.currentUser.photoURL);
    const [wallpaper, setWallpaper] = useState(null);

    useEffect(() => {
        fetchWallpaper(Auth.currentUser.uid).then(setWallpaper);
    }, [Auth.currentUser.uid]);

    const fetchWallpaper = async (uid) => {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            setDescription(userSnap.data().description);
            return userSnap.data().wallpaper; // Retorna a URL do wallpaper
        } else {
            return null;
        }
    };

    // const uploadWallpaper = async (uid) => {
    //     const result = await ImagePicker.launchImageLibraryAsync({
    //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //         allowsEditing: true,
    //         quality: 1,

    //     });

    // if (!result.canceled) {
    //     const response = await fetch(result.assets[0].uri);
    //     const blob = await response.blob();

    //     const storageRef = ref(storage, `wallpapers/${uid}.jpg`);
    //     await uploadBytes(storageRef, blob);

    //     const url = await getDownloadURL(storageRef);

    //     // Salva a URL no Firestore
    //     const userRef = doc(db, "users", uid);
    //     await updateDoc(userRef, { wallpaper: url });

    //     console.log("Wallpaper atualizado:", url);
    //     return url;
    // }
    // };

    const handlePhotoUser = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });

        photo = result.assets[0].uri;

        setPhotoUser(photo);
        console.log(photo);

        if (!result.canceled) {
            setPhotoUser(photo);
        }

        updateProfile(Auth.currentUser, {
            photoURL: photoUser,
        });

        updateFirestoreProfile(Auth.currentUser.uid, username, photoUser, description)
    }

    const updateFirestoreProfile = async (uid, displayName, photo, description) => {
        try {
          const userRef = doc(db, "users", uid);
      
          await updateDoc(userRef, {
            displayName,
            photo,
            description,
          });
      
          console.log("✅ Perfil do Firestore atualizado com sucesso!");
        } catch (error) {
          console.error("❌ Erro ao atualizar perfil no Firestore:", error);
        }
      };

    const handleWallpaper = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });

        photo = result.assets[0].uri;

        setWallpaper(photo);
        console.log(photo);

        if (!result.canceled) {
            setWallpaper(photo);
        }
    }


    const handleSavedInfos = () => {
        // Função para atualizar os dados do usuário
        const updateUserProfile = async (uid, newData) => {
            try {
                const db = getFirestore();
                const userRef = doc(db, "users", uid);

                await updateDoc(userRef, newData);

                console.log("✅ Perfil atualizado com sucesso!");
            } catch (error) {
                console.error("❌ Erro ao atualizar perfil:", error);
            }
        };

        updateUserProfile(Auth.currentUser.uid, {
            // displayName: ,
            description: "Minha nova descrição!",
            photoURL: "https://example.com/minha-nova-foto.png",
            wallpaper: "https://example.com/meu-wallpaper.png",
        });
    }

    const navigation = useNavigation();


    return (
        <View style={{ flex: 1, backgroundColor: '#212121' }}>
            <View style={{ width: '100%', height: 200 }}>
                <Image source={{ uri: wallpaper }} style={StyleSheet.absoluteFillObject} />
                <Pressable style={styles.btnBack} onPress={() => navigation.goBack()}>
                    <Ionicons style={{marginLeft: -3}} name="chevron-back" size={35} color='#FFF' />
                </Pressable>

                <Pressable style={styles.editWallpaper} onPress={handleWallpaper}>
                    <Ionicons name="create-outline" size={35} color='#FFF' />
                </Pressable>
            </View>

            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: -80 }}>

            </View>

            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Pressable style={styles.borderPhoto} onPress={handlePhotoUser}>
                    <Image source={{ uri: photoUser }} style={{ width: 150, height: 150, borderRadius: 999 }} />
                    <Ionicons name="camera" size={35} color='#FFF' style={{ position: 'absolute', right: 5, bottom: 0 }} />
                </Pressable>

            </View>

        <View style={{flex: 1, alignItems: 'center'}}>
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

        </View>

        </View>
    );
}