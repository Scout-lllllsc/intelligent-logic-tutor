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

  // init switch outputs
  for (const n of nodes) {
    if (n.type === "SWITCH") {
      const v: Bit = n.data?.value ? 1 : 0;
      signals.set(key(n.id, "out"), v);
    }
  }

  const readIn = (nid: string, port: string): Bit => {
    const src = fanin.get(key(nid, port));
    if (!src) return "X";
    return signals.get(key(src.node, src.port)) ?? "X";
  };

  // iterate to settle
  for (let iter = 0; iter < 30; iter++) {
    let changed = false;

    for (const n of nodes) {
      // AND
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

      // OR
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

      // NOT
      if (n.type === "NOT") {
        const a = readIn(n.id, "in");
        let out: Bit = "X";
        if (a === "X") out = "X";
        else out = a === 1 ? 0 : 1;

        const k = key(n.id, "out");
        if (signals.get(k) !== out) {
          signals.set(k, out);
          changed = true;
        }
      }

      // XOR
      if (n.type === "XOR") {
        const a = readIn(n.id, "a");
        const b = readIn(n.id, "b");
        let out: Bit = "X";
        if (a === "X" || b === "X") out = "X";
        else out = (a ^ b) as 0 | 1;

        const k = key(n.id, "out");
        if (signals.get(k) !== out) {
          signals.set(k, out);
          changed = true;
        }
      }

      // NAND = NOT(AND)
      if (n.type === "NAND") {
        const a = readIn(n.id, "a");
        const b = readIn(n.id, "b");
        let out: Bit = "X";
        if (a === 0 || b === 0) out = 1;
        else if (a === "X" || b === "X") out = "X";
        else out = 0;

        const k = key(n.id, "out");
        if (signals.get(k) !== out) {
          signals.set(k, out);
          changed = true;
        }
      }

      // NOR = NOT(OR)
      if (n.type === "NOR") {
        const a = readIn(n.id, "a");
        const b = readIn(n.id, "b");
        let out: Bit = "X";
        if (a === 1 || b === 1) out = 0;
        else if (a === "X" || b === "X") out = "X";
        else out = 1;

        const k = key(n.id, "out");
        if (signals.get(k) !== out) {
          signals.set(k, out);
          changed = true;
        }
      }
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
