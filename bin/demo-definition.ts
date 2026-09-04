// Offline starter definition. `w3booster-settings init YOUR_CLIENT_ID` replaces this file.
import { defineApplication } from '@w3booster/sdk/app';
export const w3boosterApp = defineApplication({
  clientId: 'unregistered_demo', revision: 'demo',
  scopes: ['match:read', 'players:read', 'resources:read', 'heroes:read', 'overlay:read'] as const,
  settingsDefaults: { display: { title: 'My first W3Booster app' } }
});
