import { analyzeCircuit, generateTruthTable, propagateSignals } from "../simulator/engine";
import type { CircuitData, TruthTableRow } from "../types/circuit";

function getFallbackHeader(reason?: string) {
  const detail = reason ? ` (${reason})` : "";
  return `Built-in tutor mode${detail}: OpenRouter is unavailable, so this response is generated locally from your circuit structure and simulation data.`;
}

function getInventory(circuit: CircuitData) {
  const counts = new Map<string, number>();

  for (const gate of circuit.gates) {
    counts.set(gate.type, (counts.get(gate.type) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([type, count]) => `${type} x${count}`)
    .join(", ");
}

function getCurrentState(circuit: CircuitData) {
  const inputAssignments = Object.fromEntries(
    circuit.gates
      .filter((gate) => gate.type === "INPUT")
      .map((gate) => [gate.id, Boolean(gate.value)])
  );

  const { signalMap } = propagateSignals(circuit, inputAssignments);
  const inputState = circuit.gates
    .filter((gate) => gate.type === "INPUT")
    .map((gate) => `${gate.label}=${inputAssignments[gate.id] ? 1 : 0}`)
    .join(", ");
  const outputState = circuit.gates
    .filter((gate) => gate.type === "OUTPUT")
    .map((gate) => `${gate.label}=${signalMap[gate.id] ? 1 : 0}`)
    .join(", ");

  return {
    inputState: inputState || "No input nodes",
    outputState: outputState || "No output nodes"
  };
}

function formatTruthTableRows(rows: TruthTableRow[]) {
  if (rows.length === 0) {
    return "No truth table is available yet because the circuit still has validation issues.";
  }

  return rows
    .map((row, index) => {
      const inputs = Object.entries(row.inputs)
        .map(([label, value]) => `${label}=${value ? 1 : 0}`)
        .join(", ");
      const outputs = Object.entries(row.outputs)
        .map(([label, value]) => `${label}=${value ? 1 : 0}`)
        .join(", ");
      return `Row ${index + 1}: ${inputs} -> ${outputs}`;
    })
    .join("\n");
}

function detectKnownFunction(rows: TruthTableRow[]) {
  if (rows.length !== 4) {
    return undefined;
  }

  const firstRow = rows[0];
  const inputKeys = Object.keys(firstRow.inputs);
  const outputKeys = Object.keys(firstRow.outputs);

  if (inputKeys.length !== 2 || outputKeys.length !== 1) {
    return undefined;
  }

  const outputKey = outputKeys[0];
  const pattern = rows.map((row) => (row.outputs[outputKey] ? "1" : "0")).join("");

  const knownPatterns: Record<string, string> = {
    "0001": "AND",
    "0111": "OR",
    "0110": "XOR",
    "1110": "NAND",
    "1000": "NOR"
  };

  return knownPatterns[pattern];
}

export function getLocalExplainReply(circuit: CircuitData, reason?: string) {
  const analysis = analyzeCircuit(circuit);
  const truthTable = analysis.truthTable.length > 0 ? analysis.truthTable : generateTruthTable(circuit);
  const { inputState, outputState } = getCurrentState(circuit);
  const functionGuess = detectKnownFunction(truthTable);
  const errors = analysis.errors.length > 0 ? analysis.errors.join("; ") : "none";
  const warnings = analysis.warnings.length > 0 ? analysis.warnings.join("; ") : "none";

  const lines = [
    getFallbackHeader(reason),
    analysis.summary,
    `Gate inventory: ${getInventory(circuit) || "no gates yet"}.`,
    functionGuess
      ? `Observed behavior: the truth table currently matches a ${functionGuess} function.`
      : "Observed behavior: the circuit can be understood by following signals from INPUT nodes through the connected gates to the OUTPUT nodes.",
    `Current state: ${inputState}. Current outputs: ${outputState}.`,
    `Validation: errors=${errors}. warnings=${warnings}.`,
    "How to reason about it:",
    "1. INPUT nodes provide the starting binary signals.",
    "2. Each gate transforms the incoming signals according to its logic rule.",
    "3. OUTPUT nodes simply report the final propagated result.",
    `Truth table:\n${formatTruthTableRows(truthTable)}`
  ];

  return lines.join("\n\n");
}

export function getLocalPracticeReply(circuit: CircuitData, reason?: string) {
  const analysis = analyzeCircuit(circuit);
  const truthTable = analysis.truthTable.length > 0 ? analysis.truthTable : generateTruthTable(circuit);
  const functionGuess = detectKnownFunction(truthTable);
  const firstInputGate = circuit.gates.find((gate) => gate.type === "INPUT");

  const promptLines = [
    getFallbackHeader(reason),
    "Practice challenge:",
    analysis.isValid
      ? "1. Predict the output for each input combination before checking the truth table."
      : "1. Repair the circuit so that every gate has the required number of inputs and the OUTPUT node is reachable.",
    functionGuess
      ? `2. Explain why the circuit behaves like a ${functionGuess} gate.`
      : "2. Trace one signal path from an INPUT node to the OUTPUT and explain what each gate does.",
    firstInputGate
      ? `3. Toggle ${firstInputGate.label} and describe which downstream nodes should change.`
      : "3. Add at least one INPUT node and test how the output changes.",
    analysis.isValid
      ? `Hint: compare these rows carefully.\n${formatTruthTableRows(truthTable)}`
      : `Hint: current validation issues are: ${analysis.errors.concat(analysis.warnings).join("; ") || "none"}.`
  ];

  return promptLines.join("\n\n");
}

export function getLocalChatReply(message: string, circuit: CircuitData, reason?: string) {
  const normalized = message.toLowerCase();
  const analysis = analyzeCircuit(circuit);
  const truthTable = analysis.truthTable.length > 0 ? analysis.truthTable : generateTruthTable(circuit);
  const { inputState, outputState } = getCurrentState(circuit);

  if (normalized.includes("truth") || normalized.includes("table") || normalized.includes("真值")) {
    return [
      getFallbackHeader(reason),
      "Here is the current truth table for your circuit:",
      formatTruthTableRows(truthTable)
    ].join("\n\n");
  }

  if (
    normalized.includes("error") ||
    normalized.includes("debug") ||
    normalized.includes("fix") ||
    normalized.includes("wrong") ||
    normalized.includes("问题")
  ) {
    return [
      getFallbackHeader(reason),
      `Current validation summary: ${analysis.summary}`,
      `Errors: ${analysis.errors.join("; ") || "none"}`,
      `Warnings: ${analysis.warnings.join("; ") || "none"}`,
      "Suggested next step: make sure every NOT gate has one input, every multi-input logic gate has at least two incoming wires, and every OUTPUT node receives exactly one signal."
    ].join("\n\n");
  }

  if (normalized.includes("practice") || normalized.includes("练习")) {
    return getLocalPracticeReply(circuit, reason);
  }

  if (
    normalized.includes("explain") ||
    normalized.includes("how") ||
    normalized.includes("why") ||
    normalized.includes("gate") ||
    normalized.includes("解释")
  ) {
    return getLocalExplainReply(circuit, reason);
  }

  return [
    getFallbackHeader(reason),
    `Question received: ${message}`,
    `Current circuit summary: ${analysis.summary}`,
    `Current input state: ${inputState}. Current outputs: ${outputState}.`,
    `Useful next step: compare your expected output with the truth table and then inspect any gates mentioned in the warnings list.`,
    `Truth table snapshot:\n${formatTruthTableRows(truthTable)}`
  ].join("\n\n");
}
