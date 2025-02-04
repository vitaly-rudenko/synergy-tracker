const endpoint = 'https://synergy-tracker.vitaly-rudenko.com/counts.txt'

export async function fetchData() {
  const counts = await fetch(endpoint, { method: 'GET' }).then((res) => res.text());

  return counts.split('\n').filter(Boolean).map((line) => {
    const [timestamp, value] = line.split(' ');
    return { timestamp: Date.parse(timestamp), value: value === undefined ? null : Number(value) };
  });
}