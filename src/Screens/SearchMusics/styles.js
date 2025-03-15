import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  cardMusic: {
    marginBottom: 10,
    height: 90,
    padding: 3,
    backgroundColor: '#212121',
    borderRadius: 45,
  },
  containerCard: {
    flexDirection: "column", 
    justifyContent: "center", 
    alignItems: "center",
  },
  thumbnail: {
    width: 60,
    height: 60, 
    borderRadius: 9999,
  },
  title: {
    color: '#FFF',
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  author: {
    color: "#FFF",
  },
  btnPlayMusic: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#515151',
    borderRadius: 999,
    width: 37,
    height: 37,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatList: {
    width: '100%',
  },
  containerModal: {
    padding: 10,
    flex: 1,
    backgroundColor: '#212121',
  },
  containerIconModal: {
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  containerIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 999,
    backgroundColor: '#414141',
  },
  backIcon: {
    marginLeft: -3,
  },
  containerGeral: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageMusic: {
    width: 300, 
    height: 300,
    borderRadius: 15,
    zIndex: 1,
  },
  imageMusicBluer: {
    position: 'absolute', 
    zIndex: 0,
  },
  titlePopup: {
    color: '#FFF',
    fontSize: 25,
    marginTop: 10,
  },
  containerBtns: {
    width: '50%',
    alignItems: 'flex-end',
    paddingRight: 10,
    gap: 15,
    marginRight: -35,
  },
});
