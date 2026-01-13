import { Handle, Position, type NodeProps } from "reactflow";
import "reactflow/dist/style.css";

export default function OrNode({ data }: NodeProps) {
  const out = data?.signals?.out ?? "X";

  return (
    <div style={{ width: 170, padding: 10, border: "1px solid #999", borderRadius: 10, background: "#fff" }}>
      <div style={{ fontWeight: 700 }}>OR</div>
      <div style={{ fontSize: 12, marginTop: 6 }}>
        out: <b>{String(out)}</b>
      </div>

      <Handle type="target" position={Position.Left} id="a" style={{ top: 42 }} />
      <Handle type="target" position={Position.Left} id="b" style={{ top: 72 }} />
      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
}
