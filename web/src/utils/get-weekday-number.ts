export function getWeekdayNumber(date: Date) {
  return date.getDay() === 0 ? 6 : (date.getDay() - 1)
}
