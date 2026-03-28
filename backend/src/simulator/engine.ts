import type { AnalysisResult, CircuitData, Gate, GateType, TruthTableRow } from "../types/circuit";

function getIncomingSources(circuit: CircuitData, gateId: string) {
  return circuit.wires
    .filter((wire) => wire.target === gateId)
    .map((wire) => circuit.gates.find((gate) => gate.id === wire.source))
    .filter((gate): gate is Gate => Boolean(gate));
}

export function evaluateGate(type: GateType, inputs: boolean[]): boolean {
  switch (type) {
    case "AND":
      return inputs.every(Boolean);
    case "OR":
      return inputs.some(Boolean);
    case "NOT":
      return !inputs[0];
    case "NAND":
      return !inputs.every(Boolean);
    case "NOR":
      return !inputs.some(Boolean);
    case "XOR":
      return inputs.filter(Boolean).length % 2 === 1;
    default:
      return Boolean(inputs[0]);
  }
}

export function propagateSignals(
  circuit: CircuitData,
  inputAssignments: Record<string, boolean>
) {
  const signalMap: Record<string, boolean> = {};
  const unresolved = new Set(circuit.gates.map((gate) => gate.id));
  const maxPasses = circuit.gates.length * 4;

  for (const gate of circuit.gates) {
    if (gate.type === "INPUT") {
      signalMap[gate.id] = Boolean(inputAssignments[gate.id]);
      unresolved.delete(gate.id);
    }
  }

  for (let pass = 0; pass < maxPasses; pass += 1) {
    let progress = false;

    for (const gate of circuit.gates) {
      if (!unresolved.has(gate.id)) {
        continue;
      }

      const inputs = getIncomingSources(circuit, gate.id);
      const knownInputs = inputs.map((inputGate) => signalMap[inputGate.id]);

      if (gate.type === "OUTPUT") {
        if (inputs.length === 1 && knownInputs[0] !== undefined) {
          signalMap[gate.id] = knownInputs[0];
          unresolved.delete(gate.id);
          progress = true;
        }
        continue;
      }

      if (gate.type === "NOT") {
        if (inputs.length === 1 && knownInputs[0] !== undefined) {
          signalMap[gate.id] = evaluateGate(gate.type, [knownInputs[0]]);
          unresolved.delete(gate.id);
          progress = true;
        }
        continue;
      }

      const canResolve = inputs.length >= 2 && knownInputs.every((value) => value !== undefined);
      if (canResolve) {
        signalMap[gate.id] = evaluateGate(gate.type, knownInputs as boolean[]);
        unresolved.delete(gate.id);
        progress = true;
      }
    }

    if (!progress) {
      break;
    }
  }

  return {
    signalMap,
    unresolved: Array.from(unresolved)
  };
}

export function generateTruthTable(circuit: CircuitData): TruthTableRow[] {
  const inputs = circuit.gates.filter((gate) => gate.type === "INPUT");
  const outputs = circuit.gates.filter((gate) => gate.type === "OUTPUT");
  const rows: TruthTableRow[] = [];
  const combinations = 2 ** inputs.length;

  if (inputs.length === 0 || outputs.length === 0) {
    return rows;
  }

  for (let i = 0; i < combinations; i += 1) {
    const assignment: Record<string, boolean> = {};
    inputs.forEach((inputGate, index) => {
      assignment[inputGate.id] = Boolean((i >> (inputs.length - index - 1)) & 1);
    });

    const { signalMap } = propagateSignals(circuit, assignment);
    rows.push({
      inputs: Object.fromEntries(
        inputs.map((gate) => [gate.label || gate.id, Boolean(signalMap[gate.id])])
      ),
      outputs: Object.fromEntries(
        outputs.map((gate) => [gate.label || gate.id, Boolean(signalMap[gate.id])])
      )
    });
  }

  return rows;
}

export function analyzeCircuit(circuit: CircuitData): AnalysisResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const inputs = circuit.gates.filter((gate) => gate.type === "INPUT");
  const outputs = circuit.gates.filter((gate) => gate.type === "OUTPUT");

  if (circuit.gates.length === 0) {
    errors.push("The circuit is empty.");
  }

  if (inputs.length === 0) {
    errors.push("Add at least one INPUT node.");
  }

  if (outputs.length === 0) {
    errors.push("Add at least one OUTPUT node.");
  }

  for (const gate of circuit.gates) {
    const incoming = getIncomingSources(circuit, gate.id);
    if (gate.type === "NOT" && incoming.length !== 1) {
      errors.push(`${gate.label} must have exactly one incoming wire.`);
    }
    if (["AND", "OR", "NAND", "NOR", "XOR"].includes(gate.type) && incoming.length < 2) {
      warnings.push(`${gate.label} works best with at least two incoming wires.`);
    }
    if (gate.type === "OUTPUT" && incoming.length !== 1) {
      warnings.push(`${gate.label} should have exactly one incoming wire.`);
    }
  }

  const sampleAssignment = Object.fromEntries(
    inputs.map((gate) => [gate.id, Boolean(gate.value)])
  );
  const propagation = propagateSignals(circuit, sampleAssignment);
  if (propagation.unresolved.length > 0) {
    warnings.push(
      `Some nodes could not be fully resolved: ${propagation.unresolved.join(", ")}. Check for missing inputs or cycles.`
    );
  }

  const truthTable = errors.length === 0 ? generateTruthTable(circuit) : [];
  const summary =
    errors.length > 0
      ? "The circuit needs attention before it can be fully simulated."
      : `Valid circuit with ${inputs.length} input(s), ${outputs.length} output(s), and ${truthTable.length} truth table row(s).`;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary,
    truthTable
  };
}
