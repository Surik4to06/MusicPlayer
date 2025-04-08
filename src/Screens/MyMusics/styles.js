import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window")
const numColumns = 3
const imageSize = width / numColumns - 3

export const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videos: {
        width: imageSize,
        height: imageSize,
        margin: 1,
        borderColor: '#000',
        borderWidth: 3,
    },
    emptyText: {
        color: '#FFF',
    },
    playBtnMusic: { 
        backgroundColor: '#212121', 
        borderRadius: 999, 
        position: 'absolute',
        zIndex: 999,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: 5,
    },
    musicsItem: {
        flexDirection: 'row',
        backgroundColor: '#3c3c3c', 
        padding: 3,
        paddingHorizontal: 5,
        borderRadius: 15,
        marginTop: 5,
    },
    musicData: {
        marginTop: 3,
        marginLeft: 20,
        width: '74%',
    },
    title: {
        color: '#FFF',
        fontSize: 18,
    },
    author: {
        color: '#b5b5b5',
    },
    duration: {
        color: '#b5b5b5',
        fontSize: 18,
        marginTop: 5,
    },
});