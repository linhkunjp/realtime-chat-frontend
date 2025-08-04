import { defineStore } from "pinia";
import AuthService from '@/services/AuthService'
import type { AuthData } from '@/types/auth'
import { useChatStore } from '@/stores/chatStore'

interface DataUsers {
    _id: string,
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
            isLoading: false,
            dataUsers: [] as DataUsers[]
        }),

        actions: {
            async handleLogin(data: AuthData) {
                const submitData = {
                    email: data.email,
                    password: data.password,
                    guestId: data.guestId || ''
                };

                this.isLoading = true
                const response = await AuthService.login(submitData)
                if (response.isSuccess == true) {
                    localStorage.setItem('token', response.token)
                    localStorage.setItem('user_id', response.user_id)
                    localStorage.setItem('email', response.email)
                    localStorage.setItem('username', response.username)
                }
                this.isLoading = false
                return response
            },

            async handleRegister(data: AuthData) {
                const submitData = {
                    email: data.email,
                    password: data.password,
                    username: data.username,
                    guestId: data.guestId || ''
                };

                this.isLoading = true
                const response = await AuthService.register(submitData)
                if (response.isSuccess == true) {
                    localStorage.setItem('token', response.token)
                    localStorage.setItem('user_id', response.user_id)
                }
                this.isLoading = false
                return response
            },
        },
    }
);

