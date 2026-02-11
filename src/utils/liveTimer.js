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

  const ultimo = tempiPilota.at(-1);

  const haTempoPagina = tempiPilota.some(
    (t) => t.ordineStazione === ordinePagina,
  );

  if (haTempoPagina) {
    return tempoUfficiale;
  }
  const ultimoTimestamp = new Date(ultimo.timestamp).getTime();

  return tempoUfficiale + (now - ultimoTimestamp);
}
