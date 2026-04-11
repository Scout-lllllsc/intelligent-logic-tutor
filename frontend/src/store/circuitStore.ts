import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange
} from "reactflow";
import { create } from "zustand";
import type {
  AnalysisResult,
  CircuitData,
  FlowEdge,
  FlowNode,
  GateOutputMode,
  GateType,
  Wire
} from "../types/circuit";

interface CircuitState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  inputs: Record<string, boolean>;
  analysis: AnalysisResult | null;
  addGate: (type: GateType) => void;
  renameNode: (id: string, label: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  deleteSelection: () => void;
  clearAll: () => void;
  toggleInput: (id: string) => void;
  setGateOutputMode: (id: string, outputMode: GateOutputMode) => void;
  setAnalysis: (result: AnalysisResult | null) => void;
  getCircuitData: () => CircuitData;
}

const initialNodes: FlowNode[] = [
  {
    id: "input-a",
    type: "logicNode",
    position: { x: 80, y: 160 },
    data: { label: "Input A", gateType: "INPUT", value: false }
  },
  {
    id: "input-b",
    type: "logicNode",
    position: { x: 80, y: 320 },
    data: { label: "Input B", gateType: "INPUT", value: false }
  },
  {
    id: "and-1",
    type: "logicNode",
    position: { x: 340, y: 240 },
    data: { label: "AND 1", gateType: "AND" }
  },
  {
    id: "output-1",
    type: "logicNode",
    position: { x: 620, y: 240 },
    data: { label: "Output 1", gateType: "OUTPUT" }
  }
];

const initialEdges: FlowEdge[] = [
  { id: "edge-a-and", source: "input-a", target: "and-1", targetHandle: "in-1" },
  { id: "edge-b-and", source: "input-b", target: "and-1", targetHandle: "in-2" },
  { id: "edge-and-out", source: "and-1", target: "output-1", targetHandle: "in-1" }
];

function normalizeNodeLabel(label: string, fallback: string) {
  const trimmed = label.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function createNode(type: GateType, index: number): FlowNode {
  const outputMode: GateOutputMode =
    type === "HALFADDER" || type === "FULLADDER" ? "SUM" : "DEFAULT";
  const defaultLabel = `${type} ${index + 1}`;

  return {
    id: `${type.toLowerCase()}-${Date.now()}-${index}`,
    type: "logicNode",
    position: { x: 160 + ((index % 3) * 190), y: 100 + ((index % 4) * 110) },
    data: {
      label: defaultLabel,
      gateType: type,
      value: type === "INPUT" ? false : undefined,
      outputMode
    }
  };
}

export const useCircuitStore = create<CircuitState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  inputs: {
    "input-a": false,
    "input-b": false
  },
  analysis: null,
  addGate: (type) =>
    set((state) => ({
      nodes: [...state.nodes, createNode(type, state.nodes.length + 1)]
    })),
  renameNode: (id, label) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                label: normalizeNodeLabel(label, node.data.label)
              }
            }
          : node
      )
    })),
  onNodesChange: (changes) =>
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes)
    })),
  onEdgesChange: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges)
    })),
  onConnect: (connection) =>
    set((state) => {
      const targetHandle = connection.targetHandle || null;
      const target = connection.target;

      const nextEdges = state.edges.filter((edge) => {
        if (!target || edge.target !== target) {
          return true;
        }

        return (edge.targetHandle || null) !== targetHandle;
      });

      return {
        edges: addEdge(
          {
            ...connection,
            id: `edge-${Date.now()}`
          },
          nextEdges
        )
      };
    }),
  deleteSelection: () =>
    set((state) => {
      const deletedNodeIds = state.nodes
        .filter((node) => node.selected)
        .map((node) => node.id);

      return {
        nodes: state.nodes.filter((node) => !node.selected),
        edges: state.edges.filter(
          (edge) =>
            !edge.selected &&
            !deletedNodeIds.includes(edge.source) &&
            !deletedNodeIds.includes(edge.target)
        )
      };
    }),
  clearAll: () =>
    set({
      nodes: [],
      edges: [],
      inputs: {},
      analysis: null
    }),
  toggleInput: (id) =>
    set((state) => {
      const nextValue = !state.inputs[id];
      return {
        inputs: {
          ...state.inputs,
          [id]: nextValue
        },
        nodes: state.nodes.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  value: nextValue
                }
              }
            : node
        )
      };
    }),
  setGateOutputMode: (id, outputMode) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                outputMode
              }
            }
          : node
      )
    })),
  setAnalysis: (result) => set({ analysis: result }),
  getCircuitData: () => {
    const state = get();
    return {
      gates: state.nodes.map((node) => ({
        id: node.id,
        type: node.data.gateType,
        label: node.data.label,
        position: node.position,
        value:
          node.data.gateType === "INPUT"
            ? Boolean(state.inputs[node.id])
            : node.data.value,
        outputMode: node.data.outputMode
      })),
      wires: state.edges.map<Wire>((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle
      }))
    };
  }
}));
