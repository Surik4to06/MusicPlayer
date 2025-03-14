import { StyleSheet } from 'react-native';
import { Platform, StatusBar } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1, 
    // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  containerInput: {
    marginTop: 10,
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 25,
    paddingRight: 20,
},
inputText: {
    width: '90%',
    borderTopLeftRadius: 9999,
    borderBottomLeftRadius: 9999,
    paddingLeft: 15,
    fontSize: 17,
    borderWidth: 1,
    borderColor: 'gray',
    borderRightWidth: 0,
},
containerIcon: {
    justifyContent: 'center',
    alignItems: 'center',
},
icon: {
    borderWidth: 1,
    borderColor: 'gray',
    borderLefttWidth: 0,
    backgroundColor: '#335EA8',
    borderTopRightRadius: 9999,
    borderBottomRightRadius: 9999,
    padding: 8,
    paddingRight: 15,
  },
});
