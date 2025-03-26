import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#9c9c9c",
  },
  btnSettings: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 50,
    height: 50,
    backgroundColor: '#212121',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
  },
  containerSecond: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerTerd: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    zIndex: 10,
    backgroundColor: 'trrensparent',
    marginTop: 20,
  },
  wallpaper: {
    backgroundColor: '#96969696',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  username: {
    fontSize: 23,
    marginTop: 10,
    color: "#FFF",
  },
  numDados: {
    fontSize: 18,
    textAlign: 'center',
    color: '#FFF',
  },
  textDados: {
    fontSize: 18,
    color: '#FFF',
  },
  btnProfile: {
    backgroundColor: '#353535',
    padding: 10,
    borderRadius: 15,
    marginTop: 10,
  },
  btnProfileText: {
    fontSize: 18,
    color: '#FFF',
  },
  containerTopTab: {
    flex: 1,
  },
  profileContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
    zIndex: 2,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    position: 'absolute',
    top: 20,
    right: 10,
    zIndex: 999999,
    backgroundColor: '#ccc',
    borderRadius: 15,
    padding: 15,
  }
});
