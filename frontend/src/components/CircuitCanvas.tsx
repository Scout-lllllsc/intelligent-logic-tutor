import { Background, Controls, MiniMap, ReactFlow, ReactFlowProvider } from "reactflow";
import { useCircuitStore } from "../store/circuitStore";
import { LogicNode } from "./LogicNode";
import { TruthTable } from "./TruthTable";

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

      <div className="canvas-bottom-row">
        {analysis ? (
          <div className="analysis-card">
            <div className="panel-title">
              <strong>Live analysis</strong>
              <span className="panel-caption">Validation feedback updates automatically.</span>
            </div>
            <span>{analysis.summary}</span>
            {analysis.errors.length > 0 ? (
              <ul className="analysis-list">
                {analysis.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            ) : (
              <div className="analysis-note">No validation errors detected.</div>
            )}
            {analysis.warnings.length > 0 ? (
              <ul className="analysis-list warning-list">
                {analysis.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <div className="analysis-card empty-panel">
            <strong>Live analysis</strong>
            <span className="empty-state">
              Add or connect nodes to generate validation feedback and simulation results.
            </span>
          </div>
        )}

        <div className="truth-table-card">
          <div className="truth-table-header">
            <div className="truth-table-copy">
              <strong>Truth Table</strong>
              <span className="panel-caption">
                All input and output combinations for the current circuit.
              </span>
            </div>
            <span className="chip">
              <strong>{analysis?.truthTable.length ?? 0}</strong> rows
            </span>
          </div>
          <div className="truth-table-scroll truth-table-scroll-expanded">
            <TruthTable rows={analysis?.truthTable ?? []} />
          </div>
        </div>
      </div>
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
