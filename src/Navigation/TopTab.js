import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import Friends from '../Screens/Friends';
import Chats from '../Screens/Chats';
import PlaylistFrinds from '../Screens/PlaylistFrinds';
import { View, StyleSheet, StatusBar } from 'react-native';

const Tab = createMaterialTopTabNavigator();

export default () => {
  return (
        <View style={styles.container}>
            <StatusBar style='light' />
            <Tab.Navigator>
                <Tab.Screen name="Friends" component={Friends} />
                <Tab.Screen name="Chats" component={Chats} />
                <Tab.Screen name="PlaylistFrinds" component={PlaylistFrinds} />
            </Tab.Navigator>
        </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
});