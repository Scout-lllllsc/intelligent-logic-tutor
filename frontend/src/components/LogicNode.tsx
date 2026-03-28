import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";
import { useCircuitStore } from "../store/circuitStore";
import type { NodeData } from "../types/circuit";

export function LogicNode({ id, data }: NodeProps<NodeData>) {
  const toggleInput = useCircuitStore((state) => state.toggleInput);
  const className =
    data.gateType === "INPUT"
      ? "logic-node input-node"
      : data.gateType === "OUTPUT"
        ? "logic-node output-node"
        : "logic-node gate-node";

  return (
    <div className={className}>
      <Handle type="target" position={Position.Left} />
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
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
