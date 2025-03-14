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
});
