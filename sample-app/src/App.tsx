import { Types } from 'ably';
import React, { useState } from 'react';
import {
    AblyProvider,
    useChannel,
    usePresence,
    useConnectionStateListener,
    useChannelStateListener,
} from '../../src/index';
import './App.css';

function App() {
    const [messages, updateMessages] = useState<Types.Message[]>([]);
    const { channel, ably } = useChannel('your-channel-name', (message) => {
        updateMessages((prev) => [...prev, message]);
    });

    const { presenceData, updateStatus } = usePresence(
        'your-channel-name',
        { foo: 'bar' },
        (update) => {
            console.log(update);
        }
    );

    const [connectionState, setConnectionState] = useState(ably.connection.state);

    useConnectionStateListener((stateChange) => {
      setConnectionState(stateChange.current)
    });

    const [ablyErr, setAblyErr] = useState('');
    const [channelState, setChannelState] = useState(channel.state);
    const [previousChannelState, setPreviousChannelState] = useState<undefined | Types.ChannelState>();
    const [channelStateReason, setChannelStateReason] = useState<undefined | Types.ErrorInfo>();

    useChannelStateListener('your-channel-name', 'detached', (stateChange) => {
        setAblyErr(JSON.stringify(stateChange.reason));
        setChannelState(stateChange.current);
        setPreviousChannelState(stateChange.previous);
        setChannelStateReason(stateChange.reason ?? undefined);
    });

    const messagePreviews = messages.map((msg, index) => (
        <li key={index}>{msg.data.text}</li>
    ));
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
                        channel.publish('test-message', {
                            text: 'message text',
                        });
                    }}
                >
                    Send Message
                </button>
                <button
                    onClick={() => {
                        updateStatus({ foo: 'baz' });
                    }}
                >
                    Update status to hello
                </button>
            </div>

            <h2>Connection State</h2>
            <div>{connectionState}</div>

            <h2>Channel detach</h2>
            <button onClick={() => channel.detach()}>Detach</button>
            <button onClick={() => ably.close()}>Close</button>

            <h2>Channel State</h2>
            <h3>Current</h3>
            <div>{channelState}</div>
            <h3>Previous</h3>
            <div>{previousChannelState}</div>
            <h3>Reason</h3>
            <div>{JSON.stringify(channelStateReason)}</div>

            <h2>Ably error</h2>
            <h3>Reason</h3>
            <div>{ablyErr}</div>

            <h2>Messages</h2>
            <ul>{messagePreviews}</ul>

            <h2>Present Clients</h2>
            <ul>{presentClients}</ul>
        </div>
    );
}

export default App;
