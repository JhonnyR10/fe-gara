import TimeDisplay from "./TimeDisplay";

function ResultsTable({ results, currentUserId }) {
  return (
    <div className="surface results-surface">
      <div className="results-body">
        {results.length === 0 ? (
          <div className="empty empty-fill">In attesa dei primi tempi</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th className="align-center">Tempo</th>
                <th className="align-center">Distacco</th>
              </tr>
            </thead>

            <tbody>
              {results.map((row, index) => (
                <tr
                  key={row.id}
                  className={row.id === currentUserId ? "highlight" : ""}
                >
                  <td className="pos">{index + 1}</td>
                  <td className="align-center name">{row.name}</td>
                  <td className="align-center">
                    <TimeDisplay ms={row.time} />
                  </td>
                  <td className="align-center diff">
                    <TimeDisplay ms={row.diff} muted />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ResultsTable;
