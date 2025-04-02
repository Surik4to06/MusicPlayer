import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import 'react-native-gesture-handler';
import { StatusBar } from "react-native";

import AuthProvider from "./src/Context/AuthContext";
import StackNavigator from "./src/Navigation/StackNavigator";

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor={"#000"} barStyle={"light-content"} />
      <AuthProvider>
          <StackNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}