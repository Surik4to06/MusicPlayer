import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    Alert
} from 'react-native';

import { useSocialData } from '../Services/socialData';
import { Auth, db } from '../Services/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const CompartilharPlaylistModal = ({ user, showShareModal, setShowShareModal, playlist }) => {
    const { friendsList } = useSocialData(user);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const sharePlaylist = async (item) => {
        try {
            const userRef = doc(db, "users", Auth.currentUser.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) return;

            const { following = [] } = userSnap.data();
            const ehMutuo = following.find(p => p.uid === item.uid);

            if (!ehMutuo) {
                Alert.alert("Amizade necessária", "Você só pode compartilhar com amigos que te seguem também.");
                return;
            }

            const playlistRef = doc(db, "playlists", playlist.id);
            const playlistSnap = await getDoc(playlistRef);

            if (!playlistSnap.exists()) return;

            const playlistData = playlistSnap.data();
            const members = playlistData.members || [];

            const isMember = members.some(m => m.uid === item.uid);
            if (isMember) {
                Alert.alert("Já está na Playlist", "Esse usuário já está na playlist.");
                return;
            }

            // Adiciona o amigo ao array de members
            await updateDoc(playlistRef, {
                members: [...members, 
                    item.uid
                ]
            });

            setShowShareModal(false);
            
        } catch (err) {
            console.log("Erro ao compartilhar playlist:", err);
            Alert.alert("Erro", "Algo deu errado ao compartilhar a playlist.");
        }
    };

    const confirmarCompartilhamento = (item) => {
        Alert.alert(
            'Compartilhar Playlist',
            `Tem certeza que deseja compartilhar a playlist com ${item.displayName}?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Compartilhar',
                    onPress: async () => {
                        await sharePlaylist(item);
                        setShowSuccessPopup(true);
                        setTimeout(() => setShowSuccessPopup(false), 2000);
                    },
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <>
            <Modal visible={showShareModal} animationType="slide" transparent>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center' }}>
                    <View style={{ backgroundColor: '#111', margin: 20, borderRadius: 10, padding: 20 }}>
                        <Text style={{ fontSize: 18, color: '#FFF', marginBottom: 10 }}>Compartilhar com...</Text>
                        <FlatList
                            data={friendsList}
                            keyExtractor={(item) => item.uid}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
                                    onPress={() => confirmarCompartilhamento(item)}
                                >
                                    <Image
                                        source={{ uri: item.photo }}
                                        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
                                    />
                                    <Text style={{ color: '#FFF' }}>{item.displayName}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            onPress={() => setShowShareModal(false)}
                            style={{ marginTop: 20, alignSelf: 'flex-end' }}
                        >
                            <Text style={{ color: 'red' }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Popup de sucesso */}
            {showSuccessPopup && (
                <View
                    style={{
                        position: 'absolute',
                        bottom: 20,
                        left: 20,
                        right: 20,
                        backgroundColor: '#222',
                        padding: 15,
                        borderRadius: 10,
                        alignItems: 'center',
                        elevation: 4,
                    }}
                >
                    <Text style={{ color: 'white' }}>Compartilhado com sucesso!</Text>
                </View>
            )}
        </>
    );
};

export default CompartilharPlaylistModal;
