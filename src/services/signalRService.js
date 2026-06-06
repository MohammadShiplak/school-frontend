import * as signalR from "@microsoft/signalr";

let connection = null;

export const startConnection = async (token, onNotification) => {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    return;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(import.meta.env.VITE_HUB_URL, {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Error)
    .build();

  connection.on("ReceiveNotification", (notification) => {
    onNotification(notification);
  });

  connection.onclose((error) => {
    console.warn("SignalR connection closed:", error);
  });

  connection.onreconnecting((error) => {
    console.warn("SignalR connection lost. Attempting to reconnect...", error);
  });

  connection.onreconnected((connectionId) => {
    console.log("SignalR reconnected. ConnectionId:", connectionId);
  });

  try {
    await connection.start();
    console.log("SignalR connected");
  } catch (error) {
    console.error("SignalR connection error:", error);
  }
};

export const stopConnection = async () => {
  if (connection) {
    await connection.stop();
    connection = null;
    console.log("SignalR disconnected");
  }
};
