import { defineStore } from "pinia";
import socket from "@/utils/socket";
import ChatService from '@/services/ChatService'
import type { Reaction, MessageData, ListChatData } from '@/types/message'

export const useChatStore = defineStore(
    'chat',
    {
        state: () => ({
            messages: [] as MessageData[],
            userName: localStorage.getItem('username') || '',
            image: '',
            isShowLeftComp: false,
            userId: localStorage.getItem('user_id') || '',
            otherId: '',
            listChats: [] as ListChatData[],
            messagesCache: new Map<string, MessageData[]>(),
            onlineUsers: [] as string[],
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

            // Danh sách user
            async getChatList() {
                const response = await ChatService.getChatList(this.userId)
                if (response && response.isSuccess == true) {
                    this.listChats = response.results.map((chat: ListChatData) => {
                        const isMine = chat.lastSenderId === this.userId;
                        return {
                            ...chat,
                            lastMessage: isMine ? `Bạn: ${chat.lastMessage}` : chat.lastMessage
                        };
                    });
                    if (this.listChats.length > 0) {
                        const first = this.listChats[0];

                        this.userName = first.username;
                        this.otherId = first.userId;
                        this.image = first.image;

                        // Kiểm tra cache, chọn user đầu tiên
                        if (this.messagesCache.has(first.userId)) {
                            this.messages = this.messagesCache.get(first.userId)!;
                        } else {
                            await this.getChatDetail(first.userId, this.userId);
                            this.messagesCache.set(first.userId, [...this.messages]);
                        }
                    }
                }
            },

            // Reaction
            handleReaction(message: MessageData, type: string) {
                const userId = this.userId
                const messageId = (message._id ?? message.tempId) as string

                if (!message.reactions) message.reactions = []

                const myReaction = message.reactions.find((r: Reaction) => r.userId === userId)

                if (myReaction && myReaction.type === type) {
                    // Gỡ reaction nếu cùng loại
                    socket.emit("removeReaction", { messageId, userId })

                    // Xóa khỏi local
                    message.reactions = message.reactions.filter((r: Reaction) => r.userId !== userId)
                } else {
                    // Thêm/ đổi reaction
                    socket.emit("addReaction", { messageId, userId, type })

                    if (myReaction) {
                        myReaction.type = type
                    } else {
                        message.reactions.push({ userId, type })
                    }
                }

                // Cập nhật cache
                const cached = this.messagesCache.get(this.otherId)
                if (cached) {
                    const idx = cached.findIndex(m => (m._id ?? m.tempId) === messageId);
                    if (idx !== -1) cached[idx].reactions = [...message.reactions]
                    // Cập nhật reactive
                    this.messagesCache.set(this.otherId, cached)
                }
            },

            sendMessage(
                text: string,
                receiverId: string,
                images: string[],
                options?: { emit?: boolean; pushLocal?: boolean; tempId?: string; isPending?: boolean }
            ) {
                const now = new Date().toISOString();
                const emit = options?.emit ?? true;
                const pushLocal = options?.pushLocal ?? true;
                const baseTemp = options?.tempId ?? Date.now().toString();

                // Tạo object message với hậu tố khác nhau (-text, -img)
                const createMsg = (suffix: string, txt: string, imgs: string[]) => ({
                    tempId: `${baseTemp}${suffix}`,
                    senderId: this.userId,
                    receiverId,
                    text: txt,
                    images: imgs,
                    createdAt: now,
                    isPending: !!options?.isPending,
                });

                // Thêm hậu tố -text nếu là text
                if (text?.trim()) {
                    const textMsg = createMsg("-text", text, []);
                    if (pushLocal) {
                        this.messages.push(textMsg);
                        const cached = this.messagesCache.get(receiverId) || [];
                        cached.push(textMsg);
                        this.messagesCache.set(receiverId, cached);
                    }
                    if (emit) socket.emit("sendMessage", textMsg);
                }

                // -img nếu có ảnh
                if (images && images.length > 0) {
                    const imgMsg = createMsg("-img", "", images);
                    if (pushLocal) {
                        this.messages.push(imgMsg);
                        const cached = this.messagesCache.get(receiverId) || [];
                        cached.push(imgMsg);
                        this.messagesCache.set(receiverId, cached);
                    }
                    if (emit) socket.emit("sendMessage", imgMsg);
                }
            },

            // Partial biến toàn bộ thuộc tính trong MessageData thành optional
            updateMessageByTempId(tempId: string, newMsg: Partial<MessageData>) {
                const idx = this.messages.findIndex(m => m.tempId === tempId);
                if (idx !== -1) {
                    this.messages[idx] = { ...this.messages[idx], ...newMsg };

                    // Update lại nếu server đã trả về _id thật
                    if (newMsg._id) {
                        this.messages[idx]._id = newMsg._id;
                        this.messages[idx].isPending = false;
                        // Xóa tempId để tránh duplicate
                        delete this.messages[idx].tempId;
                    }
                }

                const cached = this.messagesCache.get(this.otherId) || [];
                const cacheIdx = cached.findIndex(m => m.tempId === tempId);
                if (cacheIdx !== -1) {
                    cached[cacheIdx] = { ...cached[cacheIdx], ...newMsg };
                    if (newMsg._id) {
                        cached[cacheIdx].isPending = false;
                        delete cached[cacheIdx].tempId;
                    }
                    this.messagesCache.set(this.otherId, cached);
                }
            },

            listenMessages() {
                // Nhận tin nhắn realtime với userId khi đăng nhập
                socket.emit("join", this.userId);

                // Chỉ lắng nghe 1 lần tránh duplicate tin nhắn
                socket.off("receiveMessage");

                // Lắng nghe sự kiện khi có tin nhắn mới được gửi đến
                socket.on("receiveMessage", (msg: MessageData) => {
                    const isCurrentConversation =
                        (msg.senderId === this.otherId && msg.receiverId === this.userId) ||
                        (msg.senderId === this.userId && msg.receiverId === this.otherId);

                    if (isCurrentConversation) {
                        // Nếu có tempId trùng -> thay thế tin nhắn local bằng tin nhắn từ server
                        const tempIndex = this.messages.findIndex(m => m.tempId && m.tempId === msg.tempId);
                        if (tempIndex !== -1) {
                            this.messages[tempIndex] = msg; // Thay thế tin nhắn tạm bằng tin nhắn thật
                        } else {
                            this.messages.push(msg);
                        }

                        // Cập nhật cache
                        const cached = this.messagesCache.get(this.otherId) || [];
                        if (tempIndex !== -1) {
                            cached[tempIndex] = msg;
                        } else {
                            cached.push(msg);
                        }
                        this.messagesCache.set(this.otherId, cached);
                    }
                });

                // Đồng bộ lại reaction
                socket.off("reactionUpdate")
                socket.on("reactionUpdate", ({ messageId, reactions }) => {
                    const msg = this.messages.find(m => (m._id ?? m.tempId) === messageId)
                    if (msg) {
                        msg.reactions = reactions
                    }

                    // Cập nhật cache
                    const cached = this.messagesCache.get(this.otherId)
                    if (cached) {
                        const idx = cached.findIndex(m => (m._id ?? m.tempId) === messageId)
                        if (idx !== -1) cached[idx].reactions = reactions
                        this.messagesCache.set(this.otherId, cached)
                    }
                })

                // Chỉ lắng nghe 1 lần
                socket.off("lastMessageUpdate");

                // Cập nhật lastMessage
                socket.on("lastMessageUpdate", (lastMsg) => {
                    const index = this.listChats.findIndex(user =>
                        user.userId === lastMsg.senderId || user.userId === lastMsg.receiverId
                    );

                    if (index !== -1) {
                        const isMine = lastMsg.senderId === this.userId;
                        this.listChats[index].lastMessage = isMine
                            ? `Bạn: ${lastMsg.text}`
                            : lastMsg.text;

                        this.listChats[index].lastMessageTime = lastMsg.createdAt;
                        this.listChats[index].lastSenderId = lastMsg.senderId;

                        this.listChats.sort((a, b) =>
                            new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
                        );
                    }
                });

                // Danh sách user online
                socket.on("onlineUsers", (userIds: string[]) => {
                    this.onlineUsers = userIds;
                });
            },

            isUserOnline(userId: string) {
                return this.onlineUsers.includes(userId);
            }
        },
    }
)