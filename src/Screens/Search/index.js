import React, { useState, useCallback, useContext } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
// import YoutubePlayer from "react-native-youtube-iframe";
import { Pressable, StatusBar, TextInput, View } from 'react-native';

import { AuthContext } from '../../Context/AuthContext';

const API_KEY = "AIzaSyAQNvXyPu6_-6RzHDYFBk5mE781UUZwK-A";
//AIzaSyCPm16OPnigXDEBa548R9lo_Z4AHEo3y6k


import { styles } from './styles';

import SeachFriends from '../SearchFriends';
import SearchMusic from '../SearchMusics';
// import PlaylistFrinds from '../PlaylistFrinds';

const Tab = createMaterialTopTabNavigator();

export default () => {

    const {setMusicList} = useContext(AuthContext);

    // const [playing, setPlaying] = useState(false);
    const [searchText, setSearchText] = useState('');
    // const [musicsList, setMusicList] = useState(null);

    // const onStateChange = useCallback((state) => {
    //   if (state === "ended") {
    //     setPlaying(false);
    //   }
    // }, []);

    const API_KEY = "AIzaSyCPm16OPnigXDEBa548R9lo_Z4AHEo3y6k"; //  youtube api key

    const fetchYouTubeVideos = async (query) => {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=10&key=${API_KEY}`;
      
        try {
          const response = await fetch(url);
          const data = await response.json();
      
          if (data.items.length > 0) {
            const videos = await Promise.all(data.items.map(async (item) => {
              const channelId = item.snippet.channelId;
              const channelImage = await fetchChannelInfo(channelId); // Pega a foto do autor
      
              setMusicList( {
                title: item.snippet.title,
                videoId: item.id.videoId,
                thumbnail: item.snippet.thumbnails.high.url,
                author: item.snippet.channelTitle,
                authorImage: channelImage, // Foto do autor
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`
              });
            }));
      
            console.log("Vídeos encontrados:", videos);
            return videos;
          } else {
            console.log("Nenhum vídeo encontrado.");
            return [];
          }
        } catch (error) {
          console.error("Erro ao buscar vídeos:", error);
        }
      };
      
      const fetchChannelInfo = async (channelId) => {
        const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${API_KEY}`;
      
        try {
          const response = await fetch(url);
          const data = await response.json();
      
          if (data.items.length > 0) {
            return data.items[0].snippet.thumbnails.high.url; // Retorna a foto do autor
          } else {
            return null;
          }
        } catch (error) {
          console.error("Erro ao buscar canal:", error);
        }
      };

    // fetchYouTubeVideos(searchText);

  return (
        <View style={styles.container}>
            <StatusBar style='light' />
            {/* <View style={{flex: 1}}>
            {/* <YoutubePlayer
                height={300}
                play={playing}
                videoId={videoId} // O ID do vídeo do YouTube
                onChangeState={onStateChange}
            />
            </View> */}
            <View style={styles.containerInput}>
                <TextInput
                    placeholder='Find new Friends and Sounds'
                    value={searchText}
                    onChangeText={setSearchText} 
                    style={styles.inputText} />

                    <Pressable style={styles.containerIcon}>
                        <Ionicons name='search' color={'#FFF'} size={28} style={styles.icon} />
                    </Pressable>
            </View>
            <Tab.Navigator>
                <Tab.Screen name="Friends" component={SeachFriends} />
                <Tab.Screen name="Musics" component={SearchMusic} />
                {/* <Tab.Screen name="PlaylistFrinds" component={PlaylistFrinds} /> */}
            </Tab.Navigator>
        </View>
  );
}