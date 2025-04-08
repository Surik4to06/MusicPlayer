import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../Screens/Login";
import BottomTab from "./BottomTab";
import Register from "../Screens/Register";
import Preload from "../Screens/Preload";
import EditProfile from "../Screens/EditProfile";
import PlayerModal from "../Components/PlayerMusic";
import ProfileScreen from "../Components/profileScreen";
import TopTab from "./TopTab";
import Player from "../Components/playerPlaylist";
import PlaylistScreen from "../Screens/PlaylistScreen";
import editPlaylist from "../Components/editPlaylist";
import FollowersFollowingScreen from "../Services/followersAndFollowings";
import EditMusics from "../Components/editMusicModal";

export default () => {

    const Stack = createStackNavigator();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}
            initialRouteName="Preload">
            <Stack.Screen name='Preload' component={Preload} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Main" component={BottomTab} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="PlayerMusic" component={PlayerModal} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="PlayerTeste" component={Player} />
            <Stack.Screen name="PlaylistSettings" component={PlaylistScreen} />
            <Stack.Screen name="EditPlaylist" component={editPlaylist} />
            <Stack.Screen name="TopTab" component={TopTab} />
            <Stack.Screen name="FollowersFollowingScreen" component={FollowersFollowingScreen} />
            <Stack.Screen name="EditMusic" component={EditMusics} options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }} />
        </Stack.Navigator>
    );
}