import { Sparkline } from 'meritquant-app-ui';

const RISING = [12.4, 12.1, 12.6, 12.9, 12.7, 13.2, 13.6, 13.4, 13.9, 14.3];
const FALLING = [48.2, 47.9, 48.5, 47.1, 46.6, 46.9, 45.8, 45.2, 44.6, 44.1];

export function Rising() {
  return (
    <div style={{ width: 200, height: 60 }}>
      <Sparkline data={RISING} strokeClass="stroke-bull stroke-2" />
    </div>
  );
}

export function Falling() {
  return (
    <div style={{ width: 200, height: 60 }}>
      <Sparkline data={FALLING} strokeClass="stroke-bear stroke-2" />
    </div>
  );
}
