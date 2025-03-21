import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../Screens/Login";
import BottomTab from "./BottomTab";
import Register from "../Screens/Register";
import Preload from "../Screens/Preload";
import EditProfile from "../Screens/EditProfile";
import PlayerModal from "../Components/playerModal";
import ProfileScreen from "../Components/profileScreen";
import TopTab from "./TopTab";

export default () => {

    const Stack = createStackNavigator();

    return(
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
            <Stack.Screen name="TopTab" component={TopTab} />
        </Stack.Navigator>
    );
}