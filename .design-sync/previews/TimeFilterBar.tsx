import { TimeFilterBar } from 'meritquant-app-ui';

export function OneDay() {
  return (
    <div className="w-72">
      <TimeFilterBar value="1D" onChange={() => {}} />
    </div>
  );
}

export function OneMonth() {
  return (
    <div className="w-72">
      <TimeFilterBar value="1M" onChange={() => {}} />
    </div>
  );
}
