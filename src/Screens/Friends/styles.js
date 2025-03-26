import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50% -50%)',
  },
  amountMessages: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: '#FFF',
    color: '#000',
    borderRadius: 999,
    zIndex: 1,
    fontSize: 16,
    padding: 5,
  },
  containerCard: {
    padding: 10,
    justifyContent: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 999,
    marginRight: 20,
  },
  username: {
    color: '#FFF',
    fontSize: 20,
    marginTop: 5,
  },
  lastMessage: {
    marginTop: 5,
    color: '#ccc',
  },
  lineContainer: {
    borderColor: '#ccc',
    borderWidth: 2,
    borderRadius: 999,
    marginTop: 10,
  },
  searchInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  }
});
