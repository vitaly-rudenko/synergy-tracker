import { Count } from "./types";

/** Adds zeroes until the end of the week to make sure the graph is continuous */
export const normalizeWeekCounts = (count: Count[]): Count[] => {
  const result = [...count];

  const startOfWeek = new Date(count[0].timestamp);
  startOfWeek.setHours(7, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
  result.unshift({
    timestamp: startOfWeek.getTime() - 2,
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

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setHours(22, 0, 0, 0);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  result.push({
    timestamp: endOfWeek.getTime() + 2,
    count: 0,
  })

  return result
}