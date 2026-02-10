import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchSnapshot } from "../api/snapshot";
import { inserisciTempoStart } from "../api/tempi";
import {
  fetchClassificaGiornata,
  fetchClassificaTotale,
} from "../api/classifiche";
import { useRealtime } from "../ws/useRealtime";

const IntermediaPage = () => {
  const { ordine } = useParams();
  const ordineCorrente = Number(ordine);

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
        setSnapshot(data);

        fetchClassificaGiornata(data.giornata.id)
          .then(setClassificaGiornata)
          .catch(() => {});

        fetchClassificaTotale(data.gara.id)
          .then(setClassificaTotale)
          .catch(() => {});
      })
      .catch((err) => setError(err.message));
  }, []);

  console.log("SNAPSHOT:", snapshot);
  if (error) return <div>Errore: {error}</div>;
  if (!snapshot) return <div>Caricamento...</div>;

  const stazione = snapshot.stazioni.find(
    (p) => p.ordine === ordineCorrente && p.tipo === "INTERMEDIA",
  );

  if (!stazione) {
    return <div>Stazione intermedia non valida</div>;
  }
  const haTempoPrecedente = (pilotaId) => {
    return snapshot.tempi.some(
      (t) => t.pilotaId === pilotaId && t.ordineStazione === ordineCorrente - 1,
    );
  };
  const haTempoCorrente = (pilotaId) => {
    return snapshot.tempi.some(
      (t) => t.pilotaId === pilotaId && t.stazioneId === stazione.id,
    );
  };
  const handleIntermedia = async (pilotaId) => {
    try {
      setLoadingId(pilotaId);

      await inserisciTempoStart({
        giornataId: snapshot.giornata.id,
        pilotaId,
        stazioneId: stazione.id,
      });

      //   const updated = await fetchSnapshot();
      //   setSnapshot(updated);

      //   fetchClassificaGiornata(updated.giornata.id)
      //     .then(setClassificaGiornata)
      //     .catch(() => {});

      //   fetchClassificaTotale(updated.gara.id)
      //     .then(setClassificaTotale)
      //     .catch(() => {});
    } catch (e) {
      alert(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <h2>
        INTERMEDIA {ordineCorrente} – {snapshot.gara.nome}
      </h2>

      <ul>
        {snapshot.piloti.map((p) => {
          const okPrecedente = haTempoPrecedente(p.id);
          const giàPassato = haTempoCorrente(p.id);

          return (
            <li key={p.id}>
              #{p.numeroGara} – {p.nome}
              <button
                disabled={!okPrecedente || giàPassato || loadingId === p.id}
                onClick={() => handleIntermedia(p.id)}
                style={{ marginLeft: "10px" }}
              >
                {giàPassato ? "OK" : okPrecedente ? "SEGNA TEMPO" : "ATTENDI"}
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

export default IntermediaPage;
