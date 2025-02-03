import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getWeek } from './utils/get-week';
import { useState, useEffect } from 'react';
import { fetchData } from './fetch-data';

const endOfWeek = new Date();
endOfWeek.setHours(23, 59, 59, 999);
endOfWeek.setDate(endOfWeek.getDate() + 7 - endOfWeek.getDay());

const WeeklyChart = () => {
  const [data, setData] = useState<{ timestamp: number; value: number }[]>([]);
  useEffect(() => {
    fetchData().then((data) => setData([
      ...data,
      {
        timestamp: Date.now(),
        value: 0,
      },
      {
        timestamp: endOfWeek.getTime(),
        value: 0,
      }
    ]));
  }, [])

  const processedData = data.reduce<{ week: string; data: { timestamp: number; value: number; originalTimestamp: number }[] }[]>((acc, curr) => {
    const date = new Date(curr.timestamp);
    const week = String(getWeek(date));

    if (!acc.some((d) => d.week === week)) {
      acc.push({ week, data: [] });
    }

    const normalizedDate = new Date(curr.timestamp);
    normalizedDate.setFullYear(2022, 0, 1);
    const dayOfWeek = date.getDay();
    const mondayBasedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    normalizedDate.setDate(normalizedDate.getDate() - normalizedDate.getDay() + mondayBasedDay);

    acc.find((d) => d.week === week)!.data.push({
      timestamp: normalizedDate.getTime(),
      value: curr.value,
      originalTimestamp: curr.timestamp,
    });

    return acc;
  }, [])

  console.log(processedData)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Weakly Patterns Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[50vh] w-full">
          <ResponsiveContainer>
            <LineChart width={800} height={400}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickCount={8}
                tickFormatter={(timestamp) => new Date(timestamp + 24 * 60 * 60_000).toLocaleDateString([], { weekday: 'short' })}
              />
              <YAxis />

              {processedData.map((data, index) => (
                <Line
                  key={data.week}
                  data={data.data}
                  type="monotone"
                  dataKey="value"
                  name={data.week}
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

export default WeeklyChart;