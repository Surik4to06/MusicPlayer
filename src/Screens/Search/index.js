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
  // const API_URL = "https://api.deezer.com/search?q=";

  const { setMusicList, setUsersList } = useContext(AuthContext);

  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const getResults = async () => {
      let query = searchText.trim() ? encodeURIComponent(searchText) : "top hits";
      let response;
  
      try {
        // 🔍 Buscar Músicas
        response = await fetch(`https://api.deezer.com/search?q=${query}`);
        let data = await response.json();
  
        if (!data || !data.data) {
          setMusicList([]);
        } else {
          const formattedResults = data.data.map(track => ({
            id: track.id,
            title: track.title,
            author: track.artist.name,
            thumbnail: track.album.cover_medium,
            duration: track.duration ?? '00:00',
            url: track.preview
          }));
          setMusicList(formattedResults);
        }
  
        // Buscar Usuários
        const usersResults = await searchUsers(searchText);
        setUsersList(usersResults);
      } catch (error) {
        console.error("Erro na busca:", error);
      }
    };
  
    getResults();
  }, [searchText]);

  const searchUsers = async (searchTerm) => {
    if (!searchTerm.trim()) return []; // Se a pesquisa estiver vazia, retorna uma lista vazia
  
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("displayName", ">=", searchTerm));
  
      const querySnapshot = await getDocs(q);
      const users = [];
  
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
  
      return users;
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
          placeholder='Find new Friends and Sounds'
          value={searchText}
          onChangeText={setSearchText}
          style={styles.inputText}
        />
      </View>

      <Tab.Navigator>
        <Tab.Screen name="Users" component={SearchFriends} />
        <Tab.Screen name="Musics" component={SearchMusic} />
      </Tab.Navigator>
    </View>
  );
};
