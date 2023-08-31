# Upgrade / Migration Guide

## Version 2.x to 3.x

### Replacing `configureAbly` with `AblyProvider` 

In versions 1 and 2 of our react-hooks, we exported a function called `configureAbly` which was used to register an Ably client instance to global state.
This caused a few issues (most notably it made the hooks difficult to use with hot module reloading), so we have replaced the global configuration function with a context provider (`AblyProvider`)
The simplest way to use the context provider is to create your own ably-js client outside and then pass it as a prop to the `AblyProvider`.
All child components of the `AblyProvider` will then be able to use the hooks, making use of the provided Ably client instance. For this reason, we recommend putting the `AblyProvider` high up in your component tree, surrounding all components which may need to use Ably hooks.

For example, replace this:
```jsx
configureAbly(options);
```

With this:
```jsx
const client = new Ably.Realtime.Promise(options);

return <AblyProvider client={ably}>
  {children}
</AblyProvider>
```

You may also provide the client options directly to the `AblyProvider` so that the client is created automatically. If you use this prop the client will be automatically closed when the `AblyProvider` is unmounted.

```jsx
return <AblyProvider options={options}>
  {children}
</AblyProvider>
```

If you were already using multiple Ably clients in the same react application, you may pass in an optional `id` prop to the provider, which you can then pass to the hooks to specify which Ably client instance the hook should use:
```jsx
const client = new Ably.Realtime.Promise(options);

return <AblyProvider client={ably} id="foo">
  {children}
</AblyProvider>

// in a child component:
useChannel({channelName: 'my_channel', id: 'foo'}, (msg) => {
  console.log(msg);
});
```

### ably is now a peer dependency

Previously, ably was listed as an explicit dependency of the react-hooks packages, but we've now changed it to a peerDependency to better reflect the relationship between the two packages.
In most cases you won't need to do anything, but if you are using an older version of NPM (below version 7) you may need to `npm install ably` in order to ensure that it is still installed in your project.
