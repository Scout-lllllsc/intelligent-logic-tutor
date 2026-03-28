import { useCircuitStore } from "../store/circuitStore";
import type { GateType } from "../types/circuit";

const gateOptions: Array<{ type: GateType; description: string }> = [
  { type: "INPUT", description: "Toggle binary input sources." },
  { type: "OUTPUT", description: "Observe final logic output." },
  { type: "AND", description: "True only when all inputs are true." },
  { type: "OR", description: "True when any input is true." },
  { type: "NOT", description: "Inverts a single input." },
  { type: "NAND", description: "Inverse of AND." },
  { type: "NOR", description: "Inverse of OR." },
  { type: "XOR", description: "True when inputs differ." },
  { type: "XNOR", description: "True when inputs are equal." },
  { type: "BUFFER", description: "Passes one signal through unchanged." },
  { type: "MUX", description: "Selects D0 or D1 using the S input." },
  { type: "HALFADDER", description: "Add A and B, then toggle SUM or CARRY output." },
  { type: "FULLADDER", description: "Add A, B, Cin, then toggle SUM or CARRY output." }
];

export function Toolbox() {
  const addGate = useCircuitStore((state) => state.addGate);
  const clearAll = useCircuitStore((state) => state.clearAll);

  return (
    <div className="section-shell">
      <h2 className="section-title">Toolbox</h2>
      <p className="section-subtitle">
        Add logic gates and IO nodes, then drag them into position on the canvas.
      </p>

      <div className="tool-grid">
        {gateOptions.map((gate) => (
          <button
            key={gate.type}
            className="tool-button"
            onClick={() => addGate(gate.type)}
          >
            <strong>{gate.type}</strong>
            <span>{gate.description}</span>
          </button>
        ))}
      </div>

      <div className="divider" />

      <button className="secondary-button" onClick={clearAll}>
        Clear canvas
      </button>
    </div>
  );
}
