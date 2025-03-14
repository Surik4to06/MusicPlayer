import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from '@expo/vector-icons';

import Home from "../Screens/Home";
import Profile from "../Screens/Profile";
import TopTab from "./TopTab";
import Search from "../Screens/Search";

export default () => {

    const Tab = createBottomTabNavigator();

    return(
        <Tab.Navigator screenOptions={{headerShown: false}}>
            <Tab.Screen 
                name="Home" 
                component={Home} 
                options={{
                    tabBarIcon: ({ focused, color }) => {
                        if (focused) {
                            
                            return (<Ionicons name="home" color={color} size={28} />)

                        } 
                        
                        return (<Ionicons name="home-outline" color={color} size={28} />)
                    },
                }} />
            <Tab.Screen 
                name="Friends" 
                component={TopTab} 
                options={{
                    tabBarIcon: ({ focused, color }) => {
                        if (focused) {
                            
                            return (<Ionicons name="people" color={color} size={28} />)

                        } 
                        
                        return (<Ionicons name="people-outline" color={color} size={28} />)
                    },
                }} />
            <Tab.Screen 
                name="Search" 
                component={Search} 
                options={{
                    tabBarIcon: ({ focused, color }) => {
                        if (focused) {
                            
                            return (<Ionicons name="search" color={color} size={28} />)

                        } 
                        
                        return (<Ionicons name="search-outline" color={color} size={28} />)
                    },
                }} />
            <Tab.Screen 
                name="Profile" 
                component={Profile} 
                options={{
                    tabBarIcon: ({ focused, color }) => {
                        if (focused) {
                            
                            return (<Ionicons name="person" color={color} size={28} />)

                        } 
                        
                        return (<Ionicons name="person-outline" color={color} size={28} />)
                    },
                }} />
        </Tab.Navigator>
    );
}