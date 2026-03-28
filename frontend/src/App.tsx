import { useEffect, useMemo, useState } from "react";
import { Toolbox } from "./components/Toolbox";
import { CircuitCanvas } from "./components/CircuitCanvas";
import { AIPanel } from "./components/AIPanel";
import { useCircuitStore } from "./store/circuitStore";
import { analyzeCircuit } from "./services/api";
import { buildCircuitData } from "./utils/circuit";

function App() {
  const nodes = useCircuitStore((state) => state.nodes);
  const edges = useCircuitStore((state) => state.edges);
  const inputs = useCircuitStore((state) => state.inputs);
  const setAnalysis = useCircuitStore((state) => state.setAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const circuit = useMemo(() => buildCircuitData(nodes, edges, inputs), [nodes, edges, inputs]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (circuit.gates.length === 0) {
        setAnalysis(null);
        return;
      }

      setIsAnalyzing(true);
      try {
        const result = await analyzeCircuit(circuit);
        setAnalysis(result);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to analyze circuit.";
        setAnalysis({
          isValid: false,
          errors: [message],
          warnings: [],
          truthTable: [],
          summary: "Analysis service unavailable."
        });
      } finally {
        setIsAnalyzing(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [circuit, setAnalysis]);

  return (
    <div className="app-shell">
      <aside className="left-panel">
        <Toolbox />
      </aside>
      <main className="center-panel">
        <header className="hero-bar">
          <div>
            <p className="eyebrow">Graduation Project</p>
            <h1>Intelligent Tutoring System and Simulator for Digital Logic Circuit Design</h1>
            <p className="subtitle">
              Build digital circuits, simulate truth tables, and ask an AI tutor
              for explanations, analysis, and guided practice.
            </p>
          </div>
          <div className="status-card">
            <span className={isAnalyzing ? "status-dot active" : "status-dot"} />
            <strong>{isAnalyzing ? "Analyzing circuit" : "Ready for simulation"}</strong>
            <span>Backend API: http://localhost:5001/api</span>
          </div>
        </header>
        <CircuitCanvas />
      </main>
      <aside className="right-panel">
        <AIPanel />
      </aside>
    </div>
  );
}

export default App;
