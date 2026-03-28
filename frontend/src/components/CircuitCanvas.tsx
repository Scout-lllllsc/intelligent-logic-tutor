import { Background, Controls, MiniMap, ReactFlow, ReactFlowProvider } from "reactflow";
import { useCircuitStore } from "../store/circuitStore";
import { LogicNode } from "./LogicNode";

const nodeTypes = {
  logicNode: LogicNode
};

function CircuitCanvasInner() {
  const nodes = useCircuitStore((state) => state.nodes);
  const edges = useCircuitStore((state) => state.edges);
  const analysis = useCircuitStore((state) => state.analysis);
  const onNodesChange = useCircuitStore((state) => state.onNodesChange);
  const onEdgesChange = useCircuitStore((state) => state.onEdgesChange);
  const onConnect = useCircuitStore((state) => state.onConnect);
  const deleteSelection = useCircuitStore((state) => state.deleteSelection);

  return (
    <section className="canvas-shell">
      <div className="canvas-toolbar">
        <div className="summary-group">
          <span className="chip">
            <strong>{nodes.length}</strong> nodes
          </span>
          <span className="chip">
            <strong>{edges.length}</strong> wires
          </span>
          <span className="chip">
            <strong>{analysis?.truthTable.length ?? 0}</strong> truth rows
          </span>
        </div>
        <button className="secondary-button" onClick={deleteSelection}>
          Delete selected
        </button>
      </div>

      <div className="flow-shell">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      {analysis ? (
        <div className="analysis-card">
          <strong>Live analysis</strong>
          <span>{analysis.summary}</span>
          {analysis.errors.length > 0 ? (
            <ul className="analysis-list">
              {analysis.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <div className="empty-state">
          Add or connect nodes to generate validation feedback and truth table analysis.
        </div>
      )}
    </section>
  );
}

export function CircuitCanvas() {
  return (
    <ReactFlowProvider>
      <CircuitCanvasInner />
    </ReactFlowProvider>
  );
}
