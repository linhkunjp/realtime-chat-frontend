import { defineStore } from "pinia";
import AuthService from '@/services/AuthService'
import type { AuthData } from '@/types/auth'

interface DataUsers {
    userId: string,
    email: string,
    username: string
}

export const useAuthStore = defineStore(
    "auth",
    {
        state: () => ({
            component: 'login',
            title: 'Đăng nhập',
            userId: localStorage.getItem('user_id') || '',
            token: localStorage.getItem('token'),
            email: localStorage.getItem('email') || '',
            username: localStorage.getItem('username') || '',
            image: localStorage.getItem('image') || '',
            dataUsers: [] as DataUsers[],
            isLoading: false,
            isVerify: false,
        }),

        actions: {
            async handleAuth(data: AuthData, token: string) {
                const submitData = {
                    email: data.email,
                    username: data.username,
                    image: data.image,
                    userId: data.userId,
                };

                this.isLoading = true
                this.isVerify = true
                const response = await AuthService.saveUserToMongo(submitData, token)
                if (response && response.isSuccess == true) {
                    const results = response.results
                    localStorage.setItem('user_id', results.userId)
                    localStorage.setItem('email', results.email)
                    localStorage.setItem('username', results.username)
                    localStorage.setItem('image', results.image)
                    localStorage.setItem('token', token)
                }
                this.isLoading = false
                this.isVerify = false
                return response
            },
        },
    }
);

