import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

// Fetch + optional polling
export function useApi(path, intervalMs) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { setData(await api(path)); setError(""); }
    catch (e) { setError(e.message); }
  }, [path]);
  useEffect(() => {
    load();
    if (!intervalMs) return;
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, [load, intervalMs]);
  return { data, error, reload: load };
}

export const fmt = (d) => new Date(d).toLocaleString();
