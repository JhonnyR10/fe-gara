import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchSnapshot } from "../api/snapshot";
import { inserisciTempoStart } from "../api/tempi";
import {
  fetchClassificaGiornata,
  fetchClassificaTotale,
} from "../api/classifiche";
import { useRealtime } from "../ws/useRealtime";
import PageLayout from "../ui/PageLayout";
import ResultsTable from "../ui/ResultsTable";
import { getLiveTempo } from "../utils/liveTimer";

const IntermediaPage = () => {
  const { ordine } = useParams();
  const ordineCorrente = Number(ordine);

  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [classificaGiornata, setClassificaGiornata] = useState([]);
  const [classificaTotale, setClassificaTotale] = useState([]);
  const [currentPilotaId, setCurrentPilotaId] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, 50);
    return () => clearInterval(id);
  }, []);

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

  if (error) return <div>Errore: {error}</div>;
  if (!snapshot) return <div>Caricamento...</div>;

  const stazione = snapshot.stazioni.find(
    (p) => p.ordine === ordineCorrente && p.tipo === "INTERMEDIA",
  );

  if (!stazione) {
    return <div>Stazione intermedia non valida</div>;
  }

  const haTempoPrecedente = (pilotaId) =>
    snapshot.tempi.some(
      (t) => t.pilotaId === pilotaId && t.ordineStazione === ordineCorrente - 1,
    );

  const haTempoCorrente = (pilotaId) =>
    snapshot.tempi.some(
      (t) => t.pilotaId === pilotaId && t.stazioneId === stazione.id,
    );
  const ordinePagina = ordineCorrente;

  // const getLiveTempo = (pilotaId) => {
  //   const tempiPilota = snapshot.tempi
  //     .filter(
  //       (t) => t.pilotaId === pilotaId && t.ordineStazione <= ordinePagina,
  //     )
  //     .sort((a, b) => a.ordineStazione - b.ordineStazione);

  //   if (tempiPilota.length === 0) {
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
  //   const deveScorrere = !snapshot.tempi.some(
  //     (t) => t.pilotaId === pilotaId && t.stazioneId === stazione.id,
  //   );

  //   if (!deveScorrere) return tempoSalvato;

  //   return tempoSalvato + (now - ultimoTimestamp);
  // };

  const handleIntermedia = async (pilotaId) => {
    try {
      setLoadingId(pilotaId);
      await inserisciTempoStart({
        giornataId: snapshot.giornata.id,
        pilotaId,
        stazioneId: stazione.id,
      });
    } catch (e) {
      alert(e.message);
    } finally {
      setLoadingId(null);
    }
  };

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
      title={`INTERMEDIA ${ordineCorrente} – ${snapshot.gara.nome}`}
      subtitle="Gestione tempi intermedi"
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
                  const okPrecedente = haTempoPrecedente(p.id);
                  const giàPassato = haTempoCorrente(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={p.id === currentPilotaId ? "highlight" : ""}
                    >
                      <td className="pos">#{p.numeroGara}</td>
                      <td className="align-center name">{p.nome}</td>
                      <td className="align-center">
                        <button
                          className={`button-primary ${
                            loadingId === p.id ? "loading" : ""
                          }`}
                          disabled={
                            !okPrecedente || giàPassato || loadingId === p.id
                          }
                          onClick={() => {
                            setCurrentPilotaId(p.id);
                            handleIntermedia(p.id);
                          }}
                        >
                          {loadingId === p.id
                            ? ""
                            : giàPassato
                              ? "OK"
                              : okPrecedente
                                ? "SEGNA TEMPO"
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
      <div className="surface">
        <h3>Classifica totale</h3>
        <ResultsTable
          results={classificaTotale.map((r) => ({
            id: r.pilotaId,
            name: `#${r.numeroGara} – ${r.nomePilota}`,
            time: Number(r.tempoTotaleMillis),
            diff: Number(r.distaccoMillis ?? 0),
          }))}
          currentUserId={currentPilotaId}
        />
      </div>
    </PageLayout>
  );
};

export default IntermediaPage;
