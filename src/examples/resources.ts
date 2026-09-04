import type { MatchState } from '@w3booster/sdk';
import { element, metric } from '../ui';

export function resources(state: MatchState | null) {
  const view = element('section', '', 'players');
  if (!state?.players.length) { view.append(element('p', 'Waiting for players.')); return view; }
  for (const player of state.players) {
    const card = element('article', '', 'player');
    card.append(element('h2', player.name));
    const value = state.capabilities.includes('resources') ? player.resources : undefined;
    if (!value) card.append(element('p', 'Resource data is unavailable for this player. Check granted scopes and current match data.'));
    else card.append(metric('Gold', String(value.gold)), metric('Lumber', String(value.lumber)), metric('Supply', `${value.supply} / ${value.supplyCap}`));
    for (const hero of player.heroes || []) card.append(metric(hero.name, `Level ${hero.level}`));
    view.append(card);
  }
  return view;
}
