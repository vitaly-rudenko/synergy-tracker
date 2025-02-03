import { Count } from "./types";

/** Adds zeroes until the end of the day to make sure the graph is continuous */
export const normalizeDayCounts = (count: Count[]): Count[] => {
  const result = [...count];

  const startOfDay = new Date(count[0].timestamp);
  startOfDay.setHours(7, 0, 0, 0);
  result.unshift({
    timestamp: startOfDay.getTime() - 2,
    count: 0,
  })

  result.unshift({
    timestamp: count[0].timestamp - 1,
    count: 0,
  })

  result.push({
    timestamp: count[count.length - 1].timestamp + 1,
    count: 0,
  })

  const endOfDay = new Date(count[count.length - 1].timestamp);
  endOfDay.setHours(22, 0, 0, 0);
  result.push({
    timestamp: endOfDay.getTime() + 2,
    count: 0,
  })

  return result
}