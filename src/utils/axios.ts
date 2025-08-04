import axios from "axios";
import type { AxiosInstance } from "axios";
import { CONSTANTS } from "./constants";

const chatV1: AxiosInstance = axios.create({
  baseURL: CONSTANTS.CHAT_API_V1,
  headers: {
    "Content-Type": "application/json",
  },
});

export { chatV1 };
