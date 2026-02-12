// import SockJS from "sockjs-client";
// import { Client } from "@stomp/stompjs";

// let client = null;

// export function connectWebSocket(onConnect) {
//   client = new Client({
//     webSocketFactory: () => new SockJS("http://localhost:3001/ws"),
//     reconnectDelay: 5000,
//     debug: () => {},
//   });

//   client.onConnect = () => {
//     onConnect(client);
//   };

//   client.activate();
// }

// export function disconnectWebSocket() {
//   if (client) {
//     client.deactivate();
//     client = null;
//   }
// }
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let client = null;

export function connectWebSocket(onConnect) {
  const API = import.meta.env.VITE_API_URL;

  client = new Client({
    webSocketFactory: () => new SockJS(`${API}/ws`),
    reconnectDelay: 5000,
    debug: () => {},
  });

  client.onConnect = () => {
    console.log("WebSocket connected");
    onConnect(client);
  };

  client.onStompError = (frame) => {
    console.error("Broker error:", frame);
  };

  client.activate();
}

export function disconnectWebSocket() {
  if (client) {
    client.deactivate();
    client = null;
  }
}
