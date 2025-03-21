import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1D22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#606467',
    zIndex: 9999,
  },
  headerFriendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendPhoto: {
    width: 45,
    height: 45,
    borderRadius: 9999,
    marginLeft: 15,
    marginRight: 10,
  },
  friendUsername: {
    fontSize: 18,
    color: '#FFF',
  },
  headerIcon: {
    backgroundColor: "#313B44",
    padding: 5,
    borderRadius: 999,
  },
  btnBack: {
    width: 45, 
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatList: {
    flex: 1,
    backgroundColor: '#FFF',
    marginBottom: 60,
    width: '100%',
  },
  mensages: {

  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    position: 'absolute',
    bottom: 5,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 10,
    paddingRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: "#313B44",
    borderRadius: 999,
    paddingLeft: 15,
    paddingRight: 15,
    flex: 1,
    marginRight: 10,
    fontSize: 16,
    color: '#FFF',
  },
  btnSendMensage: {
    backgroundColor: '#313B44',
    padding: 10,
    borderRadius: 999,
  },
});
