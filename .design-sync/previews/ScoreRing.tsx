import { ScoreRing } from 'meritquant-app-ui';

export function Strong() {
  return <ScoreRing score={9} />;
}

export function Moderate() {
  return <ScoreRing score={6} />;
}

export function Weak() {
  return <ScoreRing score={2} />;
}
