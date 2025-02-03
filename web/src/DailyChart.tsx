import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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

const DailyChart = () => {
  const rawData = generateData();

  const processedData = rawData.reduce<{ day: string; data: { timestamp: number; value: number }[] }[]>((acc, curr) => {
    const date = new Date(curr.timestamp);

    if (date.getHours() < 7 || date.getHours() > 22) {
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
        <CardDescription>Values tracked over time, normalized to show daily patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <LineChart
            width={800}
            height={400}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(timestamp) => {
                const date = new Date(timestamp);
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                stroke={index === processedData.length - 1 ? '#ee4455' : '#2563eb'}
                strokeOpacity={(index / processedData.length) * 0.9 + 0.1}
                strokeWidth={(index / processedData.length) * 1.5 + 0.5}
                dot={false}
              />
            ))}
          </LineChart>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyChart;