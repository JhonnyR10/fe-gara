import { useEffect, useState, useRef } from "react";
import { fetchSnapshot } from "../api/snapshot";
import { inserisciTempoStart } from "../api/tempi";
import { useNavigate } from "react-router-dom";
import { useRealtime } from "../ws/useRealtime";
import PageLayout from "../ui/PageLayout";
import ResultsTable from "../ui/ResultsTable";
import { getLiveTempo } from "../utils/liveTimer";

const StopPage = () => {
  const [snapshot, setSnapshot] = useState(null);
  const [classificaGiornata, setClassificaGiornata] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);
  const [currentPilotaId, setCurrentPilotaId] = useState(null);
  const navigate = useNavigate();
  const garaIdRef = useRef(null);
  const redirectedRef = useRef(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, 50);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetchSnapshot()
      .then((data) => {
        setSnapshot(data);
        garaIdRef.current = data.gara.id;
      })
      .catch((err) => setError(err.message));
  }, []);

  useRealtime({
    onSnapshot: (data) => {
      setSnapshot(data);
    },

    onClassificaGiornata: (data) => {
      setClassificaGiornata(data);
    },

    onClassificaTotale: () => {
      if (!redirectedRef.current && garaIdRef.current) {
        redirectedRef.current = true;
        navigate(`/classifica/${garaIdRef.current}`);
      }
    },
  });

  if (error) return <div>Errore: {error}</div>;
  if (!snapshot) return <div>Caricamento...</div>;

  const stopStazione = snapshot.stazioni.find((s) => s.tipo === "STOP");
  if (!stopStazione) return <div>Stazione STOP non trovata</div>;
  // const giornataFinita = snapshot.piloti.every((p) =>
  //   snapshot.tempi.some(
  //     (t) => t.pilotaId === p.id && t.stazioneId === stopStazione.id,
  //   ),
  // );

  const stazionePrecedente = snapshot.stazioni.find(
    (s) => s.ordine === stopStazione.ordine - 1,
  );

  const haTempoPrecedente = (pilotaId) =>
    stazionePrecedente &&
    snapshot.tempi.some(
      (t) => t.pilotaId === pilotaId && t.stazioneId === stazionePrecedente.id,
    );

  const haTempoStop = (pilotaId) =>
    snapshot.tempi.some(
      (t) => t.pilotaId === pilotaId && t.stazioneId === stopStazione.id,
    );

  // const getLiveTempo = (pilotaId) => {
  //   const tempiPilota = snapshot.tempi
  //     .filter((t) => t.pilotaId === pilotaId)
  //     .sort((a, b) => a.ordineStazione - b.ordineStazione);

  //   if (giornataFinita || tempiPilota.length === 0) {
  //     const riga = classificaGiornata.find((r) => r.pilotaId === pilotaId);
  //     return riga ? riga.tempoTotaleMillis : 0;
  //   }

  //   const ultimo = tempiPilota.at(-1);
  //   const ultimoTimestamp = new Date(ultimo.timestamp).getTime();

  //   const tempoSalvato = tempiPilota.reduce((acc, t, i, arr) => {
  //     if (i === 0) return 0;
  //     const prev = new Date(arr[i - 1].timestamp).getTime();
  //     const curr = new Date(t.timestamp).getTime();
  //     return acc + (curr - prev);
  //   }, 0);
  //   const deveScorrere = ultimo.stazioneId !== stopStazione.id;

  //   if (!deveScorrere) return tempoSalvato;

  //   return tempoSalvato + (now - ultimoTimestamp);
  // };

  const handleStop = async (pilotaId) => {
    setLoadingId(pilotaId);
    try {
      await inserisciTempoStart({
        giornataId: snapshot.giornata.id,
        pilotaId,
        stazioneId: stopStazione.id,
      });
    } catch (err) {
      alert(err.message || "Errore imprevisto");
    } finally {
      setLoadingId(null);
    }
  };

  const ordinePagina = stopStazione.ordine;

  // const classificaGiornataLive = classificaGiornata.map((r) => ({
  //   id: r.pilotaId,
  //   name: `#${r.numeroGara} – ${r.nomePilota}`,
  //   time: getLiveTempo(r.pilotaId),
  //   diff: r.distaccoMillis ?? 0,
  // }));
  const classificaGiornataLive = classificaGiornata.map((r) => ({
    id: r.pilotaId,
    name: `#${r.numeroGara} – ${r.nomePilota}`,
    time: getLiveTempo({
      pilotaId: r.pilotaId,
      snapshot,
      classificaGiornata,
      ordinePagina,
      now,
    }),
    diff: r.distaccoMillis ?? 0,
  }));

  return (
    <PageLayout
      title={`STOP – ${snapshot.gara.nome}`}
      subtitle="Arrivo piloti e chiusura gara"
    >
      <div className="desktop-split">
        <div className="surface results-surface">
          <h3>Piloti</h3>
          <div className="results-body">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {snapshot.piloti.map((p) => {
                  const puòFermare = haTempoPrecedente(p.id);
                  const arrivato = haTempoStop(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={p.id === currentPilotaId ? "highlight" : ""}
                    >
                      <td className="pos">#{p.numeroGara}</td>
                      <td className="name align-center">{p.nome}</td>
                      <td className="align-center">
                        <button
                          className={`button-primary ${
                            loadingId === p.id ? "loading" : ""
                          }`}
                          disabled={
                            !puòFermare || arrivato || loadingId === p.id
                          }
                          onClick={() => {
                            setCurrentPilotaId(p.id);
                            handleStop(p.id);
                          }}
                        >
                          {loadingId === p.id
                            ? ""
                            : arrivato
                              ? "ARRIVATO"
                              : puòFermare
                                ? "STOP"
                                : "ATTENDI"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="surface results-surface">
          <h3>Classifica giornata</h3>
          <ResultsTable
            results={classificaGiornataLive}
            currentUserId={currentPilotaId}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default StopPage;
