import DailyChart from './DailyChart';
import WeeklyChart from './WeeklyChart';

const App = () => {
  return (
    <div className='flex flex-col gap-2 p-2'>
      <DailyChart />
      <WeeklyChart />
    </div>
  );
};

export default App;