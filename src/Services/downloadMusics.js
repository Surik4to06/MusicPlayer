import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

export const downloadMusic = async (url, fileName) => {
    try {
        // Pedir permissão para salvar arquivos na galeria
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão Negada', 'Você precisa permitir o acesso ao armazenamento para baixar músicas.');
            return;
        }

        // Pedir permissão extra para Android 9 ou inferior
        if (Platform.OS === 'android' && Platform.Version < 29) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert('Permissão Negada', 'Não foi possível salvar a música.');
                return;
            }
        }

        // Caminho para salvar o arquivo
        const fileUri = FileSystem.documentDirectory + fileName + ".mp3";

        // Baixar o arquivo
        const { uri } = await FileSystem.downloadAsync(url, fileUri);
        
        // Salvar na galeria
        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync('Download', asset, false);
        
        Alert.alert('Download Concluído', 'A música foi salva com sucesso!');
    } catch (error) {
        console.error('Erro ao baixar música:', error);
        Alert.alert('Erro', 'Falha ao baixar a música.');
    }
};
