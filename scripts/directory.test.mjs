import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function redirect(query) { let target; runInNewContext(script, { URL, location: { href: 'https://w3booster.github.io/app-examples/' + query, replace: value => target = value } }); return target; }
test('one directory links independent projects including Match Vision', () => {
  assert.equal(redirect(''), 'https://website.w3booster.com/developer/examples/');
  for (const repo of ['app-starter', 'app-example-match-dashboard', 'app-example-resource-monitor', 'app-example-settings-playground', 'app-example-clean-overlay', 'app-match-vision']) assert.ok(html.includes('https://github.com/W3Booster/' + repo));
});
test('old routes retain live/demo choice, scenario, view, and authorization hash', () => {
  for (const slug of ['match-dashboard', 'resource-monitor', 'settings-playground', 'clean-overlay']) {
    const target = new URL(redirect('?app=' + slug + '&view=compact&demo=0&scenario=teams#synthetic-test'));
    assert.equal(target.pathname, '/app-example-' + slug + '/');
    assert.equal(target.searchParams.get('demo'), '0');
    assert.equal(target.searchParams.get('view'), 'compact');
    assert.equal(target.searchParams.get('scenario'), 'teams');
    assert.equal(target.searchParams.has('app'), false);
    assert.equal(target.hash, '#synthetic-test');
  }
  assert.equal(new URL(redirect('?view=resources&demo=1')).pathname, '/app-example-resource-monitor/');
  assert.equal(new URL(redirect('?demo=1')).pathname, '/app-starter/');
  assert.equal(redirect('?app=https://evil.test&demo=1'), 'https://website.w3booster.com/developer/examples/');
});
