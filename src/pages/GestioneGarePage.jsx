import { useEffect, useState } from "react";
import PageLayout from "../ui/PageLayout";
import ResultsTable from "../ui/ResultsTable";
import { useRealtime } from "../ws/useRealtime";
import { fetchGare, creaGara, apriGara } from "../api/gare";
import {
  fetchPilotiByGara,
  creaPilota,
  updatePilota,
  deletePilota,
} from "../api/piloti";
import { fetchClassificaTotale } from "../api/classifiche";
import ClassificaLive from "../components/ClassificaLive";

const GestioneGarePage = () => {
  const [gare, setGare] = useState([]);
  const [garaSelezionata, setGaraSelezionata] = useState(null);
  const [piloti, setPiloti] = useState([]);
  const [classifica, setClassifica] = useState([]);
  const [editingPilota, setEditingPilota] = useState(null);
  const [formGara, setFormGara] = useState({
    nome: "",
    dataInizio: "",
    dataFine: "",
    numeroStazioni: 3,
  });
  const [formPilota, setFormPilota] = useState({
    numeroGara: "",
    nomePilota: "",
    nomeCopilota: "",
    team: "",
  });
  const [snapshot, setSnapshot] = useState(null);
  const [classificaGiornata, setClassificaGiornata] = useState([]);
  const [garaLiveAttiva, setGaraLiveAttiva] = useState(true);
  const [errorsGara, setErrorsGara] = useState({});
  const [errorsPilota, setErrorsPilota] = useState({});
  const [toast, setToast] = useState(null);
  const [pageGare, setPageGare] = useState(1);
  const [pagePiloti, setPagePiloti] = useState(1);
  const itemsPerPage = 12;
  const itemsPerPagePiloti = 8;

  useRealtime({
    onSnapshot: setSnapshot,
    onClassificaGiornata: setClassificaGiornata,
    onClassificaTotale: async (data) => {
      setClassifica(data);
      setGaraLiveAttiva(false);

      const updatedGare = await fetchGare();
      setGare(updatedGare);

      const conclusa = updatedGare.find((g) => g.id === snapshot?.gara?.id);
      if (conclusa) {
        setGaraSelezionata(conclusa);

        const index = updatedGare.findIndex((g) => g.id === conclusa.id);
        const page = Math.floor(index / itemsPerPage) + 1;
        setPageGare(page);
      }
    },
  });

  useEffect(() => {
    fetchGare().then(setGare);
  }, []);

  const totalPagesGare = Math.ceil(gare.length / itemsPerPage);

  const garePaginare = gare.slice(
    (pageGare - 1) * itemsPerPage,
    pageGare * itemsPerPage,
  );

  const totalPagesPiloti = Math.ceil(piloti.length / itemsPerPagePiloti);

  const pilotiPaginati = piloti.slice(
    (pagePiloti - 1) * itemsPerPagePiloti,
    pagePiloti * itemsPerPage,
  );

  const handleSelectGara = (gara) => {
    setGaraSelezionata(gara);
  };

  useEffect(() => {
    if (!garaSelezionata) return;

    const loadDetails = async () => {
      const pilotiData = await fetchPilotiByGara(garaSelezionata.id);
      setPiloti(pilotiData);

      const classificaData = await fetchClassificaTotale(garaSelezionata.id);
      setClassifica(classificaData);
    };

    loadDetails();
  }, [garaSelezionata]);

  const handleCreaGara = async () => {
    if (!validateGara()) return;
    const nuovaGara = await creaGara(formGara);

    const updatedGare = await fetchGare();
    setGare(updatedGare);

    setGaraSelezionata(nuovaGara);

    setFormGara({
      nome: "",
      dataInizio: "",
      dataFine: "",
      numeroStazioni: 3,
    });
    setErrorsGara({});
    showToast("Gara creata con successo");
    setPageGare(1);
  };

  const handleSavePilota = async () => {
    if (!garaSelezionata) return;
    if (!validatePilota()) return;

    if (editingPilota) {
      await updatePilota(editingPilota.id, formPilota);
    } else {
      await creaPilota({
        ...formPilota,
        garaId: garaSelezionata.id,
      });
    }

    const updated = await fetchPilotiByGara(garaSelezionata.id);
    setPiloti(updated);
    setEditingPilota(null);
    setFormPilota({
      numeroGara: "",
      nomePilota: "",
      nomeCopilota: "",
      team: "",
    });
    setErrorsPilota({});
    showToast(editingPilota ? "Pilota modificato" : "Pilota aggiunto");
    setPagePiloti(1);
  };

  const handleDeletePilota = async (id) => {
    await deletePilota(id);
    const updated = await fetchPilotiByGara(garaSelezionata.id);
    setPiloti(updated);
    showToast("Pilota eliminato");
  };

  const handleApriGara = async () => {
    if (editingPilota) {
      showToast(
        "Salva o annulla la modifica al pilota prima di aprire la gara",
      );
      return;
    }
    await apriGara(garaSelezionata.id);

    const updatedGare = await fetchGare();
    setGare(updatedGare);

    const garaAggiornata = updatedGare.find((g) => g.id === garaSelezionata.id);

    setGaraSelezionata(garaAggiornata);
    setEditingPilota(null);
    setFormPilota({
      numeroGara: "",
      nomePilota: "",
      nomeCopilota: "",
      team: "",
    });
    showToast("Gara aperta con successo");
  };

  const validateGara = () => {
    const newErrors = {};

    if (!formGara.nome.trim()) {
      newErrors.nome = "Il nome è obbligatorio";
    }

    if (!formGara.dataInizio) {
      newErrors.dataInizio = "Data inizio obbligatoria";
    }

    if (!formGara.dataFine) {
      newErrors.dataFine = "Data fine obbligatoria";
    }

    if (
      formGara.dataInizio &&
      formGara.dataFine &&
      formGara.dataFine < formGara.dataInizio
    ) {
      newErrors.dataFine = "La data fine deve essere successiva";
    }

    if (formGara.numeroStazioni < 3) {
      newErrors.numeroStazioni = "Minimo 3 stazioni";
    }

    setErrorsGara(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePilota = () => {
    const newErrors = {};

    if (!formPilota.numeroGara.trim()) {
      newErrors.numeroGara = "Numero gara obbligatorio";
    }

    if (!formPilota.nomePilota.trim()) {
      newErrors.nomePilota = "Nome pilota obbligatorio";
    }

    if (!formPilota.nomeCopilota.trim()) {
      newErrors.nomeCopilota = "Nome copilota obbligatorio";
    }

    if (!formPilota.team.trim()) {
      newErrors.team = "Team obbligatorio";
    }
    const duplicato = piloti.find(
      (p) =>
        p.numeroGara === formPilota.numeroGara && p.id !== editingPilota?.id,
    );

    if (duplicato) {
      newErrors.numeroGara = "Numero gara già esistente";
    }

    setErrorsPilota(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };
  const isUltimaGiornata = snapshot?.ultimaGiornata ?? false;

  return (
    <PageLayout title="Gestione Gare" subtitle="Creazione e controllo gare">
      {/* CREAZIONE GARA */}
      <div className="surface" style={{ marginBottom: 24 }}>
        <h3>Crea Gara</h3>

        <div className="form-gara-row">
          <div className="form-field">
            <label>Nome Gara</label>
            <input
              className={`input ${errorsGara.nome ? "input-error" : ""}`}
              value={formGara.nome}
              onChange={(e) =>
                setFormGara({ ...formGara, nome: e.target.value })
              }
            />
            <div className="error-slot">
              {errorsGara.nome && (
                <span className="error-text">{errorsGara.nome}</span>
              )}
            </div>
          </div>

          <div className="form-field">
            <label>Data Inizio</label>
            <input
              type="date"
              className={`input ${errorsGara.dataInizio ? "input-error" : ""}`}
              value={formGara.dataInizio}
              onChange={(e) =>
                setFormGara({ ...formGara, dataInizio: e.target.value })
              }
            />
            <div className="error-slot">
              {errorsGara.dataInizio && (
                <span className="error-text">{errorsGara.dataInizio}</span>
              )}
            </div>
          </div>

          <div className="form-field">
            <label>Data Fine</label>
            <input
              type="date"
              className={`input ${errorsGara.dataFine ? "input-error" : ""}`}
              value={formGara.dataFine}
              onChange={(e) =>
                setFormGara({ ...formGara, dataFine: e.target.value })
              }
            />
            <div className="error-slot">
              {errorsGara.dataFine && (
                <span className="error-text">{errorsGara.dataFine}</span>
              )}
            </div>
          </div>

          <div className="form-field small">
            <label>N° Stazioni</label>
            <input
              type="number"
              min="3"
              className={`input ${errorsGara.numeroStazioni ? "input-error" : ""}`}
              value={formGara.numeroStazioni}
              onChange={(e) =>
                setFormGara({
                  ...formGara,
                  numeroStazioni: Number(e.target.value),
                })
              }
            />
            <div className="error-slot">
              {errorsGara.numeroStazioni && (
                <span className="error-text">{errorsGara.numeroStazioni}</span>
              )}
            </div>
          </div>

          <div className="form-button">
            <button className="button-primary" onClick={handleCreaGara}>
              CREA GARA
            </button>
          </div>
        </div>
      </div>

      {/* LISTA + GESTIONE */}
      <div className="desktop-split">
        {/* LISTA GARE */}
        <div className="surface">
          <h3>Gare</h3>
          <table className="table no-responsive">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Nome / Inizio-Fine</th>
                <th>Stato</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {garePaginare.map((g) => (
                <tr
                  key={g.id}
                  className={garaSelezionata?.id === g.id ? "highlight" : ""}
                >
                  <td>
                    <div className="gara-name">{g.nome}</div>
                    <div className="gara-date">
                      {new Date(g.dataInizio).toLocaleDateString()} -
                      {new Date(g.dataFine).toLocaleDateString()}
                    </div>
                  </td>

                  <td className="align-center">
                    <span
                      className={`badge ${
                        g.stato === "BOZZA"
                          ? "badge-bozza"
                          : g.stato === "ATTIVA"
                            ? "badge-attiva"
                            : "badge-conclusa"
                      }`}
                    >
                      {g.stato}
                    </span>
                  </td>

                  <td>
                    <button
                      className="button-secondary"
                      onClick={() => handleSelectGara(g)}
                    >
                      Seleziona
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPagesGare > 1 && (
            <div className="pagination">
              <button
                className="button-secondary"
                disabled={pageGare === 1}
                onClick={() => setPageGare(pageGare - 1)}
              >
                ←
              </button>

              <span>
                Pagina {pageGare} di {totalPagesGare}
              </span>

              <button
                className="button-secondary"
                disabled={pageGare === totalPagesGare}
                onClick={() => setPageGare(pageGare + 1)}
              >
                →
              </button>
            </div>
          )}
        </div>

        {/* GESTIONE GARA */}
        <div className="surface">
          {garaSelezionata && (
            <>
              <h3>
                {garaSelezionata.nome} -{" "}
                <span className="gara-date">
                  {new Date(garaSelezionata.dataInizio).toLocaleDateString()} -{" "}
                  {new Date(garaSelezionata.dataFine).toLocaleDateString()}
                </span>
              </h3>

              {garaSelezionata.stato === "BOZZA" && (
                <>
                  <h4>Piloti</h4>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th style={{ textAlign: "left" }}>Pilota</th>
                        <th style={{ textAlign: "left" }}>Team</th>
                        <th></th>
                        <th> </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pilotiPaginati.map((p) => (
                        <tr key={p.id}>
                          <td>{p.numeroGara}</td>
                          <td>{p.nomePilota}</td>
                          <td>{p.team}</td>
                          <td>
                            <button
                              className="button-secondary"
                              onClick={() => {
                                setEditingPilota(p);
                                setFormPilota(p);
                              }}
                            >
                              Modifica
                            </button>
                          </td>
                          <td>
                            <button
                              className="button-secondary"
                              onClick={() => handleDeletePilota(p.id)}
                            >
                              Elimina
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {totalPagesPiloti > 1 && (
                    <div className="pagination">
                      <button
                        className="button-secondary"
                        disabled={pagePiloti === 1}
                        onClick={() => setPagePiloti(pagePiloti - 1)}
                      >
                        ←
                      </button>

                      <span>
                        Pagina {pagePiloti} di {totalPagesPiloti}
                      </span>

                      <button
                        className="button-secondary"
                        disabled={pagePiloti === totalPagesPiloti}
                        onClick={() => setPagePiloti(pagePiloti + 1)}
                      >
                        →
                      </button>
                    </div>
                  )}
                  <div style={{ marginTop: 25 }}>
                    <h4>
                      {editingPilota ? "Modifica Pilota" : "Aggiungi Pilota"}
                    </h4>

                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        flexDirection: "column",
                        flexWrap: "wrap",
                      }}
                    >
                      <input
                        className={`input ${errorsPilota.numeroGara ? "input-error" : ""}`}
                        placeholder="Numero Gara"
                        value={formPilota.numeroGara}
                        onChange={(e) =>
                          setFormPilota({
                            ...formPilota,
                            numeroGara: e.target.value,
                          })
                        }
                      />
                      {errorsPilota.numeroGara && (
                        <div className="error-text">
                          {errorsPilota.numeroGara}
                        </div>
                      )}
                      <input
                        className={`input ${errorsPilota.nomePilota ? "input-error" : ""}`}
                        placeholder="Nome Pilota"
                        value={formPilota.nomePilota}
                        onChange={(e) =>
                          setFormPilota({
                            ...formPilota,
                            nomePilota: e.target.value,
                          })
                        }
                      />
                      {errorsPilota.nomePilota && (
                        <div className="error-text">
                          {errorsPilota.nomePilota}
                        </div>
                      )}
                      <input
                        className={`input ${errorsPilota.nomeCopilota ? "input-error" : ""}`}
                        placeholder="Nome Copilota"
                        value={formPilota.nomeCopilota}
                        onChange={(e) =>
                          setFormPilota({
                            ...formPilota,
                            nomeCopilota: e.target.value,
                          })
                        }
                      />
                      {errorsPilota.nomeCopilota && (
                        <div className="error-text">
                          {errorsPilota.nomeCopilota}
                        </div>
                      )}
                      <input
                        className={`input ${errorsPilota.team ? "input-error" : ""}`}
                        placeholder="Team"
                        value={formPilota.team}
                        onChange={(e) =>
                          setFormPilota({
                            ...formPilota,
                            team: e.target.value,
                          })
                        }
                      />
                      {errorsPilota.team && (
                        <div className="error-text">{errorsPilota.team}</div>
                      )}
                    </div>
                    <button
                      className="button-primary button-form"
                      onClick={handleSavePilota}
                    >
                      {editingPilota ? "SALVA MODIFICA" : "AGGIUNGI PILOTA"}
                    </button>
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <button
                      className="button-primary"
                      disabled={piloti.length === 0 || editingPilota !== null}
                      onClick={handleApriGara}
                    >
                      APRI GARA
                    </button>
                  </div>
                </>
              )}

              {garaSelezionata.stato === "ATTIVA" && (
                <>
                  <h4>Link Operativi</h4>

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button
                      className="button-primary"
                      onClick={() => window.open(`/start`)}
                    >
                      START
                    </button>

                    {Array.from({
                      length: garaSelezionata.numeroStazioni - 2,
                    }).map((_, i) => (
                      <button
                        key={i}
                        className="button-primary"
                        onClick={() => window.open(`/intermedia/${i + 2}`)}
                      >
                        INTERMEDIA {i + 1}
                      </button>
                    ))}

                    <button
                      className="button-primary"
                      onClick={() => window.open("/stop")}
                    >
                      STOP
                    </button>
                    <button
                      className="button-primary"
                      onClick={() => window.open("/classifica-pubblica")}
                    >
                      CLASSIFICA PUBBLICA
                    </button>
                  </div>
                </>
              )}
              {garaSelezionata.stato === "CONCLUSA" && (
                <>
                  <h4>Classifica Finale</h4>

                  <ResultsTable
                    results={classifica.map((r) => ({
                      id: r.pilotaId,
                      name: `#${r.numeroGara} – ${r.nomePilota}`,
                      time: r.tempoTotaleMillis,
                      diff: r.distaccoMillis ?? 0,
                    }))}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
      <ClassificaLive
        snapshot={snapshot}
        classificaGiornata={classificaGiornata}
        classificaGenerale={classifica}
        garaLiveAttiva={garaLiveAttiva}
        isUltimaGiornata={isUltimaGiornata}
      />
      {toast && <div className="toast">{toast}</div>}
    </PageLayout>
  );
};

export default GestioneGarePage;
