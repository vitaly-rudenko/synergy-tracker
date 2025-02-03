import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';
import { useEffect, useState } from 'react';
import { fetchData } from './fetch-data';

const endOfDay = new Date();
endOfDay.setHours(23, 59, 59, 999);

const DailyChart = () => {
  const [sameWeekday, setSameWeekday] = useState(false);

  const [data, setData] = useState<{ timestamp: number; value: number }[]>([]);
  useEffect(() => {
    fetchData().then((data) => setData([
      ...data,
      {
        timestamp: Date.now(),
        value: 0,
      },
      {
        timestamp: endOfDay.getTime(),
        value: 0,
      }
    ]));
  }, [])

  const processedData = data.reduce<{ day: string; data: { timestamp: number; value: number }[] }[]>((acc, curr) => {
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
                  strokeOpacity={((index + 1) / processedData.length) * 0.9 + 0.1}
                  strokeWidth={index === processedData.length - 1 ? 3 : ((index + 1) / processedData.length) * 2 + 0.5}
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