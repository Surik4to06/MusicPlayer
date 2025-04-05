import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
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
        backgroundColor: 'transparent',
        width: '80%',
        borderRadius: 10,
        color: '#FFF',
        paddingLeft: 10,
        fontSize: 22, 
        height: 57,
        padding: 5,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 15,
    },
    authorName: {
        color: 'gray',
        fontSize: 18,
        textAlign: 'left',
        width: '75%',
        marginTop: 7,
    },
    containerBtn: {
        width: '80%',
    },
    containerBtnUpload: {
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#353535',
        padding: 20,
        borderRadius: 9999,
    },
    uploadBtn: {
        color: '#FFF',
        fontSize: 18,
    },
});