# W3Booster app examples

**Pick a project, open its repository, and run that app.** This repository is a directory—not a bundled starter or a multi-app project.

## Choose your starting point

| Project | What to build | Public source | Try it |
| --- | --- | --- | --- |
| Minimal starter | Your first TypeScript dashboard; no official identity | [app-starter](https://github.com/W3Booster/app-starter) | [Demo](https://w3booster.github.io/app-starter/) |
| Match Dashboard | Match lifecycle, players, clock, compact windows | [app-example-match-dashboard](https://github.com/W3Booster/app-example-match-dashboard) | [Demo](https://w3booster.github.io/app-example-match-dashboard/) |
| Resource Monitor | Resources, supply, heroes, unavailable data | [app-example-resource-monitor](https://github.com/W3Booster/app-example-resource-monitor) | [Demo](https://w3booster.github.io/app-example-resource-monitor/) |
| Settings Playground | Typed settings, preview, acknowledged host writes | [app-example-settings-playground](https://github.com/W3Booster/app-example-settings-playground) | [Demo](https://w3booster.github.io/app-example-settings-playground/) |
| Clean Overlay | Transparent stream/in-game graphics | [app-example-clean-overlay](https://github.com/W3Booster/app-example-clean-overlay) | [Demo](https://w3booster.github.io/app-example-clean-overlay/) |
| Match Vision · Full reference app · Angular · MIT | A complete production starting point: dashboard, history, settings and overlays | [app-match-vision](https://github.com/W3Booster/app-match-vision) | [Run and fork guide](https://github.com/W3Booster/app-match-vision/blob/main/docs/START_FROM_MATCH_VISION.md) |

All source is public and MIT licensed. Demo mode uses synthetic data and needs no account or Warcraft III. Each focused example has one entry point, its own README, tests, screenshot, and deployment.

## Create an app now

Use Node.js 22.22.3 or newer:

```sh
npx --yes --package=github:W3Booster/app-starter w3booster-create my-app
cd my-app
npm ci
npm run dev
```

Open **http://localhost:5173/**. Edit `src/render.ts` for the interface and the heading in `src/main.ts`. [Follow the full first-app tutorial](https://website.w3booster.com/developer/first-app/).

Cloning an official example does not give you its identity or privileges. Each example and Match Vision includes `npm run app:fork -- YOUR_NEW_CLIENT_ID` for explicitly binding your own registration. See its README.

## In W3Booster

Enable Developer Mode and open **Apps → Examples**. Match Vision appears alongside the focused examples, distinguished with a **Full reference app · Angular · MIT** label. It is the same app as in the library, with one installation and shared settings and ratings—not a duplicated example registration.

[Developer documentation](https://website.w3booster.com/developer/) · [Working examples](https://website.w3booster.com/developer/examples/) · [Build from Match Vision](https://website.w3booster.com/developer/match-vision/)

## Existing links

The former combined app is preserved at [legacy-bundle-v1](https://github.com/W3Booster/app-examples/tree/legacy-bundle-v1). Old hosted `?app=…` and `?view=…` links forward to the corresponding independent project, preserving routing and authorization fragments without logging them. Legacy images remain available for existing links. The old generator command delegates to `app-starter`; use the command above for new instructions.

Maintainers: `npm ci && npm run check && npm run build` tests compatibility routing and builds this static directory. Each linked project owns its own build and Pages workflow. Database registration and repeatable catalog reapply remain in the private platform deployment package; no credentials belong here.
