import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getWeek } from './utils/get-week';
import { useState, useEffect } from 'react';
import { fetchData } from './fetch-data';
import { getWeekdayNumber } from './utils/get-weekday-number';

const startOfWeek = new Date();
startOfWeek.setHours(0, 0, 0, 0);
startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

const endOfWeek = new Date();
endOfWeek.setHours(23, 59, 59, 999);
endOfWeek.setDate(startOfWeek.getDate() + 6);

const WeeklyChart = () => {
  const [data, setData] = useState<{ timestamp: number; value: number | null }[]>([]);

  useEffect(() => {
    fetchData().then((data) => setData([
      {
        timestamp: startOfWeek.getTime(),
        value: null,
      },
      ...data,
      {
        timestamp: endOfWeek.getTime(),
        value: null,
      }
    ].sort((a, b) => a.timestamp - b.timestamp)));
  }, [])

  const processedData = data.reduce<{ week: string; data: { timestamp: number; value: number | null; originalTimestamp: number }[] }[]>((acc, curr) => {
    const date = new Date(curr.timestamp);
    const week = String(getWeek(date));

    if (!acc.some((d) => d.week === week)) {
      acc.push({ week, data: [] });
    }

    const normalizedDate = new Date(curr.timestamp);
    normalizedDate.setFullYear(startOfWeek.getFullYear(), startOfWeek.getMonth());
    normalizedDate.setDate(startOfWeek.getDate() + getWeekdayNumber(date));

    acc.find((d) => d.week === week)!.data.push({
      timestamp: normalizedDate.getTime(),
      value: curr.value,
      originalTimestamp: curr.timestamp,
    });

    return acc;
  }, [])

  return (
    <Card className="w-full max-w-[1000px]">
      <CardHeader className='p-4'>
        <CardTitle>Weekly visitors</CardTitle>
      </CardHeader>
      <CardContent className='p-1'>
        <div className="h-[75vw] max-h-[40svh] w-full">
          <ResponsiveContainer>
            <LineChart margin={{ top: 0, left: 0, bottom: 0, right: 0 }} className='pb-2'>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={[
                  startOfWeek.getTime(),
                  endOfWeek.getTime(),
                ]}
                interval='equidistantPreserveStart'
                ticks={new Array(7).fill(0).map((_, index) => startOfWeek.getTime() + index * 24 * 60 * 60 * 1000)}
                tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString([], { weekday: 'short' })}
                fontSize={12}
              />
              <YAxis tickCount={25} domain={[0, (dataMax: number) => Math.max(500, dataMax)]} allowDataOverflow width={40} fontSize={12} />

              {processedData.map((data, index) => (
                <Line
                  key={data.week}
                  data={data.data}
                  type="monotone"
                  connectNulls={false}
                  dataKey="value"
                  name={data.week}
                  stroke={index === processedData.length - 1 ? '#000000' : '#999999'}
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