// const BASE_URL = "http://localhost:3001/api/piloti";

// export async function fetchPilotiByGara(garaId) {
//   const res = await fetch(`${BASE_URL}/gara/${garaId}`);
//   if (!res.ok) throw new Error("Errore fetch piloti");
//   return res.json();
// }

// export async function creaPilota(data) {
//   const res = await fetch(`${BASE_URL}`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   });

//   if (!res.ok) throw new Error("Errore creazione pilota");
//   return res.json();
// }

// export async function updatePilota(id, data) {
//   const res = await fetch(`${BASE_URL}/${id}`, {
//     method: "PATCH",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   });

//   if (!res.ok) throw new Error("Errore modifica pilota");
//   return res.json();
// }

// export async function deletePilota(id) {
//   const res = await fetch(`${BASE_URL}/${id}`, {
//     method: "DELETE",
//   });

//   if (!res.ok) throw new Error("Errore eliminazione pilota");
// }

const API = import.meta.env.VITE_API_URL;

export async function fetchPilotiByGara(garaId) {
  const res = await fetch(`${API}/api/piloti/gara/${garaId}`);
  if (!res.ok) throw new Error("Errore fetch piloti");
  return res.json();
}

export async function creaPilota(data) {
  const res = await fetch(`${API}/api/piloti`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Errore creazione pilota");
  return res.json();
}

export async function updatePilota(id, data) {
  const res = await fetch(`${API}/api/piloti/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Errore modifica pilota");
  return res.json();
}

export async function deletePilota(id) {
  const res = await fetch(`${API}/api/piloti/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Errore eliminazione pilota");
}
