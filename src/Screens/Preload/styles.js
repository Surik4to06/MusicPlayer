import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: 300, // ou qualquer valor proporcional
        height: 300,
        position: 'absolute',
        top: '65%',
        left: '65%',
        transform: 'translate(-50%, -70%)',
    },
});