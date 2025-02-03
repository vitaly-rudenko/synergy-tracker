import DailyChart from './DailyChart';
import WeeklyChart from './WeeklyChart';

const App = () => {
  return (
    <div className='flex flex-col'>
      <DailyChart />
      <WeeklyChart />
    </div>
  );
};

export default App;