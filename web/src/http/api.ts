import axios from "axios";
import { env } from "@/env";

const API_BASE_URL = env.VITE_API_BASE_URL + "/api";
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
