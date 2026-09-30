const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getToken = () => localStorage.getItem("signGloveToken");
export const getUser = () => {
  try { return JSON.parse(localStorage.getItem("signGloveUser")); }
  catch { return null; }
};
export const saveSession = (token, user) => {
  localStorage.setItem("signGloveToken", token);
  localStorage.setItem("signGloveUser", JSON.stringify(user));
};
export const clearSession = () => {
  localStorage.removeItem("signGloveToken");
  localStorage.removeItem("signGloveUser");
};

export async function api(path, { method = "GET", body } = {}) {
  const token = getToken();
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token) {
    clearSession();
    window.location.href = "/login";
  }
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}
