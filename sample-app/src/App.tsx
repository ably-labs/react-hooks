import { Types } from "ably";
import React, { useState } from "react";
import { configureAbly, useChannel, usePresence } from "../../src/index";
import "./App.css";

configureAbly({ key: import.meta.env.VITE_ABLY_API_KEY, clientId: generateRandomId() });

function App() {
  const [messages, updateMessages] = useState<Types.Message[]>([]);
  const [channel, ably] = useChannel("your-channel-name", (message) => {
    updateMessages((prev) => [...prev, message]);
  });

  const [presenceData, updateStatus] = usePresence("your-channel-name", { foo: "bar" }, (update) => {
    console.log(update);
  });

  const messagePreviews = messages.map((msg, index) => <li key={index}>{msg.data.text}</li>);
  const presentClients = presenceData.map((msg, index) => (
    <li key={index}>
      {msg.clientId}: {JSON.stringify(msg.data)}
    </li>
  ));

  return (
    <div className="App">
      <header className="App-header">Ably React Hooks Demo</header>
      <div>
        <button
          onClick={() => {
            channel.publish("test-message", { text: "message text" });
          }}
        >
          Send Message
        </button>
        <button
          onClick={() => {
            updateStatus({ foo: "baz" });
          }}
        >
          Update status to hello
        </button>
      </div>

      <h2>Messages</h2>
      <ul>{messagePreviews}</ul>

      <h2>Present Clients</h2>
      <ul>{presentClients}</ul>
    </div>
  );
}

function generateRandomId() {
  return Math.random().toString(36).substr(2, 9);
}

export default App;
