import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';
import { useState } from 'react';

const generateData = (days = 30) => {
  const data = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const pointsPerDay = 24;

  for (let day = 0; day < days; day++) {
    const baseValue = 200 + Math.random() * 100;
    for (let point = 0; point < pointsPerDay; point++) {
      const timestamp = now - (days - day) * dayMs + (point * dayMs / pointsPerDay);
      const hour = (point / pointsPerDay) * 24;
      const timeEffect = Math.cos((hour - 4) * (Math.PI / 8)) * 75;
      const value = Math.round(baseValue + timeEffect + Math.random() * 30) * 1.5;
      data.push({
        timestamp,
        value
      });
    }
  }
  return data;
};

const rawData = generateData();

const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);

const DailyChart = () => {
  const [sameWeekday, setSameWeekday] = useState(false);

  const processedData = rawData.reduce<{ day: string; data: { timestamp: number; value: number }[] }[]>((acc, curr) => {
    const date = new Date(curr.timestamp);

    if (sameWeekday && date.getDay() !== new Date().getDay()) {
      return acc;
    }

    const day = date.toLocaleDateString();

    if (!acc.some((d) => d.day === day)) {
      acc.push({ day, data: [] });
    }

    const normalizedDate = new Date(curr.timestamp);
    normalizedDate.setFullYear(2022, 0, 1)

    acc.find((d) => d.day === day)!.data.push({
      timestamp: normalizedDate.getTime(),
      value: curr.value,
    });

    return acc;
  }, []).map((day) => {
    return {
      day: day.day,
      data: day.data.sort((a, b) => a.timestamp - b.timestamp)
    }
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Daily Patterns Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[50vh] w-full">
          <div className="flex items-center space-x-2 pb-4">
            <Switch id="same-weekday" checked={sameWeekday} onCheckedChange={(checked) => setSameWeekday(checked)} />
            <Label htmlFor="same-weekday">Same weekday</Label>
          </div>

          <ResponsiveContainer>
            <LineChart className='pb-4'>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickCount={25}
                tickFormatter={(timestamp) => {
                  const date = new Date(timestamp);
                  return date.toLocaleTimeString([], { hour: 'numeric' });
                }}
              />
              <YAxis />

              {processedData.map((data, index) => (
                <Line
                  key={data.day}
                  data={data.data}
                  type="monotone"
                  dataKey="value"
                  name={data.day}
                  stroke={index === processedData.length - 1 ? '#2563eb' : '#ee9922'}
                  strokeOpacity={(index / processedData.length) * 0.9 + 0.1}
                  strokeWidth={index === processedData.length - 1 ? 3 : (index / processedData.length) * 2 + 0.5}
                  animationDuration={250}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyChart;