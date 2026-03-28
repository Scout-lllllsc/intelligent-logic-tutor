import { Router } from "express";
import { analyzeCircuit } from "../simulator/engine";
import { getChatReply, getExplainReply, getPracticeReply } from "../services/openrouterService";
import type { CircuitData } from "../types/circuit";

const router = Router();

function extractCircuit(body: any): CircuitData {
  return body?.circuit || { gates: [], wires: [] };
}

router.post("/analyze", (req, res) => {
  const circuit = extractCircuit(req.body);
  const result = analyzeCircuit(circuit);
  res.json(result);
});

router.post("/explain", async (req, res) => {
  try {
    const circuit = extractCircuit(req.body);
    const reply = await getExplainReply(circuit);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({
      reply: error instanceof Error ? error.message : "Failed to explain circuit."
    });
  }
});

router.post("/practice", async (req, res) => {
  try {
    const circuit = extractCircuit(req.body);
    const reply = await getPracticeReply(circuit);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({
      reply: error instanceof Error ? error.message : "Failed to generate practice task."
    });
  }
});

router.post("/chat", async (req, res) => {
  try {
    const circuit = extractCircuit(req.body);
    const message = String(req.body?.message || "");
    const reply = await getChatReply(message, circuit);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({
      reply: error instanceof Error ? error.message : "Failed to process chat request."
    });
  }
});

export default router;
