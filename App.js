import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import 'react-native-gesture-handler';

import BottomTab from "./src/Navigation/BottomTab";

import AuthProvider from "./src/Context/AuthContext";
import StackNavigator from "./src/Navigation/StackNavigator";
import MyMusics from "./src/Screens/MyMusics";

export default function App() {
  return(
    <NavigationContainer>
      <AuthProvider>
        <StackNavigator />
        {/* <MyMusics /> */}
      </AuthProvider>
    </NavigationContainer>
  );
}