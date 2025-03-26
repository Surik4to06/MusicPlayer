import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: -40,
    },
    thumbnail: {
        backgroundColor: "gray",
        height: 250,
        width: 250,
        borderRadius: 15,
        marginBottom: 30,
    },
    iconEdit: {
        position: 'absolute',
        top: '47%',
        left: '53%',
        transform: 'translate(-50% -50%)',
        zIndex: 999,
    },
    input: {
        backgroundColor: '#353535',
        width: '80%',
        marginTop: 5,
        borderRadius: 10,
        color: '#FFF',
        paddingLeft: 10,
        fontSize: 18, 
    },
    containerBtn: {
        width: '80%',
        marginTop: 20,
    },
    containerBtnUpload: {
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#353535',
        padding: 20,
        borderRadius: 9999,
        marginTop: 20,
    },
    uploadBtn: {
        color: '#FFF',
        fontSize: 18,
    },
});