# @ably-labs/react-hooks

> [!IMPORTANT]  
> The release candidate of our 3.0 react hooks library is currently available as a module of ably-js, which includes major improvements such as using a context provider and providing APIs to react to connection errors and channel errors. Please see the [new react hooks README](https://github.com/ably/ably-js/blob/main/docs/react.md#L1) for installation instructions and usage examples.

Use Ably in your React application using idiomatic, easy to use, React Hooks!

Using this package you can:

- Interact with Ably channels using a react hook.
- Send messages via Ably using the channel instances the hooks provide
- Get notifications of user presence on channels
- Send presence updates

The hooks provide a simplified syntax for interacting with Ably, and manage the lifecycle of the Ably SDK instances for you taking care to subscribe and unsubscribe to channels and events when your react components re-render.

---

<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=6 orderedList=false} -->
<!-- code_chunk_output -->

- [Installation](#installation)
  - [Compatible React Versions](#compatible-react-versions)
  - [Ably channels and API keys](#ably-channels-and-api-keys)
- [Usage](#usage)
  - [useChannel](#usechannel)
  - [usePresence](#usepresence)
- [Contributing](./CONTRIBUTING.md)

<!-- /code_chunk_output -->
---

## Installation

The hooks ship as an ES6 module, so you can use the `import` syntax in your react code.

```bash
npm install --save @ably-labs/react-hooks
```

This works out of the box using `create-react-app` - and you can use the package immediately.

### Compatible React Versions

The latest version of this package tracks the latest version of react.

| React Version | @ably-labs/react-hooks Version |
|----------|--------------------------------|
| >=17.0.2 | 1.1.8                          |
| >=18.1.0 | 2.x.x                          |
| >=16.8.0 | 3.x.x (current)                |

### Ably channels and API keys

In order to use these hooks, you will need an Ably API key. If you are not already signed up, you can [sign up now for a free Ably account](https://www.ably.io/signup). Once you have an Ably account:

1. Log into your app dashboard.
2. Under **“Your apps”**, click on **“Manage app”** for any app you wish to use for this tutorial, or create a new one with the “Create New App” button.
3. Click on the **“API Keys”** tab.
4. Copy the secret **“API Key”** value from your Root key, we will use this later when we build our app.

It is strongly recommended that you use [Token Authentication](https://www.ably.io/documentation/rest/authentication/#token-authentication), this will require server side code that is outside of the scope of this readme. In the examples below we use an API key directly in the markup, this is for ***local development only** and **should not be used for production code** and **should not** be committed to your repositories.

---

## Usage

Once you've added the package using `npm` to your project, you can use the hooks in your `react` code.

Start by connecting your app to Ably using the `AblyProvider` component. The options provided to the `AblyProvider` are the same options used for the Ably SDK - and requires either a `string` or an `AblyClientOptions`. You can use this configuration object to setup your API keys, or tokenAuthentication as you normally would. If you want to use the `usePresence` hook, you'll need to explicitly provide a `clientId`.

The `AblyProvider` should be high in your component tree, wrapping every component which needs to access Ably.


```jsx
import { AblyProvider } from "@ably-labs/react-hooks";

const options = {
  key: "your-ably-api-key",
  clientId: "me",
}

root.render(
  <AblyProvider options={options}>
    <App />
  </AblyProvider>
)
```

You may also create your own client and pass it into the context provider.

The `Realtime` constructor provided by the library matches the method signature of the Ably SDK with promises - and requires either a `string` or an `AblyClientOptions`. You can use this configuration object to setup your API keys, or tokenAuthentication as you normally would. If you want to use the `usePresence` hook, you'll need to explicitly provide a `clientId`.

```jsx
import { Realtime } from "@ably-labs/react-hooks";

const client = new Realtime({ key: "your-ably-api-key", clientId: 'me' });

root.render(
  <AblyProvider client={client}>
    <App />
  </AblyProvider>
)
```

Once you've done this, you can use the `hooks` in your code. The simplest example is as follows:

```javascript
const { channel } = useChannel("your-channel-name", (message) => {
    console.log(message);
});
```

Every time a message is sent to `your-channel-name` it'll be logged to the console. You can do whatever you need to with those messages.

Our react hooks are designed to run on the client-side, so if you are using server-side rendering, make sure that your components which use Ably react hooks are only rendered on the client side.

---

### useChannel

The useChannel hook lets you subscribe to a channel and receive messages from it.

```javascript
const { channel, ably } = useChannel("your-channel-name", (message) => {
    console.log(message);
});
```

**Both the channel instance, and the Ably JavaScript SDK instance are returned from the useChannel call.**

`useChannel` really shines when combined with a regular react `useState` hook - for example, you could keep a list of messages in your app state, and use the `useChannel` hook to subscribe to a channel, and update the state when new messages arrive.

```javascript
const [messages, updateMessages] = useState([]);
const { channel } = useChannel("your-channel-name", (message) => {
    updateMessages((prev) => [...prev, message]);
});

// Convert the messages to list items to render in a react component
const messagePreviews = messages.map((msg, index) => <li key={index}>{msg.data.someProperty}</li>);
```

`useChannel` supports all of the parameter combinations of a regular call to `channel.subscribe`, so you can filter the messages you subscribe to by providing a `message type` to the `useChannel` function:

```javascript
const { channel } = useChannel("your-channel-name", "test-message", (message) => {
    console.log(message); // Only logs messages sent using the `test-message` message type
});
```

The `channel` instance returned by `useChannel` can be used to send messages to the channel. It's just a regular Ably JavaScript SDK `channel` instance.

```javascript
channel.publish("test-message", { text: "message text" });
```

Because we're returning the channel instance, and Ably SDK instance from our `useChannel` hook, you can subsequently use these to perform any operations you like on the channel.

For example, you could retrieve history like this:

```javascript
const { channel } = useChannel("your-channel-name", (message) => {
    console.log(message);
});

const history = channel.history((err, result) => {
    var lastMessage = resultPage.items[0];
    console.log('Last message: ' + lastMessage.id + ' - ' + lastMessage.data);
});
```

It's also worth highlighting that the `useChannel` hook supports all of the additional parameters that the regular Ably SDK does as we're simply passing the call along.
This means you can use features like `rewind`:

```javascript
const { channel } = useChannel("[?rewind=100]your-channel-name", (message) => {
    // This call will rewind 100 messages
    console.log(message);
});
```

We support providing [ChannelOptions](https://ably.com/docs/api/realtime-sdk/types#channel-options) to the `useChannel` hook:

```javascript
const { channel } = useChannel({ channelName: "your-channel-name", options: { ... } }, (message) => {
    ...
});
```

---

### usePresence

The usePresence hook lets you subscribe to presence events on a channel - this will allow you to get notified when a user joins or leaves the channel.

**Please note** that fetching present members is executed as an effect, so it'll load in *after* your component renders for the first time.

```javascript
const { presenceData, updateStatus } = usePresence("your-channel-name");

// Convert presence data to list items to render    
const peers = presenceData.map((msg, index) => <li key={index}>{msg.clientId}: {msg.data}</li>);
```

`usePresence` returns an array of presence messages - again each message is a regular Ably JavaScript SDK `presenceMessage` instance.

You can optionally provide a string when you `usePresence` to set an initial `presence data` string.

```javascript
const { presenceData, updateStatus } = usePresence("your-channel-name", "initial state");

// The `updateStatus` function can be used to update the presence data for the current client
updateStatus("new status");
```

The new state will be sent to the channel, and any other clients subscribed to the channel will be notified of the change immediately.

If you don't want to use the `presenceData` returned from usePresence, you can configure a callback

```javascript
const { updateStatus } = usePresence("your-channel-name", "initial state", (presenceUpdate) => {
    console.log(presenceUpdate);
});
```

usePresence supports objects, as well as strings

```javascript
usePresence("your-channel-name", { foo: "bar" });
```

and if you're using `TypeScript` there are type hints to make sure that updates are of the same `type` as your initial constraint, or a provided generic type parameter:

```tsx
const TypedUsePresenceComponent = () => {
    // In this example MyPresenceType will be checked - if omitted, the shape of the initial 
    // value will be used ...and if that's omitted, `any` will be the default.

    const { val } = usePresence<MyPresenceType>("testChannelName", { foo: "bar" });

    return (
        <div role='presence'>
            {JSON.stringify(val)}
        </div>
    );
}

interface MyPresenceType {
    foo: string;
}
```

`PresenceData` is a good way to store synchronised, per-client metadata, so types here are especially valuable.

### useConnectionStateListener

The `useConnectionStateListener` hook lets you attach a listener to be notified of [connection state changes](https://ably.com/docs/connect/states?lang=javascript). This can be useful for detecting when the client has lost connection.

```javascript
useConnectionStateListener((stateChange) => {
  console.log(stateChange.current) // the new connection state
  console.log(stateChange.previous) // the previous connection state
  console.log(stateChange.reason) // if applicable, an error indicating the reason for the connection state change
})
```

You can also pass in a filter to only listen to a set of connection states:

```javascript
useConnectionStateListener('failed', listener); // the listener only gets called when the connection state becomes failed
useConnectionStateListener(['failed', 'suspended'], listener); // the listener only gets called when the connection state becomes failed or suspended
```

### useChannelStateListener

The `useChannelStateListener` hook lets you attach a listener to be notified of [channel state changes](https://ably.com/docs/channels?lang=javascript#states). This can be useful for detecting when a channel error has occured.

```javascript
useChannelStateListener((stateChange) => {
  console.log(stateChange.current) // the new channel state
  console.log(stateChange.previous) // the previous channel state
  console.log(stateChange.reason) // if applicable, an error indicating the reason for the channel state change
})
```

You can also pass in a filter to only listen to a set of channel states:

```javascript
useChannelStateListener('failed', listener); // the listener only gets called when the channel state becomes failed
useChannelStateListener(['failed', 'suspended'], listener); // the listener only gets called when the channel state becomes failed or suspended
```

### useAbly

The useAbly hook lets you access the Ably client used by the AblyProvider context. This can be useful if you need to access ably-js APIs which aren't available through our react-hooks library.

```javascript
const client = useAbly();

client.authorize();
```

### Error Handling

When using the Ably react hooks, your Ably client may encounter a variety of errors, for example if it doesn't have permissions to attach to a channel it may encounter a channel error, or if it loses connection from the Ably network it may encounter a connection error.

To allow you to handle these errors, the `useChannel` and `usePresence` hooks return connection and channel errors so that you can react to them in your components: 

```jsx
const { connectionError, channelError } = useChannel('my_channel', messageHandler);

if (connectionError) {
  // TODO: handle connection errors
} else if (channelError) {
  // TODO: handle channel errors
} else {
  return <AblyChannelComponent />
}
```

Alternatively, you can also pass callbacks to the hooks to be called when the client encounters an error:

```js
useChannel({
  channelName: 'my_channel',
  onConnectionError: (err) => { /* handle connection error */ },
  onChannelError: (err) => { /* handle channel error */ },
}, messageHandler);
```

### Usage with multiple clients

If you need to use multiple Ably clients on the same page, the easiest way to do so is to keep your clients in separate `AblyProvider` components. However, if you need to nest `AblyProvider`s, you can pass a string id for each client as a prop to the provider.

```jsx
root.render(
  <AblyProvider options={options} id={'providerOne'}>
    <AblyProvider options={options} id={'providerTwo'}>
      <App />
    </AblyProvider>
  </AblyProvider>
)
```

This id can then be passed in to each hook to specify which client to use.

```javascript
const ablyContextId = 'providerOne';

const client = useAbly(ablyContextId);

useChannel({ channelName: "your-channel-name", id: ablyContextId }, (message) => {
    console.log(message);
});

usePresence({ channelName: "your-channel-name", id: ablyContextId }, (presenceUpdate) => {
    ...
})
```
