import { Count } from "./types";
import { getWeek } from "./utils/get-week";

export const splitCountsIntoWeeks = (counts: Count[]): Count[][] => {
  const weeks = [];
  let currentWeek = [];
  let lastWeek = getWeek(new Date(counts[0].timestamp));

  for (const count of counts) {
    const week = getWeek(new Date(count.timestamp));

    if (week !== lastWeek) {
      weeks.push(currentWeek);
      currentWeek = [];
      lastWeek = week;
    }

    currentWeek.push(count);
  }

  weeks.push(currentWeek);
  return weeks;
}
