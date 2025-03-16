import React, { useState, useEffect, useContext } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StatusBar, TextInput, View } from 'react-native';

import { AuthContext } from '../../Context/AuthContext';
import { styles } from './styles';

import SearchFriends from '../SearchFriends';
import SearchMusic from '../SearchMusics';

const Tab = createMaterialTopTabNavigator();

export default () => {
  const API_URL = "https://api.deezer.com/search?q=";

  const { setMusicList } = useContext(AuthContext);

  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const getMusics = async () => {
      let query = searchText.trim() ? encodeURIComponent(searchText) : "top hits";
      let response;
  
      try {
        response = await fetch(`https://api.deezer.com/search?q=${query}`);
        let data = await response.json();
  
        if (!data || !data.data) {
          setMusicList([]); // Se não houver resultados, retorna lista vazia
          return;
        }
  
        const formattedResults = data.data.map(track => ({
          id: track.id,
          title: track.title,
          author: track.artist.name,
          thumbnail: track.album.cover_medium,
          duration: track.duration ?? '00:00',
          url: track.preview // URL do áudio de 30s
        }));
  
        setMusicList(formattedResults);
      } catch (error) {
        console.error("Erro na busca de músicas:", error);
      }
    };
  
    getMusics();
  }, [searchText]);

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
        <Tab.Screen name="Friends" component={SearchFriends} />
        <Tab.Screen name="Musics" component={SearchMusic} />
      </Tab.Navigator>
    </View>
  );
};
