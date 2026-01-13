import { useEffect } from "react";
import { Handle, Position, type NodeProps, useUpdateNodeInternals } from "reactflow";
import "reactflow/dist/style.css";

export default function NandNode({ id, data }: NodeProps) {
  const out = data?.signals?.out ?? "X";
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, out, updateNodeInternals]);

  return (
    <div style={{ width: 170, padding: 10, border: "1px solid #999", borderRadius: 10, background: "#fff" }}>
      <div style={{ fontWeight: 700 }}>NAND</div>
      <div style={{ fontSize: 12, marginTop: 6 }}>
        out: <b>{String(out)}</b>
      </div>

      <Handle type="target" position={Position.Left} id="a" style={{ top: "35%", transform: "translateY(-50%)" }} />
      <Handle type="target" position={Position.Left} id="b" style={{ top: "65%", transform: "translateY(-50%)" }} />
      <Handle type="source" position={Position.Right} id="out" style={{ top: "50%", transform: "translateY(-50%)" }} />
    </div>
  );
}
