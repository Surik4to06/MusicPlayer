import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import { Auth } from "../../Services/firebaseConfig";
import { styles } from "./styles";

import MyMusics from "../MyMusics";
import Likeds from "../Likeds";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";

const Tab = createMaterialTopTabNavigator();

export default () => {

    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.containerSecond}>
                <View style={styles.containerHeader}>
                    {/* Cabeçalho do perfil */}
                    {/* <View style={styles.containerButtonsHeader}>
                    <Ionicons style={{marginLeft: -3}} name="chevron-back" color='#FFF' size={30} />
                </View> */}

                    <View style={styles.containerButtonsHeader}>
                        <Pressable onPress={() => {
                            signOut(Auth);

                            navigation.reset({
                                routes: [{name: 'Login'}]
                            });
                        }}>
                            <Ionicons name="settings-outline" color='#FFF' size={30} />
                        </Pressable>
                    </View>
                </View>

                {/* Dados do usuário */}
                <View style={styles.containerTerd}>
                    <Pressable>
                        <Image source={{ uri: Auth.currentUser.photoURL }} style={{ width: 150, height: 150, borderRadius: 999 }} />
                    </Pressable>

                    <Text style={styles.username}>{Auth.currentUser.displayName}</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '50%', marginTop: 10 }}>
                        <View>
                            <Text style={styles.numDados}>300</Text>
                            <Text style={styles.textDados}>Seguidores</Text>

                        </View>

                        <View>
                            <Text style={styles.numDados}>10</Text>
                            <Text style={styles.textDados}>Seguindo</Text>

                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '65%', marginTop: 20 }}>
                        <Pressable style={styles.btnProfile}>
                            <Text style={styles.btnProfileText}>Seguir</Text>
                        </Pressable>
                        <Pressable style={styles.btnProfile} onPress={() => navigation.navigate('EditProfile')}>
                            <Text style={styles.btnProfileText}>Editar Perfil</Text>
                        </Pressable>
                    </View>


                </View>
            </View>

            {/* Conteudo do perfil... */}
            <Tab.Navigator screenOptions={{
                tabBarLabelStyle: {
                    color: '#FFF'
                },
                tabBarStyle:
                {
                    backgroundColor: '#000',
                }
            }}>
                <Tab.Screen name="MyMusics" component={MyMusics} />
                <Tab.Screen name="Liked" component={Likeds} />
            </Tab.Navigator>
        </View>
    );
}

