import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getWeek } from './utils/get-week';

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

const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);

const rawData = generateData();

const WeeklyChart = () => {
  const processedData = rawData.reduce<{ week: string; data: { timestamp: number; value: number; originalTimestamp: number }[] }[]>((acc, curr) => {
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

export default WeeklyChart;