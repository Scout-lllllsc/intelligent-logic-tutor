import axios from "axios";
import type { AIResponse, AnalysisResult, CircuitData } from "../types/circuit";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000
});

export async function analyzeCircuit(circuit: CircuitData) {
  const response = await api.post<AnalysisResult>("/analyze", { circuit });
  return response.data;
}

export async function explainCircuit(circuit: CircuitData) {
  const response = await api.post<AIResponse>("/explain", { circuit });
  return response.data;
}

export async function practiceCircuit(circuit: CircuitData) {
  const response = await api.post<AIResponse>("/practice", { circuit });
  return response.data;
}

export async function chatWithTutor(message: string, circuit: CircuitData) {
  const response = await api.post<AIResponse>("/chat", { message, circuit });
  return response.data;
}
