import axiosInstance from "./axiosInstance";

export const sendChatMessage = async (message) => {
  const response = await axiosInstance.post("/api/Chat", {
    message: message,
  });

  return response.data.response;
};
