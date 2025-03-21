import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebaseConfig";

const getUnreadMessagesByFriend = async (userId) => {
    if (!userId) return 0;

    try {
        const messagesRef = collection(db, "chats");
        const q = query(
            messagesRef, 
            where("to", "==", userId), 
            where("isRead", "==", false)
        );

        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return 0;
        }

        // Criar um Set para armazenar os IDs dos amigos que enviaram mensagens não lidas
        const uniqueSenders = new Set();

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            uniqueSenders.add(data.from);
        });

        return uniqueSenders.size;
    } catch (error) {
        console.error("❌ Erro ao buscar mensagens não lidas:", error);
        return 0;
    }
};

export default getUnreadMessagesByFriend;
