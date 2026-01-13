import { Handle, Position, type NodeProps } from "reactflow";
import "reactflow/dist/style.css";

export default function SwitchNode({ data }: NodeProps) {
  const value = !!data?.value;

  return (
    <div style={{ width: 150, padding: 10, border: "1px solid #999", borderRadius: 10, background: "#fff" }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>SWITCH</div>
      <button onClick={data?.onToggle} style={{ width: "100%" }}>
        {value ? "ON (1)" : "OFF (0)"}
      </button>

      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
}
