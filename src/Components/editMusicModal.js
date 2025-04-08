import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Image, Pressable, Alert,
  StyleSheet, ActivityIndicator
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Auth, db, storage } from '../Services/firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { styles } from '../Screens/Uploads/styles';

const extractStoragePath = (url) => {
  const decodedUrl = decodeURIComponent(url);
  const match = decodedUrl.match(/\/o\/(.+)\?alt=media/);
  return match ? match[1] : null;
};

const EditMusic = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [musicName, setMusicName] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatedMusicData, setUpdatedMusicData] = useState(null);

  const route = useRoute();
  const navigation = useNavigation();
  const existingMusic = route.params?.musicData;

  useEffect(() => {
    const musicId = existingMusic?.id;
    if (!musicId) return;

    const unsubscribe = onSnapshot(doc(db, 'musics', musicId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUpdatedMusicData({ id: docSnap.id, ...data });
        setMusicName(data.title);
        setThumbnail(data.thumbnail ? { uri: data.thumbnail } : null);
        setAudioFile({ uri: data.url, name: 'Arquivo existente' });
      }
    });

    return () => unsubscribe();
  }, []);

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
      if (result?.assets?.length > 0) {
        setAudioFile(result.assets[0]);
      }
    } catch (error) {
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

      if (result?.assets?.length > 0) {
        setThumbnail(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao selecionar a thumbnail.");
    }
  };

  const uploadUpdates = async () => {
    setLoading(true);

    if (!musicName || !existingMusic) {
      Alert.alert("Erro", "Nome da música inválido.");
      setLoading(false);
      return;
    }

    try {
      const updates = { title: musicName };

      if (audioFile && !audioFile.uri.startsWith('https://')) {
        const responseAudio = await fetch(audioFile.uri);
        const blobAudio = await responseAudio.blob();
        const audioRef = ref(storage, `musics/${Date.now()}_${audioFile.name}`);
        await uploadBytes(audioRef, blobAudio);
        updates.url = await getDownloadURL(audioRef);
      }

      if (thumbnail && !thumbnail.uri.startsWith('https://')) {
        const responseThumb = await fetch(thumbnail.uri);
        const blobThumb = await responseThumb.blob();
        const thumbRef = ref(storage, `thumbnails/${Date.now()}.jpg`);
        await uploadBytes(thumbRef, blobThumb);
        updates.thumbnail = await getDownloadURL(thumbRef);
      }

      const musicDocRef = doc(db, 'musics', existingMusic.id);
      await updateDoc(musicDocRef, updates);

      Alert.alert("Sucesso", "Música atualizada com sucesso!");
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      Alert.alert("Erro", "Ocorreu um erro ao atualizar.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMusic = () => {
    Alert.alert(
      "Excluir música",
      "Tem certeza que deseja excluir esta música?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir", style: "destructive", onPress: async () => {
            try {
              if (!updatedMusicData) return;

              // Deletar arquivo de áudio
              if (updatedMusicData.url) {
                const path = extractStoragePath(updatedMusicData.url);
                if (path) {
                  const audioRef = ref(storage, path);
                  await deleteObject(audioRef).catch(() => null);
                }
              }

              // Deletar thumbnail
              if (updatedMusicData.thumbnail) {
                const thumbPath = extractStoragePath(updatedMusicData.thumbnail);
                if (thumbPath) {
                  const thumbRef = ref(storage, thumbPath);
                  await deleteObject(thumbRef).catch(() => null);
                }
              }

              // Deletar documento no Firestore
              await deleteDoc(doc(db, 'musics', updatedMusicData.id));

              Alert.alert("Música excluída com sucesso.");
              navigation.goBack();
            } catch (error) {
              console.error("Erro ao excluir:", error);
              Alert.alert("Erro", "Ocorreu um erro ao excluir.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleDeleteMusic}
        style={{ position: 'absolute', top: 50, right: 20, zIndex: 10 }}
      >
        <Ionicons name="trash" size={30} color="red" />
      </Pressable>

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
        placeholder='Digite o Nome da Música'
        placeholderTextColor="#FFF"
        numberOfLines={2}
      />

      <Text style={styles.authorName}>{Auth.currentUser.displayName}</Text>

      {audioFile ? (
        <Pressable
          style={[styles.containerBtnUpload, { backgroundColor: 'transparent', marginTop: 25 }]}
          onPress={pickAudio}>
          <Text numberOfLines={2} style={styles.uploadBtn}>{`Áudio: ${audioFile.name}`}</Text>
        </Pressable>
      ) : (
        <Pressable style={[styles.containerBtnUpload, { marginTop: 40 }]} onPress={pickAudio}>
          <Text style={styles.uploadBtn}>Selecione uma música</Text>
        </Pressable>
      )}

      {loading ? (
        <ActivityIndicator color='#FFF' size={36} />
      ) : (
        <Pressable style={[styles.containerBtnUpload, { marginTop: 10 }]} onPress={uploadUpdates}>
          <Text style={styles.uploadBtn}>Atualizar Música</Text>
        </Pressable>
      )}
    </View>
  );
};

export default EditMusic;
