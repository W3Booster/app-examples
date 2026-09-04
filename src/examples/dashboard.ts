import type { MatchState } from '@w3booster/sdk';
import { formatGameTime } from '@w3booster/sdk/standard-game';
import { element, metric } from '../ui';

export function dashboard(state: MatchState | null) {
  const view = element('section', '', 'match-view');
  if (!state || state.match.status === 'none') {
    view.append(element('h2', 'Waiting for a match'), element('p', 'Your app is ready. Players will appear when a match starts.'));
    return view;
  }
  view.append(element('p', `${state.match.mode} · ${state.match.map || 'Unknown map'}`, 'eyebrow'));
  view.append(element('h2', formatGameTime(state.match.gameTime), 'clock'));
  const players = element('div', '', 'players');
  for (const player of state.players) {
    const card = element('article', '', 'player');
    card.append(element('span', player.race || 'Unknown race', 'eyebrow'), element('h3', player.name));
    card.append(metric('Team', player.team === undefined ? 'Unknown' : String(player.team + 1)));
    players.append(card);
  }
  view.append(players);
  if (state.match.status === 'finished') view.append(element('p', 'Match finished', 'notice'));
  return view;
}
