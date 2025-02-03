import { Count } from "./types";

/** Adds zeroes until the end of the week to make sure the graph is continuous */
export const normalizeWeekCounts = (count: Count[]): Count[] => {
  const result = [...count];

  // const startOfWeek = new Date(count[0].timestamp);
  // startOfWeek.setHours(7, 0, 0, 0);
  // startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  // result.unshift({
  //   timestamp: startOfWeek.getTime(),
  //   count: null,
  // })

  // const endOfWeek = new Date(startOfWeek);
  // endOfWeek.setHours(22, 0, 0, 0);
  // endOfWeek.setDate(startOfWeek.getDate() + 6);
  // result.push({
  //   timestamp: endOfWeek.getTime(),
  //   count: null
  // })

  return result
}