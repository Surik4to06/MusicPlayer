import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { Video } from 'expo-av'; // Importando o Video do expo-av

import { Auth } from "../../Services/firebaseConfig";
import { styles } from './styles';

export default () => {
    const navigation = useNavigation();
    const [status, setStatus] = useState({});

    // Função para carregar e reproduzir o vídeo
    const handleStatusUpdate = (status) => {
        setStatus(status);
        if (status.didJustFinish) {
            // Verifica se o vídeo terminou
            onAuthStateChanged(Auth, (user) => {
                if (user) {
                    navigation.reset({
                        routes: [{ name: 'Main' }]
                    });
                } else {
                    navigation.reset({
                        routes: [{ name: 'Login' }]
                    });
                }
            });
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#212121' }}>
            <Video
                source={require('../../../assets/openning.mp4')} // Caminho para o arquivo de vídeo
                style={{ width: '100%', height: '100%', flex: 1 }} // O vídeo vai preencher a tela
                isLooping={false} // Não faz loop
                shouldPlay={true} // Começa a reprodução automaticamente
                onPlaybackStatusUpdate={handleStatusUpdate} // Atualiza o status do playback
            />
        </View>
    );
};
