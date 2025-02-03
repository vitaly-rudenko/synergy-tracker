import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp } from 'lucide-react';
import { normalizeDayCounts } from './normalize-day-counts';
import { Count } from './types';
import { splitCountsIntoDays } from './split-counts-into-days';
import { splitCountsIntoWeeks } from './split-counts-into-weeks';
import { normalizeWeekCounts } from './normalize-week-counts';

const generateDayData = (baseDate: Date): Count[] => {
  const data = [];
  const dayStart = new Date(baseDate);
  dayStart.setHours(7, 0, 0, 0);

  for (let i = 0; i < 192; i++) {
    const time = new Date(dayStart);
    time.setMinutes(time.getMinutes() + (i * 5));

    if (time <= new Date()) {
      const hour = time.getHours();
      const baseCount =
        (hour >= 7 && hour <= 9) ? 50 :
          (hour >= 17 && hour <= 19) ? 60 :
            30;

      const variation = Math.random() * 20 - 10;
      data.push({
        timestamp: time.getTime(),
        count: Math.max(0, Math.round(baseCount + variation))
      });
    }
  }
  return data;
};

const generateMonthData = (): Count[] => {
  const dayMonthBefore = new Date();
  dayMonthBefore.setMonth(dayMonthBefore.getMonth() - 1);

  const data = [];

  for (let date = new Date(dayMonthBefore); date <= new Date(); date.setDate(date.getDate() + 1)) {
    data.push(...generateDayData(new Date(date)));
  }

  return data;
};

const GymOccupancy = () => {
  const [viewMode, setViewMode] = useState('day');

  const counts = generateMonthData();
  const days = splitCountsIntoDays(counts).map(day => normalizeDayCounts(day));
  const weeks = splitCountsIntoWeeks(counts).map(day => normalizeWeekCounts(day));

  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    return viewMode === 'day'
      ? date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
      : date.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' +
      date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Gym Occupancy</CardTitle>
        <div className="flex space-x-4">
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            onClick={() => setViewMode('day')}
            className="flex items-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Day</span>
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            onClick={() => setViewMode('week')}
            className="flex items-center space-x-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Week</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={viewMode === 'day' ? days[days.length - 1] : weeks[weeks.length - 1]}
              margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatXAxis}
                interval="preserveStartEnd"
              />
              <YAxis domain={[0, 100]} />
              <Tooltip
                labelFormatter={formatXAxis}
                formatter={(value) => [`${value} people`, 'Occupancy']}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(200, 70%, 50%)"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default GymOccupancy;