import { canUseHostCapability } from '@w3booster/sdk';
import type { ApplicationRuntime } from '@w3booster/sdk/app';
import { element } from '../ui';

// Settings types come from the generated application definition in a registered app.
export function settings(runtime: ApplicationRuntime<{ display: { title: string } }>, demo: boolean, signal: AbortSignal) {
  const view = element('section');
  view.append(element('h2', 'A setting, from UI to saved state'));
  const form = element('form');
  const label = element('label', 'App title');
  const input = element('input');
  input.name = 'title'; input.maxLength = 80;
  input.value = runtime.lifecycle.get().settings.display?.title || '';
  label.append(input);
  const save = element('button', 'Save title'); save.type = 'submit';
  const feedback = element('p', demo ? 'Demo mode previews data. Saving requires an authenticated application window.' : '', 'notice');
  feedback.setAttribute('role', 'status');
  runtime.lifecycle.subscribe(snapshot => {
    save.disabled = !canUseHostCapability(snapshot.host, 'settings:write');
  }, { signal });
  form.append(label, save, feedback);
  form.addEventListener('submit', async event => {
    event.preventDefault(); save.disabled = true;
    try {
      await runtime.client.host.setSetting('display.title', input.value, { timeout: 5000, signal: runtime.signal });
      feedback.textContent = 'Saved. Other app surfaces receive the new setting too.';
    } catch { feedback.textContent = 'Could not save. Open this app inside W3Booster and check its connection.'; }
    finally { save.disabled = !canUseHostCapability(runtime.lifecycle.get().host, 'settings:write'); }
  }, { signal });
  view.append(form);
  return view;
}
