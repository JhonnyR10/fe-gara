// export async function inserisciTempoStart({
//   giornataId,
//   pilotaId,
//   stazioneId,
// }) {
//   const response = await fetch("http://localhost:3001/api/tempi", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       giornoGaraId: giornataId,
//       pilotaId,
//       stazioneId: stazioneId,
//     }),
//   });

//   if (!response.ok) {
//     const text = await response.text();
//     throw new Error(text || "Errore inserimento tempo");
//   }

//   return response.json();
// }

const API = import.meta.env.VITE_API_URL;

export async function inserisciTempoStart({
  giornataId,
  pilotaId,
  stazioneId,
}) {
  const response = await fetch(`${API}/api/tempi`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      giornoGaraId: giornataId,
      pilotaId,
      stazioneId: stazioneId,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Errore inserimento tempo");
  }

  return response.json();
}
