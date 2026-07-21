import { PriceLadder } from 'meritquant-app-ui';

const LEVELS = { entry: 182.5, stopLoss: 176.2, target1: 191.8, target2: 201.4 };

export function NearEntry() {
  return (
    <div className="w-80">
      <PriceLadder levels={LEVELS} livePrice={183.9} />
    </div>
  );
}

export function NearTarget() {
  return (
    <div className="w-80">
      <PriceLadder levels={LEVELS} livePrice={198.1} />
    </div>
  );
}
