import React, { useState } from "react";
import { Image, SafeAreaView, StatusBar, TextInput, Text, Pressable, View, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";

import { styles } from './styles';
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
                    routes: [{name: 'Main'}]
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

            <Image source={require('../../../assets/logo.jpg')} style={styles.logo} />
            
            <View style={{marginTop: 70}}>
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
