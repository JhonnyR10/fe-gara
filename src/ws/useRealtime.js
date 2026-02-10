import { useEffect } from "react";
import { connectWebSocket, disconnectWebSocket } from "./websocket";

export function useRealtime({
  onSnapshot,
  onClassificaGiornata,
  onClassificaTotale,
}) {
  useEffect(() => {
    connectWebSocket((client) => {
      if (onSnapshot) {
        client.subscribe("/topic/snapshot", (msg) => {
          onSnapshot(JSON.parse(msg.body));
        });
      }

      if (onClassificaGiornata) {
        client.subscribe("/topic/classifica/giornata", (msg) => {
          onClassificaGiornata(JSON.parse(msg.body));
        });
      }

      if (onClassificaTotale) {
        client.subscribe("/topic/classifica/totale", (msg) => {
          onClassificaTotale(JSON.parse(msg.body));
        });
      }
    });

    return () => disconnectWebSocket();
  }, []);
}
