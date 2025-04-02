import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, Pressable, ActivityIndicator } from "react-native";
import { Auth, db } from "../../Services/firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { styles } from "./styles";
import { useNavigation, useRoute } from "@react-navigation/native";

export default () => {
    const [userMusics, setUserMusics] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigation = useNavigation();
    const route = useRoute();

    // Obtém o userId da rota ou usa o do usuário logado
    const userId = route.params?.userId || Auth.currentUser?.uid;

    useEffect(() => {
        if (userId) {
            fetchUserMusics();
        }
    }, [userId]);

    const fetchUserMusics = () => {
        setLoading(true);

        try {
            if (!userId) {
                console.error("Erro: userId indefinido.");
                setLoading(false);
                return;
            }

            const q = query(collection(db, "musics"), where("uidAuthor", "==", userId));

            // Escuta mudanças em tempo real
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const musics = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setUserMusics(musics);
                setLoading(false);
            });

            // Retorna a função para cancelar a escuta ao desmontar o componente
            return () => unsubscribe();

        } catch (error) {
            console.error("Erro ao buscar músicas do usuário:", error);
            setLoading(false);
        }
    };


    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#FFF" />
            ) : userMusics.length > 0 ? (
                <FlatList
                    contentContainerStyle={{ paddingBottom: 53, paddingTop: 3 }}
                    data={userMusics}
                    keyExtractor={(item) => item.id}
                    numColumns={3}
                    renderItem={({ item }) => (
                        <Pressable onPress={() => navigation.navigate('PlayerMusic', { playerMusic: item })}>
                            <Image source={{ uri: item.thumbnail }} style={styles.videos} />
                        </Pressable>
                    )}
                />
            ) : (
                <Text style={styles.emptyText}>Usuário não possui nenhuma música</Text>
            )}
        </View>
    );
};
