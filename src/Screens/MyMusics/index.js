import React from "react";
import { View, Text, Image, FlatList } from "react-native";

import { styles } from "./styles";

export default () => {

    const numColumns = 3


    const userMusics = [
        {
            id: '1',
            photo: require('../../../assets/animeTeste.jpg'),
        },
        {
            id: '2',
            photo: require('../../../assets/animeTeste.jpg'),
        },
        {
            id: '3',
            photo: require('../../../assets/animeTeste.jpg'),
        },
        {
            id: '4',
            photo: require('../../../assets/animeTeste.jpg'),
        },
        {
            id: '5',
            photo: require('../../../assets/animeTeste.jpg'),
        },
        {
            id: '6',
            photo: require('../../../assets/animeTeste.jpg'),
        },
        {
            id: '7',
            photo: require('../../../assets/animeTeste.jpg'),
        },
        {
            id: '8',
            photo: require('../../../assets/animeTeste.jpg'),
        },
        {
            id: '9',
            photo: require('../../../assets/animeTeste.jpg'),
        },
        {
            id: '10',
            photo: require('../../../assets/animeTeste.jpg'),
        },
        {
            id: '11',
            photo: require('../../../assets/animeTeste.jpg'),
        },
        {
            id: '12',
            photo: require('../../../assets/animeTeste.jpg'),
        },
        {
            id: '13',
            photo: require('../../../assets/animeTeste.jpg'),
        },
        {
            id: '14',
            photo: require('../../../assets/animeTeste.jpg'),
        },
        {
            id: '15',
            photo: require('../../../assets/animeTeste.jpg'),
        },
        {
            id: '16',
            photo: require('../../../assets/animeTeste.jpg'),
        },
    ]

    return(
        
        <View style={styles.container}>
            <FlatList
                data={userMusics}
                keyExtractor={(item) => item.id}
                numColumns={numColumns}
                renderItem={({item}) => (
                    <Image source={item.photo} style={styles.videos}/>
                )}/>
                
            
            {/* <Text>Usuário nn possui nenhuma musica</Text> */}
        </View>
    );
}