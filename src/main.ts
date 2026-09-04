import './style.css';
import { canUseHostCapability, classifyW3BoosterError } from '@w3booster/sdk';
import { getApplication } from './application';
import { dashboard } from './examples/dashboard';
import { resources } from './examples/resources';
import { settings } from './examples/settings';
import { broadcast, studio } from './examples/overlay';
import { element } from './ui';

const query = new URLSearchParams(location.search);
const w3boosterApp = getApplication(query.get('app'));
document.body.dataset.application = w3boosterApp.clientId;
const view = query.get('view') || 'dashboard';
const appSlug = query.get('app');
const theme = appSlug === 'clean-overlay' || view === 'overlay' ? 'broadcast'
  : view === 'resources' ? 'economy' : view === 'settings' ? 'workbench' : 'arena';
const presentation = {
  arena: { brand: 'ARENA / MATCH DESK', title: 'Every match. At a glance.', description: 'Players, teams, and the clock. A focused live match dashboard.', source: 'dashboard.ts' },
  economy: { brand: 'LEDGER / RESOURCE MONITOR', title: 'Know your economy.', description: 'A clear view of resources, supply, and heroes. No guessed values. No invented history.', source: 'resources.ts' },
  workbench: { brand: 'PLAYGROUND / TYPED SETTINGS', title: 'Change it. Preview it. Save it.', description: 'Explore the path from a generated setting to an authenticated host action.', source: 'settings.ts' },
  broadcast: { brand: 'ON AIR / CLEAN OVERLAY', title: 'Less overlay. More game.', description: 'A compact match strip designed for your stream and in-game composition.', source: 'overlay.ts' }
}[theme];
document.body.dataset.theme = theme;
document.title = presentation.brand + ' · W3Booster Examples';
const demo = query.get('demo') === '1' || (w3boosterApp.clientId === 'unregistered_demo' && query.get('demo') !== '0');
const overlay = view === 'overlay';
document.body.classList.toggle('overlay', overlay);
document.documentElement.classList.toggle('overlay-root', overlay);
const root = document.querySelector<HTMLDivElement>('#app')!;
const shell = element('main', '', 'shell');
const header = element('header');
const brand = element('a', presentation.brand, 'brand'); brand.href = 'https://website.w3booster.com/developer/examples/'; header.append(brand);
const headerActions = element('div', '', 'header-actions');
const repository = element('a', 'Public repository ↗', 'repository-link'); repository.href = 'https://github.com/W3Booster/app-examples'; repository.target = '_blank'; repository.rel = 'noopener noreferrer';
const badge = element('span', demo ? 'DEMO DATA' : 'LIVE CONNECTION', 'badge'); headerActions.append(badge, repository); header.append(headerActions);
const intro = element('div', '', 'intro');
const appTitle = element('h1', presentation.title);
intro.append(element('p', 'W3BOOSTER / OPEN-SOURCE EXAMPLE APP', 'eyebrow'), appTitle);
intro.append(element('p', presentation.description));
const nav = element('nav'); nav.setAttribute('aria-label', 'Examples');
for (const [name, title] of [['dashboard', 'Match dashboard'], ['resources', 'Resources & heroes'], ['settings', 'Settings'], ['overlay', 'Stream overlay'], ['compact', 'Compact window']]) {
  const link = element('a', title); const parameters = new URLSearchParams(location.search); parameters.set('view', name);
  link.href = `?${parameters}`; if (name === view) link.setAttribute('aria-current', 'page'); nav.append(link);
}
const status = element('p', 'Starting…', 'notice'); status.setAttribute('role', 'status');
const content = element('div', '', 'content');
const diagnostic = element('details', '', 'diagnostics');
diagnostic.append(element('summary', 'Connection & capabilities'));
const details = element('pre'); diagnostic.append(details);
const controls = element('div', '', 'controls');
if (demo) {
  const { scenarios } = await import('./scenarios');
  const label = element('label', 'Demo scenario '); const select = element('select'); select.setAttribute('aria-label', 'Demo scenario');
  for (const name of scenarios) { const option = element('option', name.replaceAll('-', ' ')); option.value = name; select.append(option); }
  select.value = query.get('scenario') || 'match';
  select.addEventListener('change', () => { const url = new URL(location.href); url.searchParams.set('scenario', select.value); location.assign(url); });
  label.append(select); controls.append(label);
}
const open = element('button', 'Open compact window'); open.disabled = true; controls.append(open);
const feedback = element('p', '', 'notice'); feedback.setAttribute('role', 'status');
const footer = element('footer');
for (const [text, href] of [['Build your own', 'https://website.w3booster.com/developer/first-app/'], ['View source', 'https://github.com/W3Booster/app-examples'], ['SDK reference', 'https://website.w3booster.com/developer/api/']]) {
  const link = element('a', text); link.href = href; footer.append(link);
}
const sourceLink = element('a', 'Read this example’s code ↗', 'source-link'); sourceLink.href = `https://github.com/W3Booster/app-examples/blob/main/src/examples/${presentation.source}`; sourceLink.target = '_blank'; sourceLink.rel = 'noopener noreferrer'; controls.append(sourceLink);
shell.append(header, intro); if (!appSlug) shell.append(nav);
shell.append(controls, status, content, feedback, diagnostic, footer); root.replaceChildren(shell);
const demoOptions = demo ? { state: (await import('./scenarios')).scenarioState(query.get('scenario') || 'match'), interval: query.get('capture') === '1' || ['no-match', 'finished'].includes(query.get('scenario') || '') ? 0 : 1000 } : undefined;
// Preserve the authorized connection across UI hot updates; dispose only the old UI.
const cachedRuntime = import.meta.hot?.data.runtime as ReturnType<typeof w3boosterApp.createRuntime> | undefined;
const runtime = cachedRuntime || w3boosterApp.createRuntime({ retry: true, ...(demoOptions ? { demo: demoOptions } : {}) });
const uiLifetime = new AbortController();
const signal = uiLifetime.signal;
if (view === 'settings') content.append(settings(runtime, demo, signal));
runtime.lifecycle.subscribe(snapshot => {
  status.textContent = snapshot.status === 'connected'
    ? (snapshot.isSynchronized ? (snapshot.state?.match.status === 'none' ? 'Connected · waiting for a match' : 'Connected · synchronized') : 'Connected · waiting for fresh data')
    : `${snapshot.status}${snapshot.retry ? ` · attempt ${snapshot.retry.attempt}` : ''}`;
  document.body.dataset.connection = snapshot.status;
  document.body.dataset.synchronized = String(snapshot.isSynchronized);
  if (view !== 'settings') content.replaceChildren(view === 'overlay' ? broadcast(snapshot.state) : appSlug === 'clean-overlay' && view !== 'compact' ? studio(snapshot.state) : view === 'resources' ? resources(snapshot.state) : dashboard(snapshot.state));
  open.disabled = !canUseHostCapability(snapshot.host, 'window:open');
  open.title = open.disabled ? 'Open this app inside W3Booster to use host actions.' : '';
  details.textContent = JSON.stringify({ mode: demo ? 'demo' : 'live', status: snapshot.status, synchronized: snapshot.isSynchronized, match: snapshot.state?.match.status, dataCapabilities: snapshot.state?.capabilities || [], host: snapshot.host, definitionRevision: w3boosterApp.revision }, null, 2);
}, { signal });
open.addEventListener('click', async () => {
  try {
    const parameters = new URLSearchParams(location.search); parameters.set('view', 'compact');
    await runtime.client.host.openWindow({ path: `?${parameters}`, width: 520, height: 620 }, { signal: runtime.signal, timeout: 10000 });
  }
  catch { feedback.textContent = 'The host could not open a window. Check Connection & capabilities.'; }
}, { signal });
runtime.client.on('issue', issue => { feedback.textContent = `A recoverable ${issue.source} issue occurred. See the browser console.`; console.warn(issue.source, issue.error); }, { signal });
try { await runtime.start(); }
catch (error) {
  const info = classifyW3BoosterError(error);
  feedback.textContent = info.kind === 'permission' ? 'Open Apps → Developer → My apps → Test locally in W3Booster. Opening localhost directly does not authorize live data.'
    : info.code === 'APPLICATION_DEFINITION_MISMATCH' ? 'Your app definition changed. Run npm run w3booster:sync, restart the app, and launch again.'
    : info.kind === 'abort' ? '' : `Could not start (${info.code}). Check your connection, then reload. Try ?demo=1 to work offline.`;
}
window.addEventListener('pagehide', () => { uiLifetime.abort(); void runtime.stop(); }, { once: true, signal });
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(data => { uiLifetime.abort(); data.runtime = runtime; });
}
