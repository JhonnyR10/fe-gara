import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchClassificaTotale } from "../api/classifiche";
import { useRealtime } from "../ws/useRealtime";

const formatTempo = (millis) => {
  if (millis == null) return "--:--";

  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const ms = millis % 1000;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0") +
    "." +
    String(ms).padStart(3, "0")
  );
};

const ClassificaPage = () => {
  const { garaId } = useParams();
  const [classifica, setClassifica] = useState([]);
  const [error, setError] = useState(null);
  useRealtime({
    onClassificaTotale: setClassifica,
  });

  useEffect(() => {
    fetchClassificaTotale(garaId)
      .then(setClassifica)
      .catch((err) => setError(err.message));
  }, [garaId]);

  if (error) return <div>Errore: {error}</div>;

  if (!classifica || classifica.length === 0) {
    return <div>Nessun risultato disponibile</div>;
  }

  return (
    <div>
      <h2>Classifica finale</h2>

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>#</th>
            <th>Num</th>
            <th>Pilota</th>
            <th>Tempo</th>
          </tr>
        </thead>
        <tbody>
          {classifica.map((r) => (
            <tr key={r.pilotaId}>
              <td>{r.posizione}</td>
              <td>{r.numeroGara}</td>
              <td>{r.nomePilota}</td>
              <td>{formatTempo(r.tempoTotaleMillis)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClassificaPage;
