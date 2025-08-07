
import { chatV1 } from "@/utils/axios";

interface AuthData {
    email: string;
    username: string;
    image: string;
    userId: string
}

class AuthService {

    // Lưu thông tin người dùng vào mongodb
    static async saveUserToMongo(data: AuthData, token: string) {
        const headers = {
            Authorization: `Bearer ${token}`,
        };
        const body = {
            email: data.email,
            username: data.username,
            image: data.image,
            userId: data.userId,
        }
        try {
            const url = "auth/users";
            const response = await chatV1.post(url, body, { headers })
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
}

export default AuthService;
