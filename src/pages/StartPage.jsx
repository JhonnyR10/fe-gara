import { useEffect, useState } from "react";
import { fetchSnapshot } from "../api/snapshot";
import { inserisciTempoStart } from "../api/tempi";
import {
  fetchClassificaGiornata,
  fetchClassificaTotale,
} from "../api/classifiche";
import { useRealtime } from "../ws/useRealtime";

const StartPage = () => {
  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [classificaGiornata, setClassificaGiornata] = useState([]);
  const [classificaTotale, setClassificaTotale] = useState([]);
  useRealtime({
    onSnapshot: setSnapshot,
    onClassificaGiornata: setClassificaGiornata,
    onClassificaTotale: setClassificaTotale,
  });

  useEffect(() => {
    fetchSnapshot()
      .then((data) => {
        console.log("SNAPSHOT:", data);
        setSnapshot(data);

        fetchClassificaGiornata(data.giornata.id)
          .then((res) => {
            console.log("CLASSIFICA GIORNATA:", res);
            setClassificaGiornata(res);
          })
          .catch(() => {});

        fetchClassificaTotale(data.gara.id)
          .then((res) => {
            console.log("CLASSIFICA TOTALE:", res);
            setClassificaTotale(res);
          })
          .catch(() => {});
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div>Errore: {error}</div>;
  if (!snapshot) return <div>Caricamento...</div>;

  const startStazione = snapshot.stazioni.find((p) => p.tipo === "START");

  const pilotaHaStart = (pilotaId) =>
    snapshot.tempi.some(
      (t) => t.pilotaId === pilotaId && t.stazioneId === startStazione.id,
    );

  const handleStart = async (pilotaId) => {
    try {
      setLoadingId(pilotaId);

      await inserisciTempoStart({
        giornataId: snapshot.giornata.id,
        pilotaId,
        stazioneId: startStazione.id,
      });

      // const updated = await fetchSnapshot();
      // setSnapshot(updated);

      // fetchClassificaGiornata(updated.giornata.id)
      //   .then(setClassificaGiornata)
      //   .catch(() => {});

      // fetchClassificaTotale(updated.gara.id)
      //   .then(setClassificaTotale)
      //   .catch(() => { });
    } catch (e) {
      alert(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <h2>START – {snapshot.gara.nome}</h2>

      <ul>
        {snapshot.piloti.map((p) => {
          const partito = pilotaHaStart(p.id);

          return (
            <li key={p.id}>
              #{p.numeroGara} – {p.nome}
              <button
                disabled={partito || loadingId === p.id}
                onClick={() => handleStart(p.id)}
                style={{ marginLeft: "10px" }}
              >
                {partito ? "PARTITO" : "START"}
              </button>
            </li>
          );
        })}
      </ul>
      <h3>Classifica giornata</h3>
      <ul>
        {classificaGiornata.map((r) => (
          <li key={r.pilotaId}>
            {r.posizione}. #{r.numeroGara} – {r.nomePilota} –{" "}
            {r.tempoTotaleMillis}
          </li>
        ))}
      </ul>

      <h3>Classifica totale</h3>
      <ul>
        {classificaTotale.map((r) => (
          <li key={r.pilotaId}>
            {r.posizione}. #{r.numeroGara} – {r.nomePilota} –{" "}
            {r.tempoTotaleMillis}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StartPage;
