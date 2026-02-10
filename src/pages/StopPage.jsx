import { useEffect, useState } from "react";
import { fetchSnapshot } from "../api/snapshot";
import { inserisciTempoStart } from "../api/tempi";
import { useNavigate } from "react-router-dom";
import {
  fetchClassificaGiornata,
  fetchClassificaTotale,
} from "../api/classifiche";
import { useRealtime } from "../ws/useRealtime";

const StopPage = () => {
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

  const navigate = useNavigate();

  useEffect(() => {
    fetchSnapshot()
      .then((data) => {
        console.log("SNAPSHOT:", data);
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

  if (error) return <div>Errore: {error}</div>;
  if (!snapshot) return <div>Caricamento...</div>;

  const stopStazione = snapshot.stazioni.find((s) => s.tipo === "STOP");

  if (!stopStazione) {
    return <div>Stazione STOP non trovata</div>;
  }

  const stazionePrecedente = snapshot.stazioni.find(
    (s) => s.ordine === stopStazione.ordine - 1,
  );

  const haTempoPrecedente = (pilotaId) => {
    if (!stazionePrecedente) return false;

    return snapshot.tempi.some(
      (t) => t.pilotaId === pilotaId && t.stazioneId === stazionePrecedente.id,
    );
  };

  const haTempoStop = (pilotaId) => {
    return snapshot.tempi.some(
      (t) => t.pilotaId === pilotaId && t.stazioneId === stopStazione.id,
    );
  };

  const handleStop = async (pilotaId) => {
    setLoadingId(pilotaId);

    try {
      await inserisciTempoStart({
        giornataId: snapshot.giornata.id,
        pilotaId,
        stazioneId: stopStazione.id,
      });

      //   const updated = await fetchSnapshot();
      //   setSnapshot(updated);

      //   fetchClassificaGiornata(updated.giornata.id)
      //     .then(setClassificaGiornata)
      //     .catch(() => {});

      //   fetchClassificaTotale(updated.gara.id)
      //     .then(setClassificaTotale)
      //     .catch(() => {});
    } catch (err) {
      if (
        err.message &&
        err.message.toLowerCase().includes("nessuna gara attiva")
      ) {
        alert("Gara conclusa");
        navigate(`/classifica/${snapshot.gara.id}`);
      } else {
        alert(err.message || "Errore imprevisto");
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <h2>STOP – {snapshot.gara.nome}</h2>

      <ul>
        {snapshot.piloti.map((p) => {
          const puòFermare = haTempoPrecedente(p.id);
          const giàArrivato = haTempoStop(p.id);

          return (
            <li key={p.id}>
              #{p.numeroGara} – {p.nome}
              <button
                disabled={!puòFermare || giàArrivato || loadingId === p.id}
                onClick={() => handleStop(p.id)}
                style={{ marginLeft: "10px" }}
              >
                {giàArrivato ? "ARRIVATO" : puòFermare ? "STOP" : "ATTENDI"}
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

export default StopPage;
