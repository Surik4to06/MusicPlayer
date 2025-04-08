import React from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, Pressable } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';

import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';
import { Auth } from '../firebaseConfig';
import { useSocialData } from '../socialData';

const Tab = createMaterialTopTabNavigator();


const ListScreen = ({ data }) => {

  const navigation = useNavigation();

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.uid}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => {
            navigation.navigate("ProfileScreen", { userId: item.uid });
          }}>
          <View style={styles.listItem}>
            <Image source={{ uri: item.photo }} style={styles.avatar} />
            <Text style={styles.username}>{item.displayName}</Text>
          </View>
          <View style={styles.line} />
        </Pressable>
      )}
      ListEmptyComponent={
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
          Nenhum usuário encontrado.
        </Text>
      }
    />
  )
};

const FollowersFollowingScreen = ({ navigation }) => {
  const uid = Auth.currentUser?.uid;
  const { followersList, followingList, friendsList, loading } = useSocialData(uid);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Carregando conexões...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Conexões</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#FFF" />
        </Pressable>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarIndicatorStyle: styles.tabBarIndicator,
        }}
      >
        <Tab.Screen name="Seguidores">
          {() => <ListScreen data={followersList} />}
        </Tab.Screen>
        <Tab.Screen name="Seguindo">
          {() => <ListScreen data={followingList} />}
        </Tab.Screen>
        <Tab.Screen name="Amigos">
          {() => <ListScreen data={friendsList} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
};

export default FollowersFollowingScreen;
