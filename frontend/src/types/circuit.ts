import type { Edge, Node } from "reactflow";

export type GateType =
  | "INPUT"
  | "OUTPUT"
  | "AND"
  | "OR"
  | "NOT"
  | "NAND"
  | "NOR"
  | "XOR"
  | "XNOR"
  | "BUFFER"
  | "MUX"
  | "HALFADDER"
  | "FULLADDER";

export type GateOutputMode = "DEFAULT" | "SUM" | "CARRY";

export interface Gate {
  id: string;
  type: GateType;
  label: string;
  position: {
    x: number;
    y: number;
  };
  value?: boolean;
  outputMode?: GateOutputMode;
}

export interface Wire {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
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
  outputMode?: GateOutputMode;
}

export type FlowNode = Node<NodeData>;
export type FlowEdge = Edge;
