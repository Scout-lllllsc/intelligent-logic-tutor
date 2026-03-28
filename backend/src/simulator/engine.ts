import type {
  AnalysisResult,
  CircuitData,
  Gate,
  GateOutputMode,
  GateType,
  TruthTableRow,
  Wire
} from "../types/circuit";

const inputHandleOrder: Partial<Record<GateType, string[]>> = {
  OUTPUT: ["in-1"],
  NOT: ["in-1"],
  BUFFER: ["in-1"],
  AND: ["in-1", "in-2"],
  OR: ["in-1", "in-2"],
  NAND: ["in-1", "in-2"],
  NOR: ["in-1", "in-2"],
  XOR: ["in-1", "in-2"],
  XNOR: ["in-1", "in-2"],
  HALFADDER: ["in-1", "in-2"],
  MUX: ["in-1", "in-2", "in-3"],
  FULLADDER: ["in-1", "in-2", "in-3"]
};

function getIncomingWires(circuit: CircuitData, gate: Gate) {
  const wires = circuit.wires.filter((wire) => wire.target === gate.id);
  const order = inputHandleOrder[gate.type];

  if (!order) {
    return wires;
  }

  return wires.slice().sort((left, right) => {
    const leftIndex = order.indexOf(left.targetHandle || "");
    const rightIndex = order.indexOf(right.targetHandle || "");

    const normalizedLeft = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
    const normalizedRight = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;

    return normalizedLeft - normalizedRight;
  });
}

function getIncomingSources(circuit: CircuitData, gate: Gate) {
  return getIncomingWires(circuit, gate)
    .map((wire) => circuit.gates.find((candidate) => candidate.id === wire.source))
    .filter((source): source is Gate => Boolean(source));
}

function getExpectedInputCount(gate: Gate) {
  switch (gate.type) {
    case "NOT":
    case "BUFFER":
    case "OUTPUT":
      return 1;
    case "MUX":
    case "FULLADDER":
      return 3;
    case "HALFADDER":
      return 2;
    default:
      return 2;
  }
}

function evaluateAdder(
  type: "HALFADDER" | "FULLADDER",
  inputs: boolean[],
  outputMode: GateOutputMode
) {
  if (type === "HALFADDER") {
    const [a, b] = inputs;
    return outputMode === "CARRY" ? a && b : a !== b;
  }

  const [a, b, cin] = inputs;
  if (outputMode === "CARRY") {
    return (a && b) || (a && cin) || (b && cin);
  }

  return (Number(a) + Number(b) + Number(cin)) % 2 === 1;
}

export function evaluateGate(
  type: GateType,
  inputs: boolean[],
  outputMode: GateOutputMode = "DEFAULT"
): boolean {
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
    case "XNOR":
      return inputs.filter(Boolean).length % 2 === 0;
    case "BUFFER":
      return Boolean(inputs[0]);
    case "MUX":
      return inputs[2] ? inputs[1] : inputs[0];
    case "HALFADDER":
      return evaluateAdder("HALFADDER", inputs, outputMode);
    case "FULLADDER":
      return evaluateAdder("FULLADDER", inputs, outputMode);
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

      const inputGates = getIncomingSources(circuit, gate);
      const knownInputs = inputGates.map((inputGate) => signalMap[inputGate.id]);
      const expectedInputCount = getExpectedInputCount(gate);

      if (gate.type === "OUTPUT") {
        if (inputGates.length === 1 && knownInputs[0] !== undefined) {
          signalMap[gate.id] = knownInputs[0];
          unresolved.delete(gate.id);
          progress = true;
        }
        continue;
      }

      if (gate.type === "NOT" || gate.type === "BUFFER") {
        if (inputGates.length === 1 && knownInputs[0] !== undefined) {
          signalMap[gate.id] = evaluateGate(gate.type, [knownInputs[0]], gate.outputMode);
          unresolved.delete(gate.id);
          progress = true;
        }
        continue;
      }

      const canResolve =
        inputGates.length === expectedInputCount &&
        knownInputs.every((value) => value !== undefined);

      if (canResolve) {
        signalMap[gate.id] = evaluateGate(gate.type, knownInputs as boolean[], gate.outputMode);
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
    const incoming = getIncomingSources(circuit, gate);
    const incomingWires = getIncomingWires(circuit, gate);
    const expectedInputCount = getExpectedInputCount(gate);

    if ((gate.type === "NOT" || gate.type === "BUFFER") && incoming.length !== 1) {
      errors.push(`${gate.label} must have exactly one incoming wire.`);
    }
    if (
      ["AND", "OR", "NAND", "NOR", "XOR", "XNOR"].includes(gate.type) &&
      incoming.length < 2
    ) {
      warnings.push(`${gate.label} works best with at least two incoming wires.`);
    }
    if (gate.type === "OUTPUT" && incoming.length !== 1) {
      warnings.push(`${gate.label} should have exactly one incoming wire.`);
    }
    if (gate.type === "MUX" && incoming.length !== 3) {
      errors.push(`${gate.label} must have D0, D1, and S inputs connected.`);
    }
    if (gate.type === "HALFADDER" && incoming.length !== 2) {
      errors.push(`${gate.label} must have two inputs: A and B.`);
    }
    if (gate.type === "FULLADDER" && incoming.length !== 3) {
      errors.push(`${gate.label} must have three inputs: A, B, and Cin.`);
    }

    const expectedHandles = inputHandleOrder[gate.type];
    if (expectedHandles && incomingWires.length > 0) {
      const seenHandles = new Set(incomingWires.map((wire) => wire.targetHandle || ""));
      const missingHandles = expectedHandles.filter((handle) => !seenHandles.has(handle));
      if (missingHandles.length > 0 && gate.type !== "OUTPUT") {
        warnings.push(`${gate.label} is missing connection(s) on ${missingHandles.join(", ")}.`);
      }
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
