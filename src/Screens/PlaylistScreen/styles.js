import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000', // ou gradiente, se quiser
      paddingHorizontal: 20,
      paddingTop: 60,
    },
    backBtn: {
        backgroundColor: '#212121',
        position: 'absolute',
        top: 20,
        left: 20,
    },
    playlistImage: {
      width: 200,
      height: 200,
      borderRadius: 20,
      alignSelf: 'center',
      marginBottom: 20,
    },
    playlistTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
    },
    songCount: {
      textAlign: 'center',
      color: '#aaa',
      marginBottom: 20,
      marginTop: 20,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      marginBottom: 20,
    },
    button: {
      backgroundColor: '#1a1a1a',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 30,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    songItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      gap: 10,
    },
    songThumbnail: {
      width: 50,
      height: 50,
      borderRadius: 8,
      backgroundColor: '#AAA'
    },
    songTitle: {
      color: '#fff',
      fontWeight: 'bold',
    },
    songAuthor: {
      color: '#aaa',
      fontSize: 12,
    },
});