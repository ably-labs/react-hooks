## Contributing

This repository is configured to execute using Vite - which will load a sample web app that acts as a simple test harness for the hooks.

You can run the dev server from the terminal using:

```bash
npm run start
```

You'll need to provide an API key for the sample to work (or you'll just get a white page and some errors in the console). To do this, create the file `./src/.env` and add the following line:

```.env
VITE_ABLY_API_KEY=<your-api-key>
```

This API key will be loaded by the vite dev server at build time.

You can run the `unit tests` by running `npm run test` in the terminal.

You can build the published artefacts by running `npm run ci` in the terminal. The node module is distrubted as an ES6 module, and requires consumers to be able to import modules in their react apps. The test application and unit tests are excluded from the generated `dist` folder to prevent confusion at runtime.

### Release process

- Release happens on push to `main` from the [`npm-publish`](./.github/workflows/npm-publish.yml) workflow.
- If more than one feature branch is needed, use an integration branch to avoid pushing to `main` during development.
- Be sure to update the version in [`package.json`](./package.json), [`package-lock.json`](./package-lock.json), and [`AblyReactHooks.ts`](./src/AblyReactHooks.ts) before merging to `main`
