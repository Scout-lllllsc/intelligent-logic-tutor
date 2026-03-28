import type { TruthTableRow } from "../types/circuit";

interface TruthTableProps {
  rows: TruthTableRow[];
}

export function TruthTable({ rows }: TruthTableProps) {
  if (rows.length === 0) {
    return <div className="empty-state">Truth table rows will appear after a valid analysis.</div>;
  }

  const firstRow = rows[0];
  const inputKeys = Object.keys(firstRow.inputs);
  const outputKeys = Object.keys(firstRow.outputs);

  return (
    <table className="truth-table">
      <thead>
        <tr>
          {inputKeys.map((key) => (
            <th key={key}>{key}</th>
          ))}
          {outputKeys.map((key) => (
            <th key={key}>{key}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {inputKeys.map((key) => (
              <td key={`${index}-${key}`}>{row.inputs[key] ? 1 : 0}</td>
            ))}
            {outputKeys.map((key) => (
              <td key={`${index}-${key}`}>{row.outputs[key] ? 1 : 0}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
