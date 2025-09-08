
import { chatV1 } from "@/utils/axios";


class ChatService {

    // Chi tiết cuộc hội thoại
    static async getChatDetail(senderId: string, receivedId: string) {

        try {
            const url = `chat/detail/${senderId}/${receivedId}`;
            const response = await chatV1.get(url)
            if (response.data && response.data.isSuccess == true) {
                return response.data;
            } else {
                return response.data
            }
        } catch (error: any) {
            if (error.response?.data) {
                return error.response?.data
            } else {
                return { isSuccess: false, message: error.message };
            }
        }
    }

    // Danh sách cuộc hội thoại
    static async getChatList(userId: string) {

        try {
            const url = `chat/list/${userId}`;
            const response = await chatV1.get(url)
            if (response.data && response.data.isSuccess == true) {
                return response.data;
            } else {
                return response.data
            }
        } catch (error: any) {
            if (error.response?.data) {
                return error.response?.data
            } else {
                return { isSuccess: false, message: error.message };
            }
        }
    }

    // Upload ảnh lên server
    static async uploadImages(files: File[]): Promise<string[]> {
        const formData = new FormData();
        files.forEach(f => formData.append("images", f));

        const res = await chatV1.post("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return res.data.urls;
    }
}

export default ChatService;
