import DailyChart from './DailyChart';
import WeeklyChart from './WeeklyChart';

const App = () => {
  return (
    <div className='flex flex-col items-center gap-2 p-2'>
      <div className='text-xl font-serif italic'>Synergy Tracker</div>
      <DailyChart />
      <WeeklyChart />
    </div>
  );
};

export default App;