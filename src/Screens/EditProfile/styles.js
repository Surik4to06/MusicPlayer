import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    btnBack: {
        position: 'absolute', 
        top: 20,
        left: 20,
        width: 50,
        height: 50,
        backgroundColor: '#212121',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 999,
    },
    editWallpaper: {
        position: 'absolute', 
        top: 20,
        right: 20,
    },
    borderPhoto: {
        borderWidth: 10,
        borderColor: '#212121',
        borderRadius: 999,
    },
    txt: {
        color: '#FFF',
        textAlign: 'left',
        fontSize: 18,
        marginBottom: 5,
    },
    btnSave: {
        padding: 10,
        backgroundColor: 'skyblue',
        width: '90%',
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        borderRadius: 9999,
    },
    btnSaveText: {
        fontSize: 25,
        color: '#FFFFFF',
    },
});
