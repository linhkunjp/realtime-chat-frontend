export interface Reaction {
    userId: string
    type: string
}

export interface MessageData {
    _id?: string,
    tempId?: string,
    senderId: string,
    receiverId: string,
    text?: string,
    images?: string[];
    createdAt: string,
    reactions?: Reaction[],
    isPending?: boolean
}

export interface ListChatData {
    userId: string,
    username: string,
    email: string,
    image: string,
    lastMessage: string,
    lastMessageTime: string,
    lastMessageImgFile: string[],
    lastMessageReactions: string[],
    lastMessageType: string,
    lastSenderId: string,
    lastMessageId: string,
    lastSenderName: string,
    reactions?: Reaction[]
}