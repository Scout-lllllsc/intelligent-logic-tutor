import type { Edge, Node } from "reactflow";

type Bit = 0 | 1 | "X";
const key = (nid: string, port: string) => `${nid}.${port}`;

export function simulateCombo(nodes: Node[], edges: Edge[]) {
  const signals = new Map<string, Bit>();

  // fanin: to(node.port) -> from(node.port)
  const fanin = new Map<string, { node: string; port: string }>();
  for (const e of edges) {
    if (!e.source || !e.target) continue;
    fanin.set(key(e.target, e.targetHandle ?? "in"), {
      node: e.source,
      port: e.sourceHandle ?? "out",
    });
  }

  // init: switch outputs from params
  for (const n of nodes) {
    if (n.type === "SWITCH") {
      const v: Bit = n.data?.value ? 1 : 0;
      signals.set(key(n.id, "out"), v);
    }
  }

  // helper: read an input port driven by some wire
  const readIn = (nid: string, port: string): Bit => {
    const src = fanin.get(key(nid, port));
    if (!src) return "X";
    return signals.get(key(src.node, src.port)) ?? "X";
  };

  // iterate to settle combinational logic
  for (let iter = 0; iter < 30; iter++) {
    let changed = false;

    for (const n of nodes) {
      // AND gate
      if (n.type === "AND") {
        const a = readIn(n.id, "a");
        const b = readIn(n.id, "b");
        let out: Bit = "X";
        if (a === 0 || b === 0) out = 0;
        else if (a === "X" || b === "X") out = "X";
        else out = 1;

        const k = key(n.id, "out");
        if (signals.get(k) !== out) {
          signals.set(k, out);
          changed = true;
        }
      }

      // OR gate
      if (n.type === "OR") {
        const a = readIn(n.id, "a");
        const b = readIn(n.id, "b");
        let out: Bit = "X";
        if (a === 1 || b === 1) out = 1;
        else if (a === "X" || b === "X") out = "X";
        else out = 0;

        const k = key(n.id, "out");
        if (signals.get(k) !== out) {
          signals.set(k, out);
          changed = true;
        }
      }

      // LED has no outputs
    }

    if (!changed) break;
  }

  // write LED input values into signals for UI display
  for (const n of nodes) {
    if (n.type === "LED") {
      const vin = readIn(n.id, "in");
      signals.set(key(n.id, "in"), vin);
    }
  }

  return signals;
}
