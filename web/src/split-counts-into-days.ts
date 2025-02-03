import { Count } from "./types";

export const splitCountsIntoDays = (counts: Count[]): Count[][] => {
  const days = [];
  let currentDay = [];
  let lastDay = new Date(counts[0].timestamp).getDate();

  for (const count of counts) {
    const day = new Date(count.timestamp).getDate();

    if (day !== lastDay) {
      days.push(currentDay);
      currentDay = [];
      lastDay = day;
    }

    currentDay.push(count);
  }

  days.push(currentDay);
  return days;
}