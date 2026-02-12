// import { useEffect, useState } from "react";
// import { getLiveTempo } from "../utils/liveTimer";
// import TimeDisplay from "../ui/TimeDisplay";

// const ClassificaLive = ({ snapshot, classificaGiornata, garaLiveAttiva }) => {
//   // eslint-disable-next-line react-hooks/purity
//   const [now, setNow] = useState(Date.now());

//   useEffect(() => {
//     if (!garaLiveAttiva) return;

//     const id = setInterval(() => {
//       setNow(Date.now());
//     }, 100);

//     return () => clearInterval(id);
//   }, [garaLiveAttiva]);

//   if (!snapshot) return <div>In attesa dati live...</div>;
//   const isLive = garaLiveAttiva;

//   const stazioni = snapshot.stazioni
//     .slice()
//     .sort((a, b) => a.ordine - b.ordine);

//   const rows = classificaGiornata.map((r, index) => {
//     const tempiPerStazione = stazioni.map((stazione) => {
//       if (!isLive) {
//         return r.tempoTotaleMillis ?? 0;
//       }

//       return getLiveTempo({
//         pilotaId: r.pilotaId,
//         snapshot,
//         classificaGiornata,
//         ordinePagina: stazione.ordine,
//         now,
//       });
//     });

//     // const tempiPerStazione = stazioni.map((stazione) => {
//     //   return getLiveTempoPerStazione({
//     //     pilotaId: r.pilotaId,
//     //     snapshot,
//     //     ordinePagina: stazione.ordine,
//     //     now,
//     //     live: isLive,
//     //   });
//     // });

//     const tempoTotale = isLive
//       ? getLiveTempo({
//           pilotaId: r.pilotaId,
//           snapshot,
//           classificaGiornata,
//           ordinePagina: stazioni.at(-1)?.ordine,
//           now,
//         })
//       : (r.tempoTotaleMillis ?? 0);

//     return {
//       posizione: index + 1,
//       numeroGara: r.numeroGara,
//       nome: r.nomePilota,
//       tempiPerStazione,
//       tempoTotale,
//     };
//   });

//   return (
//     <div className="surface">
//       <h3>
//         Classifica Live – {snapshot.gara.nome} – Giornata{" "}
//         {snapshot.giornata?.ordine}
//       </h3>

//       <table className="table">
//         <thead>
//           <tr>
//             <th>Pos</th>
//             <th>#</th>
//             <th>Nome</th>
//             {stazioni.map((s) => (
//               <th key={s.id}>
//                 {s.tipo === "INTERMEDIA" ? `INT ${s.ordine - 1}` : s.tipo}
//               </th>
//             ))}
//             <th>Totale</th>
//           </tr>
//         </thead>

//         <tbody>
//           {rows.map((row) => (
//             <tr key={row.numeroGara}>
//               <td>{row.posizione}</td>
//               <td>#{row.numeroGara}</td>
//               <td>{row.nome}</td>

//               {row.tempiPerStazione.map((t, i) => (
//                 <td key={i}>
//                   <TimeDisplay ms={t} />
//                 </td>
//               ))}

//               <td>
//                 <TimeDisplay ms={row.tempoTotale} />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default ClassificaLive;

import { useEffect, useState, useMemo } from "react";
import TimeDisplay from "../ui/TimeDisplay";

const ClassificaLive = ({
  snapshot,
  classificaGiornata,
  classificaGenerale,
  garaLiveAttiva,
  isUltimaGiornata,
}) => {
  // eslint-disable-next-line react-hooks/purity
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!garaLiveAttiva) return;

    const id = setInterval(() => {
      setNow(Date.now());
    }, 100);

    return () => clearInterval(id);
  }, [garaLiveAttiva]);

  const stazioni = useMemo(() => {
    if (!snapshot?.stazioni) return [];
    return snapshot.stazioni.slice().sort((a, b) => a.ordine - b.ordine);
  }, [snapshot]);

  const ordineUltimaStazione = stazioni.at(-1)?.ordine;

  const giornataVuota = snapshot?.tempi?.length === 0;

  // ultima giornata conclusa
  if (!garaLiveAttiva && isUltimaGiornata) {
    return (
      <div className="surface">
        <h3>Classifica Finale</h3>
        <table className="table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Pos</th>
              <th style={{ textAlign: "left" }}>#</th>
              <th>Nome</th>
              <th>Totale</th>
            </tr>
          </thead>
          <tbody>
            {classificaGenerale.map((r, index) => (
              <tr key={r.numeroGara}>
                <td>{index + 1}</td>
                <td style={{ textAlign: "left" }}>{r.numeroGara}</td>
                <td className="align-center">{r.nomePilota}</td>
                <td className="align-center">
                  <TimeDisplay ms={r.tempoTotaleMillis} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // nessun tempo ancora
  if (garaLiveAttiva && giornataVuota) {
    return (
      <div className="surface">
        <h3>Classifica Giornata Precedente</h3>
        <table className="table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Pos</th>
              <th style={{ textAlign: "left" }}>#</th>
              <th>Nome</th>
              <th>Totale</th>
            </tr>
          </thead>
          <tbody>
            {classificaGiornata.map((r, index) => (
              <tr key={r.numeroGara}>
                <td>{index + 1}</td>
                <td style={{ textAlign: "left" }}>{r.numeroGara}</td>
                <td className="align-center">{r.nomePilota}</td>
                <td className="align-center">
                  <TimeDisplay ms={r.tempoTotaleMillis} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // LIVE
  if (!snapshot) {
    return <div>In attesa dati live...</div>;
  }

  function getLiveTempoClassifica(pilotaId, ordineStazione) {
    const tempiPilota = snapshot.tempi
      .filter((t) => t.pilotaId === pilotaId)
      .sort((a, b) => a.ordineStazione - b.ordineStazione);

    if (tempiPilota.length === 0) return null;

    const start = tempiPilota.find((t) => t.ordineStazione === 1);
    if (!start) return null;

    const startTimestamp = new Date(start.timestamp).getTime();

    const tempoRichiesto = tempiPilota.find(
      (t) => t.ordineStazione === ordineStazione,
    );

    const ultimoRegistrato = tempiPilota.at(-1);
    const ultimoTimestamp = new Date(ultimoRegistrato.timestamp).getTime();

    const haFinito = tempiPilota.some(
      (t) => t.ordineStazione === ordineUltimaStazione,
    );

    if (ordineStazione === 1) return 0;

    if (tempoRichiesto) {
      const ts = new Date(tempoRichiesto.timestamp).getTime();
      return ts - startTimestamp;
    }

    if (haFinito) {
      return ultimoTimestamp - startTimestamp;
    }

    return now - startTimestamp;
  }

  return (
    <div className="surface">
      <h3>
        Classifica Live – {snapshot.gara.nome} – {snapshot.giornata?.data}
      </h3>

      <table className="table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>#</th>
            <th>Nome</th>
            {stazioni.map((s) => (
              <th key={s.id}>
                {s.tipo === "INTERMEDIA" ? `INT ${s.ordine - 1}` : s.tipo}
              </th>
            ))}
            <th>Totale</th>
          </tr>
        </thead>

        <tbody>
          {snapshot.classifica.map((r, index) => {
            const totale = getLiveTempoClassifica(
              r.pilotaId,
              ordineUltimaStazione,
            );

            return (
              <tr key={r.numeroGara}>
                <td>{index + 1}</td>
                <td>#{r.numeroGara}</td>
                <td>{r.nomePilota}</td>

                {stazioni.map((s) => {
                  const tempo = getLiveTempoClassifica(r.pilotaId, s.ordine);

                  return (
                    <td key={s.id}>
                      {tempo !== null ? <TimeDisplay ms={tempo} /> : "-"}
                    </td>
                  );
                })}

                <td>{totale !== null ? <TimeDisplay ms={totale} /> : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ClassificaLive;
