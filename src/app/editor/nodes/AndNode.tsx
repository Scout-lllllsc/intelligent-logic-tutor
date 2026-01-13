import { useEffect } from "react";
import { Handle, Position, type NodeProps, useUpdateNodeInternals } from "reactflow";
import "reactflow/dist/style.css";

export default function AndNode({ id, data }: NodeProps) {
  const out = data?.signals?.out ?? "X";

  const updateNodeInternals = useUpdateNodeInternals();

  // 强制 React Flow 重新计算 handle 锚点位置
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, out, updateNodeInternals]);

  return (
    <div style={{ width: 170, padding: 10, border: "1px solid #999", borderRadius: 10, background: "#fff" }}>
      <div style={{ fontWeight: 700 }}>AND</div>
      <div style={{ fontSize: 12, marginTop: 6 }}>
        out: <b>{String(out)}</b>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{ top: "35%", transform: "translateY(-50%)" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="b"
        style={{ top: "65%", transform: "translateY(-50%)" }}
      />
      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
}
