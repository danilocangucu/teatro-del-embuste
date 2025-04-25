import { EventFromDB, PerformanceFromDB } from "@/types/Event";

export function parseTimeString(timeString: string): Date {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds || 0, 0);
    return date;
  }

export function combineDateAndTime(date: Date, time: Date): Date {
    const combined = new Date(date);
    combined.setHours(
      time.getHours(),
      time.getMinutes(),
      time.getSeconds(),
      0
    );
    return combined;
  }

export function filterUpcomingPerformances(event: EventFromDB): PerformanceFromDB[] {
  const now = new Date();

  return event.performances
    .map((performance) => {
      const date =
        performance.date instanceof Date
          ? performance.date
          : new Date(performance.date);

      const timeRaw = performance.time || event.default_time;
      const time =
        timeRaw instanceof Date ? timeRaw : parseTimeString(timeRaw);

      return { ...performance, date, time };
    })
    .filter(({ date, time }) => {
      const combined = combineDateAndTime(date, time);
      return combined >= now;
    });
}