import type { CircuitData, FlowEdge, FlowNode, Wire } from "../types/circuit";

export function buildCircuitData(
  nodes: FlowNode[],
  edges: FlowEdge[],
  inputs: Record<string, boolean>
): CircuitData {
  return {
    gates: nodes.map((node) => ({
      id: node.id,
      type: node.data.gateType,
      label: node.data.label,
      position: node.position,
      value:
        node.data.gateType === "INPUT"
          ? Boolean(inputs[node.id])
          : node.data.value,
      outputMode: node.data.outputMode
    })),
    wires: edges.map<Wire>((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle
    }))
  };
}
