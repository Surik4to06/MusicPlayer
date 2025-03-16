import React from "react";
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default () => {

    const navigation = useNavigation();

    return(
        <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={35} color='#000' />
        </Pressable>
    );
}