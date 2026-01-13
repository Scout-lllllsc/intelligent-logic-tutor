import CircuitEditor from "./app/CircuitEditor";

export default function App() {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <div style={{ padding: 8, fontWeight: 700 }}>CIRCUIT EDITOR LOADED</div>
      <div style={{ height: "calc(100% - 40px)" }}>
        <CircuitEditor />
      </div>
    </div>
  );
}
