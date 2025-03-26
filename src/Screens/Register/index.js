import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { SafeAreaView, StatusBar, TextInput, Text, Pressable, View, ActivityIndicator, Image } from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

import { Auth, db } from "../../Services/firebaseConfig";
import { styles } from "./styles";

export default () => {
    const navigation = useNavigation();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const SignUp = async () => {
        setLoading(true);
        if (password.length > 6) {
            alert('A senha precisa ter no minimo 6 caracteres');
            setLoading(false);
        }
        if (username.length < 3) {
            alert('O nome de usuário não pode ser menor que 2 caracteres.');
            setLoading(false);
        }

        if (username !== '' && username !== null && username.length >= 3 && email && password) {
            try {
                const userCredential = await createUserWithEmailAndPassword(Auth, email, password)
                updateProfile(Auth.currentUser, {
                    displayName: username,
                    photoURL: "https://i.pinimg.com/236x/21/9e/ae/219eaea67aafa864db091919ce3f5d82.jpg",
                });
                const user = userCredential.user;

                const userData = {
                    uid: user.uid,
                    displayName: username,
                    photo: "https://i.pinimg.com/236x/21/9e/ae/219eaea67aafa864db091919ce3f5d82.jpg",
                    description: "",
                    followers: [],
                    following: [],
                    followersCount: 0,
                    followingCount: 0,
                    publicacoes: [],
                    top10Musicas: [],
                    wallpaper: null,
                };

                await setDoc(doc(db, "users", user.uid), userData);

                navigation.reset({
                    routes: [{ name: 'Main' }]
                });
                setLoading(false);

            }
            catch (error) {
                if (error.code === 'Auth/email-already-in-use') {
                    alert('Email já cadastrado');
                }
                if (error.code === 'Auth/invalid-email') {
                    alert('Email inválido');
                }
                setLoading(false);
            }

        } else {
            alert('Preencha todos os campos');
        }

    }

    return (
        <SafeAreaView
            style={styles.container}
        >
            <StatusBar backgroundColor={'#000000'} />
            {/* <Image style={styles.logo} source={require('../../assets/logoRagnarok.jpg')}/> */}

            <Image source={require('../../../assets/logo.jpg')} style={styles.logo} />

            <View style={{
                marginTop: 40,
            }}>
                <TextInput
                    onChangeText={setUsername}
                    value={username}
                    placeholder="Digite seu Nome"
                    placeholderTextColor={"skyblue"}
                    style={styles.input} />
            </View>

            <View style={{
                marginTop: 30,
            }}>
                <TextInput
                    onChangeText={setEmail}
                    value={email}
                    placeholder="Digite seu Email"
                    placeholderTextColor={"skyblue"}
                    style={styles.input} />
            </View>

            <View style={{
                marginTop: 30,
            }}>
                <TextInput
                    onChangeText={setPassword}
                    value={password}
                    placeholder="Digite sua Senha"
                    placeholderTextColor={"skyblue"}
                    secureTextEntry={true}
                    style={styles.input} />
            </View>

            <Pressable style={styles.btnCadastrar} onPress={SignUp}>
                <Text style={styles.btnCadastrarText}>{loading ? <ActivityIndicator size='large' color='#FFF' /> : 'Cadastrar'}</Text>
            </Pressable>

            <Pressable style={styles.linkLogin} onPress={() =>
                navigation.reset({
                    routes: [{ name: 'Login' }]
                })
            }>
                <Text style={styles.linkLoginText}>ja possui conta? </Text>
                <Text style={styles.linkLoginTextEntrar}>Entrar</Text>
            </Pressable>
        </SafeAreaView>
    );
}