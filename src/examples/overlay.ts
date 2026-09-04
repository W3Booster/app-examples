import type { MatchState } from '@w3booster/sdk';
import { formatGameTime } from '@w3booster/sdk/standard-game';
import { element } from '../ui';

export function broadcast(state: MatchState | null) {
  const strip = element('section', '', 'broadcast-strip');
  if (!state || state.match.status === 'none') { strip.append(element('h2', 'Waiting for a match')); return strip; }
  const matchup = element('div', '', 'broadcast-players');
  for (const [index, player] of state.players.entries()) {
    const side = element('div', '', 'broadcast-player side-' + index % 2);
    side.append(element('span', player.race || 'Unknown race', 'eyebrow'), element('strong', player.name));
    matchup.append(side);
  }
  const clock = element('div', '', 'broadcast-clock');
  clock.append(element('span', state.match.status === 'finished' ? 'FINAL' : 'LIVE', 'broadcast-live'), element('strong', formatGameTime(state.match.gameTime)));
  const map = element('div', (state.match.map || 'Map unavailable') + ' / ' + state.match.mode, 'broadcast-map');
  strip.append(clock, matchup, map);
  if (state.match.status === 'finished') strip.append(element('span', 'Match finished', 'notice'));
  return strip;
}

export function studio(state: MatchState | null) {
  const view = element('section', '', 'broadcast-studio');
  const bar = element('div', '', 'studio-bar'); bar.append(element('span', 'PROGRAM / OVERLAY PREVIEW'), element('span', 'TRANSPARENT CANVAS'));
  const stage = element('div', '', 'studio-stage');
  stage.append(broadcast(state), element('span', 'Your game stays in focus.', 'stage-caption'));
  const info = element('div', '', 'studio-info');
  info.append(element('h2', 'Small footprint. Clear match story.'), element('p', 'The checkerboard is a preview aid, not part of the overlay. Add Clean Overlay through the W3Booster compositor for OBS or in-game use.'));
  view.append(bar, stage, info); return view;
}
