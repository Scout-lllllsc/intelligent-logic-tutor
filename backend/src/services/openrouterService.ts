import axios from "axios";
import { analyzeCircuit } from "../simulator/engine";
import type { CircuitData } from "../types/circuit";

const OPENROUTER_URL =
  process.env.OPENROUTER_URL || "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const APP_SITE_URL = process.env.APP_SITE_URL || "http://localhost:5173";
const APP_TITLE = process.env.APP_TITLE || "Intelligent Logic Tutor";

function buildCircuitSummary(circuit: CircuitData) {
  const analysis = analyzeCircuit(circuit);
  return JSON.stringify(
    {
      gates: circuit.gates,
      wires: circuit.wires,
      analysis
    },
    null,
    2
  );
}

async function callOpenRouter(prompt: string, circuit: CircuitData) {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === "YOUR_KEY") {
    return [
      "OpenRouter is not configured yet.",
      "Set OPENROUTER_API_KEY in backend/.env to enable AI tutoring.",
      "",
      "Circuit context:",
      buildCircuitSummary(circuit)
    ].join("\n");
  }

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a digital logic tutor. Explain circuits clearly, diagnose wiring issues, and coach students with practical reasoning."
          },
          {
            role: "user",
            content: `${prompt}\n\nCurrent circuit:\n${buildCircuitSummary(circuit)}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": APP_SITE_URL,
          "X-Title": APP_TITLE
        },
        timeout: 45000
      }
    );

    return (
      response.data?.choices?.[0]?.message?.content ||
      "The tutor did not return a response."
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;

      console.error("OpenRouter request failed", {
        status,
        data,
        url: OPENROUTER_URL,
        model: OPENROUTER_MODEL,
        appSiteUrl: APP_SITE_URL
      });

      throw new Error(
        `OpenRouter request failed${status ? ` with status ${status}` : ""}.`
      );
    }

    console.error("Unexpected OpenRouter error", error);
    throw error;
  }
}

export async function getExplainReply(circuit: CircuitData) {
  return callOpenRouter(
    "Explain how this digital logic circuit behaves, what each gate contributes, and how a student should reason about the signal flow.",
    circuit
  );
}

export async function getPracticeReply(circuit: CircuitData) {
  return callOpenRouter(
    "Generate a practice exercise related to this circuit, including one challenge question and a short hint but not the full answer.",
    circuit
  );
}

export async function getChatReply(message: string, circuit: CircuitData) {
  return callOpenRouter(message, circuit);
}
