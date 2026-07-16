import { MacroGrid } from './MacroGrid';
import { MasterChart } from './MasterChart';
export function ChartsChannel() {
  return (
    <div className="space-y-4">
      <MacroGrid />
      <MasterChart />
    </div>
  );
}
