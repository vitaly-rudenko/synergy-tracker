import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';
import { useEffect, useState } from 'react';
import { fetchData } from './fetch-data';
import { getWeekdayNumber } from './utils/get-weekday-number';

const startOfWeek = new Date();
startOfWeek.setHours(0, 0, 0, 0);
startOfWeek.setDate(startOfWeek.getDate() - getWeekdayNumber(startOfWeek));

const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);

const endOfDay = new Date();
endOfDay.setHours(23, 59, 59, 999);

const effectiveStartOfDay = new Date(startOfDay);
effectiveStartOfDay.setHours(7);

const effectiveEndOfDay = new Date(startOfDay);
effectiveEndOfDay.setHours(22);

const weekdayColor: Record<string, string> = {
  '0': '#A52A2A',
  '1': '#FF4000',
  '2': '#FF8000',
  '3': '#FFD700',
  '4': '#B8B800',
  '5': '#5555FF',
  '6': '#9B4EE3',
}

const weekdayName: Record<string, string> = {
  '0': 'Mon',
  '1': 'Tue',
  '2': 'Wed',
  '3': 'Thu',
  '4': 'Fri',
  '5': 'Sat',
  '6': 'Sun',
}

const DailyChart = () => {
  const [weekday, setWeekday] = useState(-1);
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
  ].sort((a, b) => a.timestamp - b.timestamp).reduce<{ day: string; weekday: number; data: { timestamp: number; isToday: boolean; isThisWeek: boolean; value: number | null }[] }[]>((acc, curr) => {
    const date = new Date(curr.timestamp);

    if (weekday !== -1 && getWeekdayNumber(date) !== weekday) {
      return acc;
    }

    const day = date.toLocaleDateString();

    if (!acc.some((d) => d.day === day)) {
      acc.push({ day, weekday: getWeekdayNumber(date), data: [] });
    }

    const normalizedDate = new Date(curr.timestamp);
    normalizedDate.setFullYear(startOfDay.getFullYear(), startOfDay.getMonth(), startOfDay.getDate());

    if (hideIneffective) {
      if (normalizedDate < effectiveStartOfDay || normalizedDate > effectiveEndOfDay) {
        return acc;
      }
    }

    acc.find((d) => d.day === day)!.data.push({
      isToday: date.getTime() >= startOfDay.getTime(),
      isThisWeek: date.getTime() >= startOfWeek.getTime(),
      timestamp: normalizedDate.getTime(),
      value: curr.value,
    });

    return acc;
  }, []).map((day) => {
    return {
      day: day.day,
      weekday: day.weekday,
      data: day.data.sort((a, b) => a.timestamp - b.timestamp)
    }
  });

  return (
    <Card className="w-full max-w-[1000px]">
      <CardHeader className='p-4 pb-2'>
        <CardTitle className='flex flex-row gap-2'>
          <span>Daily visitors</span>
          <span className='text-black/50 font-normal'>Latest: {data.sort((a, b) => b.timestamp - a.timestamp)[0]?.value ?? 0}</span>
        </CardTitle>
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
                  stroke={
                    data.data.some(i => weekday === -1 ? i.isToday : i.isThisWeek)
                      ? '#000000'
                      : weekday === -1 ? weekdayColor[data.weekday] : '#999999'
                  }
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
          <Select value={String(weekday)} onValueChange={(value) => setWeekday(Number(value))}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select weekday" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='-1'>All weekdays</SelectItem>
              <SelectItem value='0'>Monday</SelectItem>
              <SelectItem value='1'>Tuesday</SelectItem>
              <SelectItem value='2'>Wednesday</SelectItem>
              <SelectItem value='3'>Thursday</SelectItem>
              <SelectItem value='4'>Friday</SelectItem>
              <SelectItem value='5'>Saturday</SelectItem>
              <SelectItem value='6'>Sunday</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Switch id="hide-ineffective" checked={hideIneffective} onCheckedChange={(checked) => setHideIneffective(checked)} />
            <Label htmlFor="hide-ineffective">Business hours</Label>
          </div>
        </div>

        <div className='flex flex-row justify-center gap-2 pb-3'>
          {Object.entries(weekdayColor).map(([day, color]) => (
            <div key={day} className='flex items-center space-x-1'>
              <div className='w-2 h-4 rounded-full' style={{ backgroundColor: color }} />
              <span className='text-xs'>{weekdayName[day]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyChart;