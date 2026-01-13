import { useCallback, useMemo, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  type Connection,
  type Edge,
  type Node,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { nodeTypes } from "./editor/nodeTypes";
import { simulateCombo } from "./sim/simulate";

type GateType = "SWITCH" | "AND" | "OR" | "NOT" | "XOR" | "NAND" | "NOR" | "LED";

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2, 8)}`;
}

export default function CircuitEditor() {
  // 初始电路：SWITCH -> OR -> LED（你也可以随时删掉自己搭）
  const initialNodes: Node[] = [
    { id: "sw1", type: "SWITCH", position: { x: 120, y: 120 }, data: { value: 1 } },
    { id: "or1", type: "OR", position: { x: 380, y: 90 }, data: {} },
    { id: "led1", type: "LED", position: { x: 640, y: 120 }, data: {} },
  ];

  const initialEdges: Edge[] = [
    { id: "e1", source: "sw1", sourceHandle: "out", target: "or1", targetHandle: "a" },
    { id: "e2", source: "sw1", sourceHandle: "out", target: "or1", targetHandle: "b" },
    { id: "e3", source: "or1", sourceHandle: "out", target: "led1", targetHandle: "in" },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 记录选中项（用于按钮删除）
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);

  // 新增器件的摆放位置（避免叠在一起）
  const spawnRef = useRef({ x: 120, y: 260 });

  const addGate = useCallback(
    (type: GateType) => {
      const id = makeId(type.toLowerCase());
      const pos = { ...spawnRef.current };

      // 下次新增往右下挪一点
      spawnRef.current = { x: pos.x + 40, y: pos.y + 40 };

      const data = type === "SWITCH" ? { value: 0 } : {};

      setNodes((cur) => [
        ...cur,
        {
          id,
          type,
          position: pos,
          data,
        },
      ]);
    },
    [setNodes]
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const deleteSelected = useCallback(() => {
    if (selectedNodeIds.length === 0 && selectedEdgeIds.length === 0) return;

    // 先删边，再删点（删点也会自动删相关边，但显式处理更稳）
    setEdges((cur) => cur.filter((e) => !selectedEdgeIds.includes(e.id)));
    setNodes((cur) => cur.filter((n) => !selectedNodeIds.includes(n.id)));

    setSelectedNodeIds([]);
    setSelectedEdgeIds([]);
  }, [selectedNodeIds, selectedEdgeIds, setNodes, setEdges]);

  // 仿真：nodes/edges 变化就重算（组合逻辑稳态）
  const signals = useMemo(() => simulateCombo(nodes, edges), [nodes, edges]);

  // 把仿真结果写进节点 data，供器件 UI 显示
  const decoratedNodes = useMemo(() => {
    return nodes.map((n) => {
      if (n.type === "SWITCH") {
        return {
          ...n,
          data: {
            ...n.data,
            onToggle: () => {
              setNodes((cur) =>
                cur.map((x) =>
                  x.id === n.id
                    ? { ...x, data: { ...x.data, value: x.data.value ? 0 : 1 } }
                    : x
                )
              );
            },
          },
        };
      }

      if (
        n.type === "AND" ||
        n.type === "OR" ||
        n.type === "NOT" ||
        n.type === "XOR" ||
        n.type === "NAND" ||
        n.type === "NOR"
      ) {
        return {
          ...n,
          data: {
            ...n.data,
            signals: { out: signals.get(`${n.id}.out`) ?? "X" },
          },
        };
      }

      if (n.type === "LED") {
        return {
          ...n,
          data: {
            ...n.data,
            signals: { in: signals.get(`${n.id}.in`) ?? "X" },
          },
        };
      }

      return n;
    });
  }, [nodes, signals, setNodes]);

  return (
    <div style={{ height: "100%", width: "100%", display: "flex" }}>
      {/* 左侧器件库 */}
      <div
        style={{
          width: 260,
          borderRight: "1px solid #ddd",
          padding: 12,
          background: "#fafafa",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 10 }}>器件库</div>

        <div style={{ display: "grid", gap: 8 }}>
          <button onClick={() => addGate("SWITCH")}>+ SWITCH</button>
          <button onClick={() => addGate("AND")}>+ AND</button>
          <button onClick={() => addGate("OR")}>+ OR</button>
          <button onClick={() => addGate("NOT")}>+ NOT</button>
          <button onClick={() => addGate("XOR")}>+ XOR</button>
          <button onClick={() => addGate("NAND")}>+ NAND</button>
          <button onClick={() => addGate("NOR")}>+ NOR</button>
          <button onClick={() => addGate("LED")}>+ LED</button>
        </div>

        <div style={{ marginTop: 14, fontWeight: 800, marginBottom: 8 }}>编辑</div>

        <button
          onClick={deleteSelected}
          disabled={selectedNodeIds.length === 0 && selectedEdgeIds.length === 0}
          style={{ width: "100%" }}
        >
          删除选中（Delete）
        </button>

        <div style={{ marginTop: 10, fontSize: 12, color: "#555", lineHeight: 1.5 }}>
          用法：
          <br />
          1) 点按钮添加器件
          <br />
          2) 点击选中节点/连线
          <br />
          3) 按 <b>Delete</b>/<b>Backspace</b> 删除
          <br />
          或点“删除选中”按钮
        </div>
      </div>

      {/* 右侧画布 */}
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={decoratedNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          onSelectionChange={(sel) => {
            setSelectedNodeIds(sel.nodes.map((n) => n.id));
            setSelectedEdgeIds(sel.edges.map((e) => e.id));
          }}
          deleteKeyCode={["Backspace", "Delete"]}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
