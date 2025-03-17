import React from "react";
import { StyleSheet, TextInput } from "react-native";

const Input = ({ value, onChangeText, placeholder, placeholderTextColor = '#000' }) => {
    return (
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            style={styles.input}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        borderRadius: 99999,
        paddingLeft: 20,
        fontSize: 18,
        width: 350, 
        height: 50,
        backgroundColor: '#FFFFFF',
        color: 'gray',
    },
});

export default Input;
