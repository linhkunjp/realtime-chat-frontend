import { io } from "socket.io-client";

const socket = io("https://realtime-chat-backend-gz4h.onrender.com");
// const socket = '';

export default socket;