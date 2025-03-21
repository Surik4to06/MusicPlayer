import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Função para buscar mensagens de um chat
const getMessages = async (chatId) => {
    if (!chatId) {
        console.error("Erro: chatId inválido");
        return [];
    }

    try {
        const messagesRef = collection(db, `chats/${chatId}/messages`);
        const q = query(messagesRef, orderBy("timestamp", "asc"));
        const querySnapshot = await getDocs(q);

        let messages = [];
        querySnapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() });
        });

        return messages;
    } catch (error) {
        console.error("Erro ao buscar mensagens:", error);
        return [];
    }
};

export default getMessages;
