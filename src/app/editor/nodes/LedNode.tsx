import { Handle, Position, type NodeProps } from "reactflow";
import "reactflow/dist/style.css";

export default function LedNode({ data }: NodeProps) {
  const vin = data?.signals?.in ?? "X";
  const on = vin === 1;

  return (
    <div style={{ width: 170, padding: 10, border: "1px solid #999", borderRadius: 10, background: "#fff" }}>
      <div style={{ fontWeight: 700 }}>LED</div>

      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 999,
            border: "1px solid #666",
            background: on ? "#00cc00" : "#222",
          }}
        />
        <div style={{ fontSize: 12 }}>
          in: <b>{String(vin)}</b>
        </div>
      </div>

      <Handle type="target" position={Position.Left} id="in" />
    </div>
  );
}
