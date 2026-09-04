import './style.css';
import { canUseHostCapability, classifyW3BoosterError } from '@w3booster/sdk';
import { w3boosterApp } from './w3booster.generated';
import { dashboard } from './examples/dashboard';
import { resources } from './examples/resources';
import { settings } from './examples/settings';
import { element } from './ui';

const query = new URLSearchParams(location.search);
const view = query.get('view') || 'dashboard';
const demo = query.get('demo') === '1' || (w3boosterApp.clientId === 'unregistered_demo' && query.get('demo') !== '0');
const overlay = view === 'overlay';
document.body.classList.toggle('overlay', overlay);
document.documentElement.classList.toggle('overlay-root', overlay);
const root = document.querySelector<HTMLDivElement>('#app')!;
const shell = element('main', '', 'shell');
const header = element('header');
header.append(element('a', 'W3 / Developer Lab', 'brand'));
const badge = element('span', demo ? 'DEMO DATA' : 'LIVE CONNECTION', 'badge'); header.append(badge);
const intro = element('div', '', 'intro');
const appTitle = element('h1', 'Your first app. Already running.');
intro.append(element('p', 'BUILD SOMETHING FOR THE NEXT MATCH', 'eyebrow'), appTitle);
intro.append(element('p', 'Explore live-shaped match data, change a scenario, then make it yours.'));
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
shell.append(header, intro, nav, controls, status, content, feedback, diagnostic, footer); root.replaceChildren(shell);
const demoOptions = demo ? { state: (await import('./scenarios')).scenarioState(query.get('scenario') || 'match'), interval: ['no-match', 'finished'].includes(query.get('scenario') || '') ? 0 : 1000 } : undefined;
// Preserve the authorized connection across UI hot updates; dispose only the old UI.
const cachedRuntime = import.meta.hot?.data.runtime as ReturnType<typeof w3boosterApp.createRuntime> | undefined;
const runtime = cachedRuntime || w3boosterApp.createRuntime({ retry: true, ...(demoOptions ? { demo: demoOptions } : {}) });
const uiLifetime = new AbortController();
const signal = uiLifetime.signal;
if (view === 'settings') content.append(settings(runtime, demo, signal));
runtime.lifecycle.subscribe(snapshot => {
  if (!demo && snapshot.settings.display?.title) appTitle.textContent = snapshot.settings.display.title;
  status.textContent = snapshot.status === 'connected'
    ? (snapshot.isSynchronized ? (snapshot.state?.match.status === 'none' ? 'Connected · waiting for a match' : 'Connected · synchronized') : 'Connected · waiting for fresh data')
    : `${snapshot.status}${snapshot.retry ? ` · attempt ${snapshot.retry.attempt}` : ''}`;
  document.body.dataset.connection = snapshot.status;
  document.body.dataset.synchronized = String(snapshot.isSynchronized);
  if (view !== 'settings') content.replaceChildren(view === 'resources' ? resources(snapshot.state) : dashboard(snapshot.state));
  open.disabled = !canUseHostCapability(snapshot.host, 'window:open');
  open.title = open.disabled ? 'Open this app inside W3Booster to use host actions.' : '';
  details.textContent = JSON.stringify({ mode: demo ? 'demo' : 'live', status: snapshot.status, synchronized: snapshot.isSynchronized, match: snapshot.state?.match.status, dataCapabilities: snapshot.state?.capabilities || [], host: snapshot.host, definitionRevision: w3boosterApp.revision }, null, 2);
}, { signal });
open.addEventListener('click', async () => {
  try { await runtime.client.host.openWindow({ path: '?view=compact', width: 520, height: 620 }, { signal: runtime.signal, timeout: 10000 }); }
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
