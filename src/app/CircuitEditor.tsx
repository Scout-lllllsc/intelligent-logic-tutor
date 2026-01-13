import { useCallback, useMemo } from "react";
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

export default function CircuitEditor() {
  const initialNodes: Node[] = [
    { id: "sw1", type: "SWITCH", position: { x: 80, y: 120 }, data: { value: 1 } },
    { id: "or1", type: "OR", position: { x: 320, y: 90 }, data: {} },
    { id: "led1", type: "LED", position: { x: 560, y: 120 }, data: {} },
  ];

  const initialEdges: Edge[] = [
    { id: "e1", source: "sw1", sourceHandle: "out", target: "or1", targetHandle: "a" },
    { id: "e2", source: "sw1", sourceHandle: "out", target: "or1", targetHandle: "b" },
    { id: "e3", source: "or1", sourceHandle: "out", target: "led1", targetHandle: "in" },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const signals = useMemo(() => simulateCombo(nodes, edges), [nodes, edges]);

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

      if (n.type === "AND" || n.type === "OR") {
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
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlow
        nodes={decoratedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
