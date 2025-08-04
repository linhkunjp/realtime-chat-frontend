
import { chatV1 } from "@/utils/axios";

interface AuthData {
    email: string;
    password: string;
    username?: string;
    guestId?: string | null;
}

class AuthService {

    // Đăng nhập
    static async login(data: AuthData) {
        const body = {
            email: data.email,
            password: data.password,
            guestId: data.guestId || ''
        }
        try {
            const url = "auth/login";
            const response = await chatV1.post(url, body)
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

    // Đăng ký
    static async register(data: AuthData) {
        const body = {
            email: data.email,
            password: data.password,
            username: data.username,
            guestId: data.guestId || ''
        }
        try {
            const url = "auth/register";
            const response = await chatV1.post(url, body)
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
