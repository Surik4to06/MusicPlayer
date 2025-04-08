import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
  },
  header: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  title: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
  },
  tabBar: {
    backgroundColor: '#111',
  },
  tabBarLabel: {
    color: '#FFF',
    fontWeight: '600',
  },
  tabBarIndicator: {
    backgroundColor: '#FFF',
  },
  listContent: {
    padding: 10,
    backgroundColor: '#212121',
    flex: 1,
  },
  listItem: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    color: '#FFF',
  },
  line: {
    borderWidth: 1, 
    borderColor: 'gray',
    width: '99%',
    borderRadius: 9999,
    marginBottom: 15,
  },
});
