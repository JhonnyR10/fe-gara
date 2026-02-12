// export function getLiveTempo({
//   pilotaId,
//   snapshot,
//   classificaGiornata,
//   ordinePagina,
//   now,
// }) {
//   if (!snapshot) return 0;

//   const tempiPilota = snapshot.tempi
//     .filter((t) => t.pilotaId === pilotaId && t.ordineStazione <= ordinePagina)
//     .sort((a, b) => a.ordineStazione - b.ordineStazione);

//   if (tempiPilota.length === 0) {
//     const riga = classificaGiornata.find((r) => r.pilotaId === pilotaId);
//     return riga ? riga.tempoTotaleMillis : 0;
//   }
//   const tempoUfficiale = tempiPilota.reduce((acc, t, i, arr) => {
//     if (i === 0) return 0;
//     const prev = new Date(arr[i - 1].timestamp).getTime();
//     const curr = new Date(t.timestamp).getTime();
//     return acc + (curr - prev);
//   }, 0);

//   const ultimo = tempiPilota.at(-1);

//   const haTempoPagina = tempiPilota.some(
//     (t) => t.ordineStazione === ordinePagina,
//   );

//   if (haTempoPagina) {
//     return tempoUfficiale;
//   }
//   const ultimoTimestamp = new Date(ultimo.timestamp).getTime();

//   return tempoUfficiale + (now - ultimoTimestamp);
// }

export function getLiveTempo({
  pilotaId,
  snapshot,
  classificaGiornata,
  ordinePagina,
  now,
}) {
  if (!snapshot) return 0;

  const tempiPilota = snapshot.tempi
    .filter((t) => t.pilotaId === pilotaId && t.ordineStazione <= ordinePagina)
    .sort((a, b) => a.ordineStazione - b.ordineStazione);

  if (tempiPilota.length === 0) {
    const riga = classificaGiornata.find((r) => r.pilotaId === pilotaId);
    return riga ? riga.tempoTotaleMillis : 0;
  }

  const tempoUfficiale = tempiPilota.reduce((acc, t, i, arr) => {
    if (i === 0) return 0;
    const prev = new Date(arr[i - 1].timestamp).getTime();
    const curr = new Date(t.timestamp).getTime();
    return acc + (curr - prev);
  }, 0);

  const ordineUltimaStazione = Math.max(
    ...snapshot.stazioni.map((s) => s.ordine),
  );

  const haFinito = snapshot.tempi.some(
    (t) => t.pilotaId === pilotaId && t.ordineStazione === ordineUltimaStazione,
  );

  if (haFinito) {
    return tempoUfficiale;
  }

  const ultimo = tempiPilota.at(-1);

  const haTempoPagina = tempiPilota.some(
    (t) => t.ordineStazione === ordinePagina,
  );
  console.log({
    pilotaId,
    ordinePagina,
    tempiPilota,
  });

  if (haTempoPagina) {
    return tempoUfficiale;
  }

  const ultimoTimestamp = new Date(ultimo.timestamp).getTime();

  return tempoUfficiale + (now - ultimoTimestamp);
}

export function getLiveTempoClassifica({
  pilotaId,
  snapshot,
  ordineStazione,
  now,
  isLive,
}) {
  if (!snapshot) return 0;

  const tempiPilota = snapshot.tempi
    .filter((t) => t.pilotaId === pilotaId)
    .sort((a, b) => a.ordineStazione - b.ordineStazione);

  if (tempiPilota.length === 0) return 0;

  const ordineUltimaStazione = Math.max(
    ...snapshot.stazioni.map((s) => s.ordine),
  );

  const start = tempiPilota.find((t) => t.ordineStazione === 1);
  if (!start) return 0;

  const startTimestamp = new Date(start.timestamp).getTime();

  const tempoRichiesto = tempiPilota.find(
    (t) => t.ordineStazione === ordineStazione,
  );

  const ultimoRegistrato = tempiPilota.at(-1);
  const ultimoTimestamp = new Date(ultimoRegistrato.timestamp).getTime();

  const haFinito = tempiPilota.some(
    (t) => t.ordineStazione === ordineUltimaStazione,
  );

  if (ordineStazione === 1) {
    return 0;
  }

  if (tempoRichiesto) {
    const timestamp = new Date(tempoRichiesto.timestamp).getTime();
    return timestamp - startTimestamp;
  }
  if (haFinito) {
    return ultimoTimestamp - startTimestamp;
  }

  if (!isLive) {
    return ultimoTimestamp - startTimestamp;
  }

  return now - startTimestamp;
}
