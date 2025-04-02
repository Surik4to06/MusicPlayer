import React, { useState, useEffect, useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import Home from "../Screens/Home";
import Profile from "../Screens/Profile";
import Friends from "../Screens/Friends";
import Search from "../Screens/Search";
import { AuthContext } from "../Context/AuthContext";
import Uploads from "../Screens/Uploads";

const Tab = createBottomTabNavigator();

export default () => {
    const {totalUnreadMessages} = useContext(AuthContext);
    const [unreadFriendsCount, setUnreadFriendsCount] = useState(null);

    useEffect(() => {
        const fetchUnreadFriends = () => {
            setUnreadFriendsCount(totalUnreadMessages);
        };

        fetchUnreadFriends();
    }, [totalUnreadMessages]);

    return (
        <Tab.Navigator 
            screenOptions={{ 
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#212121',
                    borderTopWidth: 0,
                    borderTopRightRadius: 20,
                    borderTopLeftRadius: 20,
                    overflow: 'hidden',
                    position: 'absolute',
                    padding: 15,
                    height: 60,
                }
             }}
            >
            <Tab.Screen 
                name="Home" 
                component={Home} 
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons 
                            name={focused ? "home" : "home-outline"} 
                            color={color} 
                            size={28} 
                        />
                    ),
                }} 
            />
            <Tab.Screen 
                name="Friends" 
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons 
                            name={focused ? "people" : "people-outline"} 
                            color={color} 
                            size={28} 
                        />
                    ),
                    tabBarBadge: unreadFriendsCount > 0 ? unreadFriendsCount : null, // Atualiza a badge
                }}
            >
                {() => <Friends setUnreadFriendsCount={unreadFriendsCount} />}
            </Tab.Screen>
            <Tab.Screen 
                name="Criar" 
                component={Uploads} 
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons 
                            name={focused ? "add" : "add-outline"} 
                            color={color} 
                            size={28} 
                        />
                    ),
                }} 
            />
            <Tab.Screen 
                name="Search" 
                component={Search} 
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons 
                            name={focused ? "search" : "search-outline"} 
                            color={color} 
                            size={28} 
                        />
                    ),
                }} 
            />
            <Tab.Screen 
                name="Profile" 
                component={Profile} 
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons 
                            name={focused ? "person" : "person-outline"} 
                            color={color} 
                            size={28} 
                        />
                    ),
                }} 
            />
        </Tab.Navigator>
    );
};
