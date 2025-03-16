import React from "react";
import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window")
const numColumns = 3
const imageSize = width / numColumns - 3

export const styles = StyleSheet.create({
    container: {
        flex: 1, 
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    videos: {
        width: imageSize,
        height: imageSize,
        margin: 1,
        borderColor: '#000',
        borderWidth: 3,
    },
});