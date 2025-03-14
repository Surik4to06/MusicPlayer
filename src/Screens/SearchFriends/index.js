import React, { useState } from "react";
import { View, Text, FlatList, Pressable, Image, Modal } from "react-native";

import { styles } from "./styles";


export default () => {

    const [showPhoto, setShowPhoto] = useState(null);

    const listFriendsTemp = [
        {
            id: '1', // subistituir dps pra uid do usuario 
            username: 'Surik4to06',
            photo: require('../../../assets/animeTeste.jpg'),
            description: 'Digitando...',
        },
    ];

    const renderItem = ({ item }) => {
        return(
            <Pressable onPress={() => setShowPhoto(true)}>
                <View style={styles.containerCard}>
                    <Image source={item.photo} style={styles.photoUser} />
                    <View style={{marginLeft: 10}}>
                        <Text style={styles.username}>{item.username}</Text>
                        <Text style={styles.description}>{item.description}</Text>
                    </View>
                </View>
            </Pressable>
        );
    }

    return (
        <View style={styles.container}>
          <FlatList 
            style={{width: '95%'}}
            data={listFriendsTemp}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />  
          
            {/* Abrir modal com informações do usuário e pedir pra ser amg ou seguir, ainda nn decidi ,_, */}
            {showPhoto && 
                <Modal
                    transparent={true}
                    visible={!!showPhoto}
                    onRequestClose={() => setShowPhoto(null)}>

                        <View style={styles.modalBackground}>
                            <View style={styles.modal}>
                                <Text>asnfuiafiaf</Text>
                                <Image source={listFriendsTemp[0].photo} style={{width: 300, height: 300}} />

                            </View>
                        </View>
                    

                </Modal>
            
            }
        </View>
    );
}