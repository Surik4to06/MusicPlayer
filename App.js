import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import 'react-native-gesture-handler';

import AuthProvider from "./src/Context/AuthContext";
import StackNavigator from "./src/Navigation/StackNavigator";

export default function App() {
  return(
    <NavigationContainer>
      <AuthProvider>
        <StackNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}