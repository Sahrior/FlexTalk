import { createContext, useCallback, useContext, useRef, useState } from "react";
import { api } from "../api";

// Exact strings printed by the Arduino firmware (main.cpp) via Serial.println
const PHRASES = {
  "washroom": { text: "WashRoom", type: "normal" },
  "drink water": { text: "Drink Water", type: "normal" },
  "go out": { text: "Go out", type: "normal" },
  "food": { text: "Food", type: "normal" },
  "i need help": { text: "I need help", type: "emergency" },
  "medicine": { text: "Medicine", type: "normal" },
  "call doctor": { text: "Call doctor", type: "emergency" },
};
const DUPLICATE_WINDOW_MS = 4000; // firmware holds a sign ~2s; avoid double-saving

const GloveContext = createContext(null);
export const useGlove = () => useContext(GloveContext);

export function GloveProvider({ children }) {
  const supported = typeof navigator !== "undefined" && "serial" in navigator;
  const [connected, setConnected] = useState(false);
  const [current, setCurrent] = useState("NOTHING");
  const [lastSent, setLastSent] = useState(null);
  const [error, setError] = useState("");
  const portRef = useRef(null);
  const readerRef = useRef(null);
  const sentAt = useRef({});

  const handleLine = useCallback(async (raw) => {
    const line = raw.trim();
    if (!line) return;
    if (line.toUpperCase() === "NOTHING") { setCurrent("NOTHING"); return; }
    const phrase = PHRASES[line.toLowerCase()];
    if (!phrase) return; // raw sensor numbers / LCD noise
    setCurrent(phrase.text.toUpperCase());
    const now = Date.now();
    if (now - (sentAt.current[phrase.text] || 0) < DUPLICATE_WINDOW_MS) return;
    sentAt.current[phrase.text] = now;
    try {
      await api("/messages", {
        method: "POST",
        body: { message: phrase.text, message_type: phrase.type },
      });
      setLastSent({ text: phrase.text, type: phrase.type, at: new Date() });
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!supported) {
      setError("Web Serial is not supported. Use Chrome or Edge on desktop.");
      return;
    }
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 }); // matches Serial.begin(9600)
      portRef.current = port;
      setConnected(true);
      setError("");

      const decoder = new TextDecoderStream();
      port.readable.pipeTo(decoder.writable).catch(() => {});
      const reader = decoder.readable.getReader();
      readerRef.current = reader;

      let buffer = "";
      (async () => {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += value;
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop();
            lines.forEach(handleLine);
          }
        } catch { /* port unplugged or closed */ }
        setConnected(false);
        setCurrent("NOTHING");
      })();
    } catch (e) {
      if (e.name !== "NotFoundError") setError(`Could not open the Arduino: ${e.message}`);
    }
  }, [supported, handleLine]);

  const disconnect = useCallback(async () => {
    try { await readerRef.current?.cancel(); } catch { /* ignore */ }
    try { await portRef.current?.close(); } catch { /* ignore */ }
    portRef.current = null;
    setConnected(false);
    setCurrent("NOTHING");
  }, []);

  return (
    <GloveContext.Provider
      value={{ supported, connected, current, lastSent, error, connect, disconnect }}
    >
      {children}
    </GloveContext.Provider>
  );
}
