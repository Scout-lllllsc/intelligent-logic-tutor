import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { chatWithTutor, explainCircuit, practiceCircuit } from "../services/api";
import { useCircuitStore } from "../store/circuitStore";
import type { ChatMessage } from "../types/chat";
import { buildCircuitData } from "../utils/circuit";

const initialMessages: ChatMessage[] = [
  {
    id: "system-1",
    role: "system",
    content:
      "Ask about gate behavior, simplification, debugging, or how your current circuit works."
  }
];

export function AIPanel() {
  const nodes = useCircuitStore((state) => state.nodes);
  const edges = useCircuitStore((state) => state.edges);
  const inputs = useCircuitStore((state) => state.inputs);
  const analysis = useCircuitStore((state) => state.analysis);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  const circuit = useMemo(() => buildCircuitData(nodes, edges, inputs), [nodes, edges, inputs]);

  useEffect(() => {
    if (!chatBoxRef.current) {
      return;
    }

    chatBoxRef.current.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, loading]);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
      const reply = error.response?.data?.reply;
      if (typeof reply === "string" && reply.trim()) {
        return reply;
      }

      if (typeof error.message === "string" && error.message.trim()) {
        return error.message;
      }
    }

    return error instanceof Error ? error.message : fallback;
  };

  const appendAssistantReply = (reply: string) => {
    setMessages((current) => [
      ...current,
      { id: `assistant-${Date.now()}`, role: "assistant", content: reply }
    ]);
  };

  const appendUserMessage = (content: string) => {
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", content }
    ]);
  };

  const runAction = async (
    action: "Explain" | "Practice",
    request: () => Promise<{ reply: string }>
  ) => {
    setLoading(true);
    appendUserMessage(action);
    try {
      const response = await request();
      appendAssistantReply(response.reply);
    } catch (error) {
      appendAssistantReply(getErrorMessage(error, `${action} request failed.`));
    } finally {
      setLoading(false);
    }
  };

  const sendChat = async () => {
    if (!input.trim()) {
      return;
    }

    const prompt = input.trim();
    setInput("");
    setLoading(true);
    appendUserMessage(prompt);

    try {
      const response = await chatWithTutor(prompt, circuit);
      appendAssistantReply(response.reply);
    } catch (error) {
      appendAssistantReply(getErrorMessage(error, "Chat request failed."));
    } finally {
      setLoading(false);
    }
  };

  const injectAnalysis = () => {
    if (!analysis) {
      appendAssistantReply("Create a circuit first so I can analyze it.");
      return;
    }

    appendUserMessage("Analyze");
    appendAssistantReply(
      `${analysis.summary}\n\nErrors: ${
        analysis.errors.length > 0 ? analysis.errors.join(", ") : "none"
      }\nWarnings: ${
        analysis.warnings.length > 0 ? analysis.warnings.join(", ") : "none"
      }`
    );
  };

  return (
    <div className="section-shell ai-panel-shell">
      <h2 className="section-title">AI Tutor</h2>

      <div className="chat-actions">
        <button className="action-button" disabled={loading} onClick={injectAnalysis}>
          <strong>Analyze</strong>
        </button>
        <button
          className="action-button"
          disabled={loading}
          onClick={() => runAction("Explain", () => explainCircuit(circuit))}
        >
          <strong>Explain</strong>
        </button>
        <button
          className="action-button"
          disabled={loading}
          onClick={() => runAction("Practice", () => practiceCircuit(circuit))}
        >
          <strong>Practice</strong>
        </button>
      </div>

      <div className="divider" />

      <div ref={chatBoxRef} className="chat-box ai-chat-box">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            {message.content}
          </div>
        ))}
      </div>

      <div className="divider" />

      <div className="composer">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask the tutor about propagation, truth tables, simplification, or debugging..."
        />
        <div className="composer-footer">
          <button
            className="secondary-button"
            disabled={loading}
            onClick={() => setMessages(initialMessages)}
          >
            Reset chat
          </button>
          <button className="primary-button" disabled={loading} onClick={sendChat}>
            {loading ? "Waiting..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
