import React, { useState } from "react";
import { configureAbly, useChannel, usePresence } from "/src/index.js";
import "./App.css";

configureAbly({ key: "YOUR_ABLY_API_KEY", clientId: generateRandomId() });

function App() {
  const [messages, updateMessages] = useState([]);
  const [channel, ably] = useChannel("your-channel-name", (message) => {
    updateMessages((prev) => [...prev, message]);
  });

  const [presenceData, updateStatus] = usePresence("your-channel-name");

  const messagePreviews = messages.map((msg, index) => <li key={index}>{msg.data.text}</li>);
  const presentClients = presenceData.map((msg, index) => (
    <li key={index}>
      {msg.clientId}: {msg.data}
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
            updateStatus("hello");
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
