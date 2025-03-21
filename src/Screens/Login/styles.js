import { StyleSheet } from "react-native"

 export const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: '#0A0509',
        justifyContent: 'center',
        alignItems: 'center',    
    },
    logo: {
        width: 140, height: 140,
        backgroundColor: '#FFF', 
        borderRadius: 999
    },
    input: {
        borderRadius: 99999,
        paddingLeft: 20,
        fontSize: 18,
        width: 350, 
        height: 50,
        backgroundColor: '#FFFFFF',
        color: 'skyblue',
    },
    senha: {
        borderRadius: 99999,
        paddingLeft: 20,
        fontSize: 18,
        width: 350, 
        height: 50,
        backgroundColor: '#FFFFFF',
        color: 'skyblue',
    },
    btnLogin: {
        marginTop: 30,
        backgroundColor: 'skyblue',
        width: 350,
        height: 50,
        borderRadius: 99999,
        justifyContent: 'center', 
        alignItems: 'center',
    },
    btnLoginText: {
        color: '#FFFFFF',
        fontSize: 28,
        textTransform: 'uppercase',
        fontFamily: 'god-of-war',
    },
    btnConta: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    txtCriarConta: {
        color: '#FFFFFF',
    },
    cadastre: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
})