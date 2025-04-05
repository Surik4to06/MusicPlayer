import React, { useState, useEffect, useContext } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { StatusBar, TextInput, View } from 'react-native';

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../Services/firebaseConfig";

import { AuthContext } from '../../Context/AuthContext';
import { styles } from './styles';

import SearchFriends from '../SearchFriends';
import SearchMusic from '../SearchMusics';

const Tab = createMaterialTopTabNavigator();

export default () => {
  const { setMusicList, setUsersList } = useContext(AuthContext);
  const [searchText, setSearchText] = useState('');

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
      const q = query(
        musicRef,
        where("title", ">=", searchTerm),
        where("title", "<=", searchTerm + "\uf8ff")
      );

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
    let search = searchTerm?.trim() || "top hits";
  
    try {
      const query = encodeURIComponent(search);
      const response = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${query}&app_name=MusicFinder`);
      const data = await response.json();
  
      if (!data || !data.data) return [];
  
      const tracks = data.data
        .filter(track => !!track.id) // só tracks com ID válido
        .map(track => ({
          id: track.id.toString(),
          title: track.title,
          author: track.user?.name || 'Desconhecido',
          thumbnail: track.artwork?.['150x150'] || track.artwork?.['480x480'] || null,
          url: `https://discoveryprovider.audius.co/v1/tracks/${track.id}/stream?app_name=MusicFinder`,
          source: "audius"
        }));
  
      return tracks;
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
      }}>
        <Tab.Screen name="Users" component={SearchFriends} />
        <Tab.Screen name="Musics" component={SearchMusic} />
      </Tab.Navigator>
    </View>
  );
};
