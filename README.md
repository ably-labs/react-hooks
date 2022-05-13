# ably-react-hooks

Use Ably in your React application using idiomatic, easy to use, React Hooks!

Using this package you can:

- Interact with Ably channels using a react hook.
- Send messages via Ably using the channel instances the hooks provide
- Get notifications of user presence on channels
- Send presence updates

The hooks provide a simplified syntax for interacting with Ably, and manage the lifecycle of the Ably SDK instances for you taking care to subscribe and unsubscribe to channels and events when your react componenets re-render.

# Installation

The hooks ship as an ES6 module, so you can use the `import` syntax in your react code.

```bash
npm install --save @ably-labs/react-hooks
```

This works out of the box using `create-react-app` - and you can use the package immediately.

# Ably channels and API keys

In order to use these hooks, you will need an Ably API key. If you are not already signed up, you can [sign up now for a free Ably account](https://www.ably.io/signup). Once you have an Ably account:

1. Log into your app dashboard.
2. Under **“Your apps”**, click on **“Manage app”** for any app you wish to use for this tutorial, or create a new one with the “Create New App” button.
3. Click on the **“API Keys”** tab.
4. Copy the secret **“API Key”** value from your Root key, we will use this later when we build our app.

It is strongly recommended that you use [Token Authentication](https://www.ably.io/documentation/rest/authentication/#token-authentication), this will require server side code that is outside of the scope of this readme. In the examples below we use an API key directly in the markup, this is for ***local development only** and **should not be used for production code** and **should not** be committed to your repositories.

# Usage

Once you've added the package using `npm` to your project, you can use the hooks in your `react` code.

Start by adding a reference to the hooks

```javascript
import { configureAbly, useChannel } from "@ably-labs/react-hooks";
```

Then you need to use the `configureAbly` function to create an instance of the `Ably` JavaScript SDK.

```javascript
configureAbly({ key: "your-ably-api-key", clientId: generateRandomId() });
```

`configureAbly` matches the method signature of the Ably SDK - and requires either a `string` or an `AblyClientOptions`. You can use this configuration object to setup your API keys, or tokenAuthentication as you normally would. If you want to use the `usePresence` hook, you'll need to explicitly provide a `clientId`.

Once you've done this, you can use the `hooks` in your code. The simplest example is as follows:

```javascript
const [channel] = useChannel("your-channel-name", (message) => {
    console.log(message);
});
```

Every time a message is sent to `your-channel-name` it'll be logged to the console. You can do whatever you need to with those messages.

## useChannel

The useChannel hook lets you subscribe to a channel and receive messages from it.

```javascript    
const [channel, ably] = useChannel("your-channel-name", (message) => {
    console.log(message);
});
```

**Both the channel instance, and the Ably JavaScript SDK instance are returned from the useChannel call.**

`useChannel` really shines when combined with a regular react `useState` hook - for example, you could keep a list of messages in your app state, and use the `useChannel` hook to subscribe to a channel, and update the state when new messages arrive.

```javascript
const [messages, updateMessages] = useState([]);
const [channel] = useChannel("your-channel-name", (message) => {
    updateMessages((prev) => [...prev, message]);
});

// Convert the messages to list items to render in a react component
const messagePreviews = messages.map((msg, index) => <li key={index}>{msg.data.someProperty}</li>);
```

`useChannel` supports all of the parameter combinations of a regular call to `channel.subscribe`, so you can filter the messages you subscribe to by providing a `message type` to the `useChannel` function:

```javascript
const [channel] = useChannel("your-channel-name", "test-message", (message) => {
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
const [channel] = useChannel("your-channel-name", (message) => {
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
const [channel] = useChannel("[?rewind=100]your-channel-name", (message) => {
    // This call will rewind 100 messages
    console.log(message);
});
```

## usePresence

The usePresence hook lets you subscribe to presence events on a channel - this will allow you to get notified when a user joins or leaves the channel.

```javascript
const [presenceData, updateStatus] = usePresence("your-channel-name");

// Convert presence data to list items to render    
const peers = presenceData.map((msg, index) => <li key={index}>{msg.clientId}: {msg.data}</li>);
```

`usePresence` returns an array of presence messages - again each message is a regular Ably JavaScript SDK `presenceMessage` instance.

You can optionally provide a string when you `usePresence` to set an initial `presence data` string.

```javascript
const [presenceData, updateStatus] = usePresence("your-channel-name", "initial state");
```

The `updateStatus` function can be used to update the presence data for the current client:

```javascript
updateStatus("new status");
```

The new state will be sent to the channel, and any other clients subscribed to the channel will be notified of the change immediately.
