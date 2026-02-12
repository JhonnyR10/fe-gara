// const BASE_URL = "http://localhost:3001/api";

// export async function fetchGare() {
//   const res = await fetch(`${BASE_URL}/gare`);
//   if (!res.ok) throw new Error("Errore fetch gare");
//   return res.json();
// }

// export async function creaGara(data) {
//   const res = await fetch(`${BASE_URL}/gare`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   });

//   if (!res.ok) throw new Error("Errore creazione gara");
//   return res.json();
// }

// export async function apriGara(id) {
//   const res = await fetch(`${BASE_URL}/gare/${id}/apri`, {
//     method: "PATCH",
//     headers: { "Content-Type": "application/json" },
//   });

//   if (!res.ok) throw new Error("Errore apertura gara");
//   return res.json();
// }

const API = import.meta.env.VITE_API_URL;

export async function fetchGare() {
  const res = await fetch(`${API}/api/gare`);
  if (!res.ok) throw new Error("Errore fetch gare");
  return res.json();
}

export async function creaGara(data) {
  const res = await fetch(`${API}/api/gare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Errore creazione gara");
  return res.json();
}

export async function apriGara(id) {
  const res = await fetch(`${API}/api/gare/${id}/apri`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Errore apertura gara");
  return res.json();
}
