import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', 
    paddingHorizontal: 20,
    paddingTop: 60,
    zIndex: 1,
  },
  header: {
    top: -60,
    width: '112%',
    height: 60,
    marginLeft: -20,
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#313131',
    zIndex: 10,
  },
  backBtn: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#212121',
    borderRadius: 999,
  },
  friendName: {
    color: "#FFF",
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  playlistImage: {
    width: 200,
    height: 200,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  playlistTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  songCount: {
    textAlign: 'center',
    color: '#aaa',
    marginBottom: 20,
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
    width: '100%',
  },
  songThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#AAA'
  },
  songTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  songAuthor: {
    color: '#aaa',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    flex: 1,
    width: '100%',
    backgroundColor: "#000",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: '#FFF',
  },
  modalButton: {
    backgroundColor: "#7CACF8",
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
});