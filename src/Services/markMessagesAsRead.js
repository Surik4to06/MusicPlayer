import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebaseConfig";

const markMessagesAsRead = async (chatId, friendId, currentUserId) => {
    try {
        if (!chatId || !friendId || !currentUserId) {
            console.error("Erro: Parâmetros inválidos em markMessagesAsRead");
            return;
        }

        const messagesRef = collection(db, `chats/${chatId}/messages`);
        const q = query(
            messagesRef,
            where("to", "==", currentUserId),
            where("senderId", "==", friendId),
            where("isRead", "==", false)
        );

        const querySnapshot = await getDocs(q);

        const batchUpdates = querySnapshot.docs.map((docSnap) =>
            updateDoc(doc(db, `chats/${chatId}/messages`, docSnap.id), {
                isRead: true,
            })
        );

        await Promise.all(batchUpdates);
    } catch (error) {
        console.error("Erro ao marcar mensagens como lidas:", error);
    }
};

export default markMessagesAsRead;
