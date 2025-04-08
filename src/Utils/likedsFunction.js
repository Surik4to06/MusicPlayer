import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import { Auth, db } from "../Services/firebaseConfig";

// Verifica se o usuário já curtiu a música
export const checkIfSongLiked = async (songId, userId) => {
  const userDoc = await getDoc(doc(db, "users", userId));
  const likedSongs = userDoc.data()?.likedSongs || [];

  return likedSongs.some((s) => s.id === songId);
};

// Alterna curtida
export const toggleLikedSong = async (song, setLiked) => {
    const userId = Auth.currentUser.uid;
    const userRef = doc(db, "users", userId);
    const songRef = doc(db, "musics", song.id);
  
    const songExists = await checkIfSongLiked(song.id, userId);
  
    try {
      if (songExists) {
        await updateDoc(userRef, {
          likedSongs: arrayRemove({ ...song, uid: userId })
        });
        await updateDoc(songRef, {
          likedBy: arrayRemove(userId)
        });
        setLiked(false);
      } else {
        await updateDoc(userRef, {
          likedSongs: arrayUnion({ ...song, uid: userId })
        });
        await updateDoc(songRef, {
          likedBy: arrayUnion(userId)
        });
        setLiked(true);
      }
    } catch (error) {
      console.error("Erro ao atualizar like da música:", error);
    }
  };
  