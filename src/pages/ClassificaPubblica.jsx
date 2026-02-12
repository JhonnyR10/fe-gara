import ClassificaLive from "../components/ClassificaLive";
import { useRealtime } from "../ws/useRealtime";
import { useState } from "react";

const ClassificaPubblica = () => {
  const [snapshot, setSnapshot] = useState(null);
  const [classificaGiornata, setClassificaGiornata] = useState([]);
  const [classificaGenerale, setClassificaGenerale] = useState([]);
  const [garaLiveAttiva, setGaraLiveAttiva] = useState(true);

  useRealtime({
    onSnapshot: setSnapshot,
    onClassificaGiornata: setClassificaGiornata,
    onClassificaTotale: (data) => {
      setClassificaGenerale(data);
      setGaraLiveAttiva(false);
    },
  });

  const isUltimaGiornata = snapshot?.ultimaGiornata ?? false;

  return (
    <div style={{ padding: 24 }}>
      <ClassificaLive
        snapshot={snapshot}
        classificaGiornata={classificaGiornata}
        classificaGenerale={classificaGenerale}
        garaLiveAttiva={garaLiveAttiva}
        isUltimaGiornata={isUltimaGiornata}
      />
    </div>
  );
};

export default ClassificaPubblica;
