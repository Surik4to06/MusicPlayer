import React from "react";
import { ActivityIndicator, Image, SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { Ionicons } from '@expo/vector-icons';

import { Auth } from "../../Services/firebaseConfig";
import { styles } from './styles';

export default () => {

    const navigation = useNavigation();

    onAuthStateChanged(Auth, (user) => {
        if (user) {
            navigation.reset({
                routes: [{name: 'Main'}]
            });
        } else {
            navigation.reset({
                routes: [{name: 'Login'}]
            });
        } 
    });


    return(
        <SafeAreaView
            style={styles.container}
        >
            <StatusBar backgroundColor={'#000000'}/>
            <Ionicons name='play-circle' color='#000' size={170} style={{backgroundColor: '#FFF', borderRadius: 999}} />
            <ActivityIndicator style={styles.loading} size='large' color='skyblue' />
        </SafeAreaView>
    );
}