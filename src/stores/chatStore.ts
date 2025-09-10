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
                        let lastMsg = "";
                        if (chat.lastMessageType === "image") {
                            lastMsg = isMine
                                ? `Bạn đã gửi ${chat.lastMessageImgFile.length} ảnh`
                                : `${chat.username} đã gửi ${chat.lastMessageImgFile.length} ảnh`;
                        } else if (chat.lastMessageType === "reaction") {
                            lastMsg = isMine
                                ? ` ${chat.username} vừa bày tỏ cảm xúc`
                                : "Bạn vừa bày tỏ cảm xúc"
                        } else if (chat.lastMessageType === "text") {
                            lastMsg = isMine
                                ? `Bạn: ${chat.lastMessage}`
                                : chat.lastMessage;
                        }
                        return {
                            ...chat,
                            lastMessage: lastMsg
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
                socket.emit("join", { userId: this.userId, username: this.userName });

                // Chỉ lắng nghe 1 lần tránh duplicate tin nhắn
                socket.off("receiveMessage");

                // Lắng nghe sự kiện khi có tin nhắn mới được gửi đến
                socket.on("receiveMessage", (msg: MessageData) => {

                    // Nếu tin nhắn đến từ otherId trong conversation đang mở
                    if (msg.senderId === this.otherId && msg.receiverId === this.userId) {
                        msg.isReaded = true;
                        socket.emit("markAsRead", { myId: this.userId, otherId: this.otherId });

                        const chatIdx = this.listChats.findIndex(c => c.userId === this.otherId);
                        if (chatIdx !== -1) this.listChats[chatIdx].isReaded = true;
                    } else {
                        msg.isReaded = false;
                    }

                    // Nếu đang mở đúng conversation
                    const isCurrentConversation =
                        (msg.senderId === this.otherId && msg.receiverId === this.userId) ||
                        (msg.senderId === this.userId && msg.receiverId === this.otherId);

                    if (isCurrentConversation) {
                        // Check cả _id và tempId để tránh duplicate
                        const idx = this.messages.findIndex(
                            m => (m._id && m._id === msg._id) || (m.tempId && m.tempId === msg.tempId)
                        );

                        if (idx !== -1) {
                            this.messages[idx] = msg;
                        } else {
                            this.messages.push(msg);
                        }
                    }


                    // Update cache
                    const otherId =
                        msg.senderId === this.userId ? msg.receiverId : msg.senderId;

                    const cached = this.messagesCache.get(otherId) || [];
                    const cIdx = cached.findIndex(
                        m => (m._id && m._id === msg._id) || (m.tempId && m.tempId === msg.tempId)
                    );
                    if (cIdx !== -1) {
                        cached[cIdx] = msg;
                    } else {
                        cached.push(msg);
                    }

                    this.messagesCache.set(otherId, cached);
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

                    // Đồng bộ listChats nếu đây là lastMessage
                    const chatIdx = this.listChats.findIndex(
                        c => c.userId === this.otherId
                    )
                    if (chatIdx !== -1) {
                        const chat = this.listChats[chatIdx]

                        // Kiểm tra messageId có phải lastMessage không
                        if ((msg?._id ?? msg?.tempId) === chat.lastMessageId) {
                            chat.lastMessageReactions = reactions
                            chat.lastMessageType = reactions.length > 0 ? "reaction" : "text"
                        }
                    }
                })

                socket.off("messagesRead");

                socket.on("messagesRead", ({ readerId, conversationWith }) => {
                    // Nếu người đọc là mình
                    if (readerId === this.userId) {
                        this.messages = this.messages.map(m => {
                            if (m.senderId === conversationWith && m.receiverId === this.userId) {
                                return { ...m, isReaded: true };
                            }
                            return m;
                        });

                        if (this.messagesCache.has(conversationWith)) {
                            const cached = this.messagesCache.get(conversationWith)!.map(m => {
                                if (m.senderId === conversationWith && m.receiverId === this.userId) {
                                    return { ...m, isReaded: true };
                                }
                                return m;
                            });
                            this.messagesCache.set(conversationWith, cached);
                        }
                    }

                    // Nếu người đọc là người kia
                    if (readerId !== this.userId) {
                        this.messages = this.messages.map(m => {
                            if (m.senderId === this.userId && m.receiverId === readerId) {
                                return { ...m, isReaded: true };
                            }
                            return m;
                        });

                        if (this.messagesCache.has(readerId)) {
                            const cached = this.messagesCache.get(readerId)!.map(m => {
                                if (m.senderId === this.userId && m.receiverId === readerId) {
                                    return { ...m, isReaded: true };
                                }
                                return m;
                            });
                            this.messagesCache.set(readerId, cached);
                        }
                    }
                });

                // Chỉ lắng nghe 1 lần
                socket.off("lastMessageUpdate");

                // Cập nhật lastMessage
                socket.on("lastMessageUpdate", (lastMsg) => {
                    const index = this.listChats.findIndex(user =>
                        user.userId === lastMsg.senderId || user.userId === lastMsg.receiverId
                    );

                    if (index !== -1) {
                        const isMine = lastMsg.senderId === this.userId;
                        let text = ""
                        if (lastMsg.type === "image") {
                            text = isMine ? `Bạn đã gửi ${lastMsg.images.length} ảnh` : `${lastMsg.senderName} đã gửi ${lastMsg.images.length} ảnh`
                        } else if (lastMsg.type === "reaction") {
                            text = isMine ? "Bạn vừa bày tỏ cảm xúc" : ` ${lastMsg.senderName} vừa bày tỏ cảm xúc`
                        } else if (lastMsg.type === "text") {
                            text = isMine ? `Bạn: ${lastMsg.text}` : lastMsg.text
                        }
                        this.listChats[index].lastMessage = text

                        this.listChats[index].lastMessageTime = lastMsg.createdAt;
                        this.listChats[index].lastSenderId = lastMsg.senderId;
                        this.listChats[index].lastMessageType = lastMsg.type;
                        this.listChats[index].isReaded = lastMsg.isReaded ?? false;

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
            },

            // Emit khi mở conversation
            markAsRead(myId: string, otherId: string) {
                // Update local messages + listChats
                this.messages.forEach(m => {
                    if (m.senderId === otherId && m.receiverId === myId) m.isReaded = true;
                });
                if (this.messagesCache.has(otherId)) {
                    this.messagesCache.get(otherId)!.forEach(m => {
                        if (m.senderId === otherId && m.receiverId === myId) m.isReaded = true;
                    });
                }
                const chatIdx = this.listChats.findIndex(c => c.userId === otherId);
                if (chatIdx !== -1) this.listChats[chatIdx].isReaded = true;

                socket.emit("markAsRead", { myId, otherId });
            }
        },
    }
)