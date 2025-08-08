import { io } from "socket.io-client";

const socket = io("http://localhost:5000");
// const socket = '';

export default socket;