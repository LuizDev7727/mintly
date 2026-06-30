import { env } from "@/env";
import axios from "axios";

const API_BASE_URL = env.VITE_API_BASE_URL + "/api";
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
