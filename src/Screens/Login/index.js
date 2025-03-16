import React, { useContext, useState } from "react";
import { Image, SafeAreaView, StatusBar, TextInput, Text, Pressable, View, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import {Ionicons} from '@expo/vector-icons';

import { Auth } from "../../Services/firebaseConfig";

export default () => {

    const navigation = useNavigation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            if (email !== '' && password !== '') {
                const user = await signInWithEmailAndPassword(Auth, email, password)
                
                navigation.reset({
                    routes: [{name: 'Home'}]
                });
                setLoading(false)
            } else {
                alert('Preencha todos os campos');
                setLoading(false);
            }
        } catch (error) {
            if (error.code === 'auth/invalid-email') {
                alert('Email inválido');
            }
            if (error.code === 'auth/invalid-credential') {
                alert('Algo esta errado, verifique e tente novamente');
            }
            setLoading(false);
        }
    }

    
    return(
        <SafeAreaView
            style={styles.container}
        >
            <StatusBar backgroundColor={'#000000'}/>
            {/* <Image style={styles.logo} source={require('../../assets/logoRagnarok.jpg')}/> */}

            <Ionicons name='play-circle' color='#000' size={140} style={{backgroundColor: '#FFF', borderRadius: 999}} />
            
            <View style={{
                marginTop: 70,
            }}>
                <TextInput 
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Digite seu Email" 
                    placeholderTextColor={"skyblue"}
                    style={styles.input} />
            </View>
            
            <View style={{
                marginTop: 30,
            }}>
                <TextInput 
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Digite sua Senha"
                    placeholderTextColor={"skyblue"}
                    secureTextEntry={true}
                    style={styles.senha} />
            </View>

            <Pressable onPress={handleLogin} style={styles.btnLogin}>
                <Text style={styles.btnLoginText}>{loading ? <ActivityIndicator size='large' color='#FFF' /> : 'Entrar'}</Text>
            </Pressable>
            <Pressable style={styles.btnConta} onPress={() => {
                navigation.reset({
                    routes: [{name: 'Register'}]
                });
            }}>
                <Text style={styles.txtCriarConta}>Ainda não possui conta? </Text>
                <Text style={styles.cadastre}>Cadastre-se</Text>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: '#0A0509',
        justifyContent: 'center',
        alignItems: 'center',    
    },
    logo: {
        width: 384, 
        height: 300,
    },
    input: {
        borderRadius: 99999,
        paddingLeft: 20,
        fontSize: 18,
        width: 350, 
        height: 50,
        backgroundColor: '#FFFFFF',
        color: 'skyblue',
    },
    senha: {
        borderRadius: 99999,
        paddingLeft: 20,
        fontSize: 18,
        width: 350, 
        height: 50,
        backgroundColor: '#FFFFFF',
        color: 'skyblue',
    },
    btnLogin: {
        marginTop: 30,
        backgroundColor: 'skyblue',
        width: 350,
        height: 50,
        borderRadius: 99999,
        justifyContent: 'center', 
        alignItems: 'center',
    },
    btnLoginText: {
        color: '#FFFFFF',
        fontSize: 28,
        textTransform: 'uppercase',
        fontFamily: 'god-of-war',
    },
    btnConta: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    txtCriarConta: {
        color: '#FFFFFF',
    },
    cadastre: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
})