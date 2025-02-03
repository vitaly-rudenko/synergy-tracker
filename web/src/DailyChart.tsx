import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';
import { useEffect, useState } from 'react';
import { fetchData } from './fetch-data';

const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);

const endOfDay = new Date();
endOfDay.setHours(23, 59, 59, 999);

const effectiveStartOfDay = new Date(startOfDay);
effectiveStartOfDay.setHours(7);

const effectiveEndOfDay = new Date(startOfDay);
effectiveEndOfDay.setHours(22);

const DailyChart = () => {
  const [sameWeekday, setSameWeekday] = useState(false);
  const [hideIneffective, setHideIneffective] = useState(true);
  const [data, setData] = useState<{ timestamp: number; value: number | null }[]>([]);

  useEffect(() => {
    fetchData().then((data) => setData(data));
  }, []);

  const processedData = [
    {
      timestamp: hideIneffective ? effectiveStartOfDay.getTime() : startOfDay.getTime(),
      value: null,
    },
    ...data,
    {
      timestamp: hideIneffective ? effectiveEndOfDay.getTime() : endOfDay.getTime(),
      value: null,
    }
  ].sort((a, b) => a.timestamp - b.timestamp).reduce<{ day: string; data: { timestamp: number; value: number | null }[] }[]>((acc, curr) => {
    const date = new Date(curr.timestamp);

    if (sameWeekday && date.getDay() !== new Date().getDay()) {
      return acc;
    }

    const day = date.toLocaleDateString();

    if (!acc.some((d) => d.day === day)) {
      acc.push({ day, data: [] });
    }

    const normalizedDate = new Date(curr.timestamp);
    normalizedDate.setFullYear(startOfDay.getFullYear(), startOfDay.getMonth(), startOfDay.getDate());

    if (hideIneffective) {
      if (normalizedDate < effectiveStartOfDay || normalizedDate > effectiveEndOfDay) {
        return acc;
      }
    }

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
    <Card className="w-full max-w-[1000px]">
      <CardHeader className='p-4 pb-2'>
        <CardTitle>Daily visitors</CardTitle>
        <CardDescription>Latest count: {data.sort((a, b) => b.timestamp - a.timestamp)[0]?.value ?? 0}</CardDescription>
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
                  hideIneffective ? effectiveStartOfDay.getTime() : startOfDay.getTime(),
                  hideIneffective ? effectiveEndOfDay.getTime() : endOfDay.getTime(),
                ]}
                interval='equidistantPreserveStart'
                ticks={hideIneffective
                  ? new Array(effectiveEndOfDay.getHours() - effectiveStartOfDay.getHours()).fill(0).map((_, index) => effectiveStartOfDay.getTime() + index * 60 * 60 * 1000)
                  : new Array(24).fill(0).map((_, index) => startOfDay.getTime() + index * 60 * 60 * 1000)}
                tickFormatter={(timestamp) => {
                  const date = new Date(timestamp);
                  return date.toLocaleTimeString([], { hour: 'numeric' });
                }}
                fontSize={12}
              />
              <YAxis tickCount={25} domain={[0, (dataMax: number) => Math.max(500, dataMax)]} allowDataOverflow width={40} fontSize={12} />

              {processedData.map((data, index) => (
                <Line
                  key={data.day}
                  data={data.data}
                  type="monotone"
                  dataKey="value"
                  connectNulls={false}
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

        <div className='flex flex-row justify-center gap-4 pb-3'>
          <div className="flex items-center space-x-2">
            <Switch id="same-weekday" checked={sameWeekday} onCheckedChange={(checked) => setSameWeekday(checked)} />
            <Label htmlFor="same-weekday">Same weekday</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="hide-ineffective" checked={hideIneffective} onCheckedChange={(checked) => setHideIneffective(checked)} />
            <Label htmlFor="hide-ineffective">Business hours</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyChart;