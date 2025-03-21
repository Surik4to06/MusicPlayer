import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  amountMessages: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: '#212121',
    color: '#FFF',
    borderRadius: 999,
    zIndex: 1,
    fontSize: 16,
    padding: 5,
  },
  containerCard: {
    backgroundColor: '#c7c7c7',
    padding: 10,
    justifyContent: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 999,
    marginRight: 20,
  },
  username: {
    color: '#212121',
    fontSize: 20,
    marginTop: 5,
  },
  lastMessage: {
    marginTop: 5,
  },
  lineContainer: {
    borderColor: '#212121',
    borderWidth: 2,
    borderRadius: 999, 
    marginTop: 10,
  },
});
