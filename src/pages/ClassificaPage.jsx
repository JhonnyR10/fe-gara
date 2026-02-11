import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchClassificaTotale } from "../api/classifiche";
import { useRealtime } from "../ws/useRealtime";
import PageLayout from "../ui/PageLayout";
import ResultsTable from "../ui/ResultsTable";

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
    <PageLayout title="Classifica finale" subtitle="Risultati ufficiali">
      <ResultsTable
        results={classifica.map((r) => ({
          id: r.pilotaId,
          name: `#${r.numeroGara} – ${r.nomePilota}`,
          time: Number(r.tempoTotaleMillis),
          diff: Number(r.distaccoMillis ?? 0),
        }))}
      />
    </PageLayout>
  );
};

export default ClassificaPage;
