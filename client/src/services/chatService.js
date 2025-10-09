import api from '../utils/api';

export const sendMessageToAI = async (message, userId = "guest") => {
  try {
    const response = await api.post("/chatbot", { message, userId });
    return response.data.response; 
  } catch (err) {
    console.error("[ChatService] Error sending message:", err);
    return "AI server is not responding.";
  }
};
