import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import BottomTab from "./src/Navigation/BottomTab";

import AuthProvider from "./src/Context/AuthContext";

export default function App() {
  return(
    <NavigationContainer>
      <AuthProvider>
        <BottomTab />
      </AuthProvider>
    </NavigationContainer>
  );
}