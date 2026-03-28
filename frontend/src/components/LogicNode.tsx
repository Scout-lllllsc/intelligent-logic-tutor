import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";
import { useCircuitStore } from "../store/circuitStore";
import type { GateOutputMode, GateType, NodeData } from "../types/circuit";

const inputHandleMap: Record<GateType, Array<{ id: string; label: string; top: string }>> = {
  INPUT: [],
  OUTPUT: [{ id: "in-1", label: "IN", top: "50%" }],
  AND: [
    { id: "in-1", label: "A", top: "32%" },
    { id: "in-2", label: "B", top: "68%" }
  ],
  OR: [
    { id: "in-1", label: "A", top: "32%" },
    { id: "in-2", label: "B", top: "68%" }
  ],
  NOT: [{ id: "in-1", label: "IN", top: "50%" }],
  NAND: [
    { id: "in-1", label: "A", top: "32%" },
    { id: "in-2", label: "B", top: "68%" }
  ],
  NOR: [
    { id: "in-1", label: "A", top: "32%" },
    { id: "in-2", label: "B", top: "68%" }
  ],
  XOR: [
    { id: "in-1", label: "A", top: "32%" },
    { id: "in-2", label: "B", top: "68%" }
  ],
  XNOR: [
    { id: "in-1", label: "A", top: "32%" },
    { id: "in-2", label: "B", top: "68%" }
  ],
  BUFFER: [{ id: "in-1", label: "IN", top: "50%" }],
  MUX: [
    { id: "in-1", label: "D0", top: "24%" },
    { id: "in-2", label: "D1", top: "50%" },
    { id: "in-3", label: "S", top: "76%" }
  ],
  HALFADDER: [
    { id: "in-1", label: "A", top: "32%" },
    { id: "in-2", label: "B", top: "68%" }
  ],
  FULLADDER: [
    { id: "in-1", label: "A", top: "24%" },
    { id: "in-2", label: "B", top: "50%" },
    { id: "in-3", label: "Cin", top: "76%" }
  ]
};

export function LogicNode({ id, data, selected }: NodeProps<NodeData>) {
  const toggleInput = useCircuitStore((state) => state.toggleInput);
  const setGateOutputMode = useCircuitStore((state) => state.setGateOutputMode);
  const className =
    data.gateType === "INPUT"
      ? "logic-node input-node"
      : data.gateType === "OUTPUT"
        ? "logic-node output-node"
        : "logic-node gate-node";

  const handles = inputHandleMap[data.gateType];
  const showOutputMode = data.gateType === "HALFADDER" || data.gateType === "FULLADDER";

  const renderModeButton = (mode: GateOutputMode, label: string) => (
    <button
      key={mode}
      className={`mode-chip ${data.outputMode === mode ? "active" : ""}`}
      onClick={() => setGateOutputMode(id, mode)}
      type="button"
    >
      {label}
    </button>
  );

  return (
    <div className={`${className}${selected ? " selected" : ""}`}>
      {handles.map((handle) => (
        <div key={handle.id} className="port-shell" style={{ top: handle.top }}>
          <span className="port-label left">{handle.label}</span>
          <Handle id={handle.id} type="target" position={Position.Left} style={{ top: "50%" }} />
        </div>
      ))}
      <div className="node-label">{data.label}</div>
      <div className="node-value">Type: {data.gateType}</div>
      {data.gateType === "INPUT" ? (
        <button className="input-toggle" onClick={() => toggleInput(id)}>
          Signal: {data.value ? "1" : "0"}
        </button>
      ) : (
        <div className="node-value">
          Signal: {data.value === undefined ? "-" : data.value ? "1" : "0"}
        </div>
      )}
      {showOutputMode ? (
        <div className="mode-switch">
          {renderModeButton("SUM", "SUM")}
          {renderModeButton("CARRY", data.gateType === "FULLADDER" ? "COUT" : "CARRY")}
        </div>
      ) : null}
      {showOutputMode ? (
        <div className="node-value">Output: {data.outputMode}</div>
      ) : null}
      <div className="port-shell source-port" style={{ top: "50%" }}>
        <span className="port-label right">OUT</span>
        <Handle id="out-1" type="source" position={Position.Right} style={{ top: "50%" }} />
      </div>
    </div>
  );
}
