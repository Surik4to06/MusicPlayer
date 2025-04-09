import React, { useState, useEffect, useContext } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { StatusBar, TextInput, View } from 'react-native';

import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "../../Services/firebaseConfig";

import { AuthContext } from '../../Context/AuthContext';
import { styles } from './styles';

import SearchFriends from '../SearchFriends';
import SearchMusic from '../SearchMusics';

const Tab = createMaterialTopTabNavigator();

export default () => {
  const { currentSound } = useContext(AuthContext);

  const { setMusicList, setUsersList } = useContext(AuthContext);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    // Quando o texto de busca mudar, pausar a música
    if (searchText.trim() && currentSound) {
      currentSound.pauseAsync();
    }
  }, [searchText]);

  useEffect(() => {
    const getResults = async () => {
      try {
        const [firebaseResults, audiusResults, usersResults] = await Promise.all([
          searchMusicInFirebase(searchText),
          searchMusicInAudius(searchText),
          searchUsers(searchText)
        ]);

        setMusicList([...firebaseResults, ...audiusResults]);
        setUsersList(usersResults);
      } catch (error) {
        console.error("Erro na busca:", error);
      }
    };

    getResults();
  }, [searchText]);

  // Pesquisa músicas no Firebase
  const searchMusicInFirebase = async (searchTerm) => {
    try {
      const musicRef = collection(db, "musics");

      let q;

      if (searchTerm.trim()) {
        q = query(
          musicRef,
          where("title", ">=", searchTerm),
          where("title", "<=", searchTerm + "\uf8ff"),
          limit(20) // opcional: limitar mesmo em busca
        );
      } else {
        q = query(
          musicRef,
          orderBy("title"),
          limit(10) // quando sem busca, pega só os primeiros 10
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        author: doc.data().author || "Desconhecido",
        thumbnail: doc.data().thumbnail || null,
        url: doc.data().url,
        source: "firebase"
      }));
    } catch (error) {
      console.error("Erro ao buscar no Firebase:", error);
      return [];
    }
  };

  // Pesquisa músicas na API Audius
  const searchMusicInAudius = async (searchTerm) => {
    const termosBR = ["mpb", "trap", "sertanejo", "funk", "bossa", "pagode"];
    const termos = searchTerm?.trim() ? [searchTerm] : termosBR;

    try {
      const results = await Promise.all(
        termos.map(term =>
          fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(term)}&app_name=MusicFinder`)
            .then(res => res.json())
            .then(data => data.data || [])
        )
      );

      const allTracks = results.flat()
        .filter((track, index, self) =>
          !!track.id && self.findIndex(t => t.id === track.id) === index
        )
        .map(track => ({
          id: track.id.toString(),
          title: track.title,
          author: track.user?.name || 'Desconhecido',
          thumbnail: track.artwork?.['150x150'] || track.artwork?.['480x480'] || null,
          url: `https://discoveryprovider.audius.co/v1/tracks/${track.id}/stream?app_name=MusicFinder`,
          source: "audius"
        }));

      return allTracks.slice(0, 10); // retorna só as 10 primeiras
    } catch (error) {
      console.error("Erro ao buscar no Audius:", error);
      return [];
    }
  };



  // Pesquisa usuários no Firebase
  const searchUsers = async (searchTerm) => {
    if (!searchTerm.trim()) return [];

    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("displayName", ">=", searchTerm),
        where("displayName", "<=", searchTerm + "\uf8ff")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return [];
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style='light' />

      <View style={styles.containerInput}>
        <TextInput
          placeholder='Pesquisar por amigos ou músicas'
          placeholderTextColor='#212121'
          value={searchText}
          onChangeText={setSearchText}
          style={styles.inputText}
        />
      </View>

      <Tab.Navigator screenOptions={{
        tabBarStyle: { backgroundColor: '#000' },
        tabBarInactiveTintColor: 'gray',
        tabBarActiveTintColor: '#FFF',
        tabBarIndicatorStyle: { backgroundColor: '#FFF' },
      }}>
        <Tab.Screen name="Users" component={SearchFriends} />
        <Tab.Screen name="Musics" component={SearchMusic} />
      </Tab.Navigator>
    </View>
  );
};
