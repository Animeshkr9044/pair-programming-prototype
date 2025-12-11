import axios from 'axios';

// Ensure this matches your running backend URL
const API_URL = 'http://127.0.0.1:8000';

export const api = {
  createRoom: async () => {
    const response = await axios.post(`${API_URL}/rooms`);
    return response.data; // Expecting { room_id: "..." }
  },

  saveRoomCode: async (roomId: string, code: string) => {
    await axios.put(`${API_URL}/rooms/${roomId}/code`, { code });
  },

  getAutocomplete: async (code: string, cursorPosition: number) => {
    const response = await axios.post(`${API_URL}/autocomplete`, {
      code,
      cursorPosition,
      language: "python"
    });
    return response.data; // Expecting { suggestion: "..." }
  }
};