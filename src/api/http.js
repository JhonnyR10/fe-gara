const API_BASE_URL = "http://localhost:3001/api";

export async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Errore API");
  }

  return response.json();
}
