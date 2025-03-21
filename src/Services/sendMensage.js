import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Função para enviar mensagens
const sendMessage = async (chatId, senderId, receiverId, text, mediaUrl = "", type = "text") => {
    if (!chatId || !senderId || !receiverId || (!text && !mediaUrl)) {
        console.error("Erro: Dados inválidos para enviar a mensagem");
        return;
    }

    try {
        await addDoc(collection(db, `chats/${chatId}/messages`), {
            senderId,
            to: receiverId, // Para quem a mensagem está sendo enviada
            text: text || "", // Garante que text não seja undefined
            mediaUrl,
            type,
            isRead: false, // Inicialmente, mensagem não lida
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
    }
};

export default sendMessage;
