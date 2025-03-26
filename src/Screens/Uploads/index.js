import React, { useState } from 'react';
import { View, Text, TextInput, Image, Pressable, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Auth, db, storage } from '../../Services/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';

const UploadMusic = () => {
    const [audioFile, setAudioFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [musicName, setMusicName] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();

    const uniqueId = Date.now().toString() + Math.floor(Math.random() * 1000);

    const pickAudio = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });

            if (result && result.assets && result.assets.length > 0) {
                setAudioFile(result.assets[0]); // Pega o primeiro arquivo
            }
        } catch (error) {
            console.error("Erro ao selecionar áudio:", error);
            Alert.alert("Erro", "Falha ao selecionar o áudio.");
        }
    };

    const pickThumbnail = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert("Permissão negada", "Você precisa permitir o acesso à galeria.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (result && result.assets && result.assets.length > 0) {
                setThumbnail(result.assets[0]);
            }
        } catch (error) {
            console.error("Erro ao selecionar thumbnail:", error);
            Alert.alert("Erro", "Falha ao selecionar a thumbnail.");
        }
    };

    const uploadMusic = async () => {
        setLoading(true);
        if (!musicName || !authorName || !audioFile) {
            Alert.alert("Erro", "Preencha todos os campos e selecione o arquivo de áudio.");
            setLoading(false)
            return;
        }

        try {
            // Upload do áudio
            const responseAudio = await fetch(audioFile.uri);
            const blobAudio = await responseAudio.blob();
            const audioRef = ref(storage, `musics/${Date.now()}_${audioFile.name}`);
            await uploadBytes(audioRef, blobAudio);
            const audioDownloadUrl = await getDownloadURL(audioRef);

            // Upload da thumbnail
            let thumbnailUrl = null;
            if (thumbnail) {
                const responseThumb = await fetch(thumbnail.uri);
                const blobThumb = await responseThumb.blob();
                const thumbnailRef = ref(storage, `thumbnails/${Date.now()}.jpg`);
                await uploadBytes(thumbnailRef, blobThumb);
                thumbnailUrl = await getDownloadURL(thumbnailRef);
            }

            // Salvar no Firestore
            const musicData = {
                id: uniqueId,
                uidAuthor: Auth.currentUser.uid,
                title: musicName,
                author: authorName,
                url: audioDownloadUrl,
                thumbnail: thumbnailUrl || null,
            };

            await setDoc(doc(db, "musics", musicName), musicData);
            Alert.alert("Sucesso", "Sua música foi publicada com sucesso!");
            resetForm();
            setLoading(false)
        } catch (error) {
            console.error("Erro ao fazer upload:", error);
            Alert.alert("Erro", "Ocorreu um erro ao fazer o upload.");
            setLoading(false)
        }
    };

    const resetForm = () => {
        setAudioFile(null);
        setThumbnail(null);
        setMusicName('');
        setAuthorName('');
    };

    return (
        <View style={styles.container}>
            {thumbnail && <Image blurRadius={7} source={{ uri: thumbnail.uri }} style={StyleSheet.absoluteFillObject} />}

            <Pressable onPress={pickThumbnail} style={styles.thumbnail}>
                {thumbnail ? (
                    <Image source={{ uri: thumbnail.uri }} style={{ flex: 1, borderRadius: 15 }} />
                ) : (
                    <Ionicons name='create-outline' color='#FFF' size={55} style={styles.iconEdit} />
                )}
            </Pressable>

            <TextInput
                style={styles.input}
                value={musicName}
                onChangeText={setMusicName}
                multiline={true}
                placeholder='Nome da Música'
                placeholderTextColor="#FFF" />

            <TextInput
                style={styles.input}
                value={authorName}
                onChangeText={setAuthorName}
                placeholder='Nome do Autor'
                placeholderTextColor="#FFF" />

            <Pressable style={styles.containerBtnUpload} onPress={pickAudio}>
                <Text style={styles.uploadBtn}>
                    {audioFile ? `Áudio selecionado: ${audioFile.name}` : "Selecione uma música"}
                </Text>
            </Pressable>


            <Pressable style={styles.containerBtnUpload} onPress={uploadMusic}>
                {loading ?
                    <ActivityIndicator color='#FFF' size={36} />
                    :
                    <Text style={styles.uploadBtn}>Fazer Upload</Text>
                }
            </Pressable>
        </View>
    );
};

export default UploadMusic;
