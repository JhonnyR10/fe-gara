import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let client = null;

export function connectWebSocket(onConnect) {
  client = new Client({
    webSocketFactory: () => new SockJS("http://localhost:3001/ws"),
    reconnectDelay: 5000,
    debug: () => {},
  });

  client.onConnect = () => {
    onConnect(client);
  };

  client.activate();
}

export function disconnectWebSocket() {
  if (client) {
    client.deactivate();
    client = null;
  }
}
