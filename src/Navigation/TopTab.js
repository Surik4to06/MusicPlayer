import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import Chats from '../Screens/Chats';
import PlaylistFrinds from '../Screens/PlaylistFrinds';
import { View, StyleSheet, StatusBar } from 'react-native';

const Tab = createMaterialTopTabNavigator();

export default ({ route }) => {
  const { userId, friendId, photo, friendUsername } = route.params || {};

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Tab.Navigator 
        screenOptions={{
            tabBarStyle: { display: "none" }
        }}>
        <Tab.Screen 
          name="Chats"
          children={() => <Chats userId={userId} friendId={friendId} photo={photo} friendUsername={friendUsername} />} 
        />
        <Tab.Screen 
          name="PlaylistFrinds" 
          children={() => <PlaylistFrinds userId={userId} friendId={friendId} />} 
        />
      </Tab.Navigator>
    </View>
  );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});