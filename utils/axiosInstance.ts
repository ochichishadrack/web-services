// utils/axiosInstance.ts
import axios from "axios";
import { getApiBaseUrl } from "@/api/api";

export const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});
