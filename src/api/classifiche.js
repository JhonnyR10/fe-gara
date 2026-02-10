export async function fetchClassificaGiornata(giornataId) {
  const res = await fetch(
    `http://localhost:3001/api/classifiche/giornata/${giornataId}`,
  );
  if (!res.ok) throw new Error("Errore classifica giornata");
  return res.json();
}

export async function fetchClassificaTotale(garaId) {
  const res = await fetch(
    `http://localhost:3001/api/classifiche/gara/${garaId}/totale`,
  );
  if (!res.ok) throw new Error("Errore classifica totale");
  return res.json();
}
