import type { Edge, Node } from "reactflow";

export type GateType = "INPUT" | "OUTPUT" | "AND" | "OR" | "NOT" | "NAND" | "NOR" | "XOR";

export interface Gate {
  id: string;
  type: GateType;
  label: string;
  position: {
    x: number;
    y: number;
  };
  value?: boolean;
}

export interface Wire {
  id: string;
  source: string;
  target: string;
}

export interface CircuitData {
  gates: Gate[];
  wires: Wire[];
}

export interface TruthTableRow {
  inputs: Record<string, boolean>;
  outputs: Record<string, boolean>;
}

export interface AnalysisResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
  truthTable: TruthTableRow[];
}

export interface AIResponse {
  reply: string;
}

export interface NodeData {
  label: string;
  gateType: GateType;
  value?: boolean;
}

export type FlowNode = Node<NodeData>;
export type FlowEdge = Edge;
