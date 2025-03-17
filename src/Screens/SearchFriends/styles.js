import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    containerCard: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'gray',
        marginBottom: 10,
    },
    photoUser: {
        width: 80,
        height: 80,
        borderRadius: 999,
    },
    username: {
        fontSize: 25, 
        color: '#FFF', 
        marginLeft: 15
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modal: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#212121',
        width: '85%',
        height: 500,
        alignItems: 'center',
        borderRadius: 20,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      },

      photoProfile:{
        marginTop: -50,
        height: 130,
        width: 130,
        justifyContent: 'center', 
        alignItems: 'center',
        borderWidth: 10, 
        borderColor: '#212121', 
        borderRadius: 999,
      },
});
