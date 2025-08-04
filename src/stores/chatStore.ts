import { defineStore } from "pinia";
import socket from "@/utils/socket";
import ChatService from '@/services/ChatService'

interface MessageData {
    senderId: string,
    receiverId: string,
    text: string
}

interface ListChatData {
    _id: string,
    userId: string,
    username: string,
    email: string,
    lastMessage: string,
    lastMessageTime: string,
}

export const useChatStore = defineStore(
    'chat',
    {
        state: () => ({
            messages: [] as MessageData[],
            userName: localStorage.getItem('username') || '',
            isShowLeftComp: false,
            userId: localStorage.getItem('user_id') || '',
            otherId: '',
            listChats: [] as ListChatData[],
            messagesCache: new Map<string, MessageData[]>()
        }),

        actions: {
            showMenu(value: boolean) {
                this.isShowLeftComp = value;
            },

            async getChatDetail(senderId: string, receivedId: string) {
                const response = await ChatService.getChatDetail(senderId, receivedId)
                if (response && response.isSuccess == true) {
                    this.messages = response.messages
                }
            },

            async getChatList() {
                const response = await ChatService.getChatList(this.userId)
                if (response && response.isSuccess == true) {
                    this.listChats = response.results
                    if (this.listChats.length > 0) {
                        this.otherId = this.listChats[0]._id

                        // Lấy chi tiết tin nhắn của user đầu tiên để hiển thị
                        await this.getChatDetail(this.otherId, this.userId)
                    }
                }
            },

            sendMessage(text: string, receiverId: string) {
                const msg = {
                    senderId: this.userId,
                    receiverId,
                    text,
                };
                socket.emit('sendMessage', msg);
                this.messages.push(msg);
            },

            listenMessages() {
                // Nhận tin nhắn realtime với userId khi đăng nhập
                socket.emit("join", this.userId);

                // Chỉ lắng nghe 1 lần
                socket.off("receiveMessage");

                // Lắng nghe sự kiện khi có tin nhắn mới được gửi đến
                socket.on("receiveMessage", (msg: MessageData) => {
                    // Kiêm tra cuộc hội thoại hiện tại
                    const isCurrentConversation =
                        (msg.senderId === this.otherId && msg.receiverId === this.userId) || // Tin nhắn từ người khác
                        (msg.senderId === this.userId && msg.receiverId === this.otherId) // Tin nhắn từ mình

                    if (isCurrentConversation) {
                        this.messages.push(msg)

                        // Cập nhật cache cho cuộc hội thoại với người khác
                        const cached = this.messagesCache.get(this.otherId) || []
                        cached.push(msg)
                        this.messagesCache.set(this.otherId, cached)
                    }
                });

                // Chỉ lắng nghe 1 lần
                socket.off("lastMessageUpdate");

                // Cập nhật lastMessage
                socket.on("lastMessageUpdate", (lastMsg: MessageData & { createdAt: string }) => {
                    // Tìm theo senderId hoặc receiverId
                    const index = this.listChats.findIndex(user =>
                        user.userId === lastMsg.senderId || user.userId === lastMsg.receiverId
                    );

                    if (index !== -1) {
                        this.listChats[index].lastMessage = lastMsg.text;
                        this.listChats[index].lastMessageTime = lastMsg.createdAt;

                        // Sắp xêp lại theo mới nhất
                        this.listChats.sort((a, b) => {
                            return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
                        });
                    }
                });
            },
        },
    }
)