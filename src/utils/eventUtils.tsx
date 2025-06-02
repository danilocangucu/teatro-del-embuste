import { EventDTO, EventFromDB, EventMetadataDTO, EventMetadataFromDB, PerformanceFromDB } from "@/types/Event";

export const sanitizeEvent = (event: EventFromDB): EventDTO => {
  return {
    startDate: event.start_date.toISOString().split("T")[0],
    endDate: event.end_date.toISOString().split("T")[0],
    isPremiere: event.is_premiere ?? false,
    defaultTime: event.default_time.toISOString().slice(11, 16),
    totalSeats: event.total_seats,

    performances: event.performances.map((performance: PerformanceFromDB) => ({
      id: performance.id,
      date: getISODate(performance.date),
      time: getISOTime(performance.time ? performance.time : event.default_time),
      availableSeats: performance.available_seats,
    })),

    pricings: event.event_pricings.map((pricingWrapper) => ({
      type: pricingWrapper.pricings.type,
      price: parseFloat(pricingWrapper.pricings.price.toString()),
    })),

    discountRules: event.event_discount_rules.map((ruleWrapper) => ({
      type: ruleWrapper.discount_rules.type,
      criteria: {
        daysBeforeEvent:
          ruleWrapper.discount_rules.discount_criteria?.days_before_event ??
          undefined,
        daysOfWeek: ruleWrapper.discount_rules.discount_criteria?.days_of_week,
        ticketTypes: ruleWrapper.discount_rules.discount_criteria?.ticket_types,
      },
      discount: {
        id: ruleWrapper.discount_rules.discounts.id,
        type: ruleWrapper.discount_rules.discounts.type,
        value: parseFloat(
          ruleWrapper.discount_rules.discounts.value.toString()
        ),
        description: ruleWrapper.discount_rules.discounts.description,
      },
    })),
  };
};

export const sanitizeEventMetadata = (
  event: EventMetadataFromDB
): EventMetadataDTO => {
  return {
    startDate: event.start_date.toISOString().split("T")[0],
    endDate: event.end_date.toISOString().split("T")[0],
  };
}

export const formatEventDateRange = (
  startDate: string,
  endDate: string
): string => {
  const [, startMonth, startDay] = startDate.split("-");
  const [endYear, endMonth, endDay] = endDate.split("-");

  return `${startDay}/${startMonth} - ${endDay}/${endMonth}/${endYear.slice(
    2
  )}`;
};

export const getDiscountedPrice = (
  basePrice: number,
  discount: { type: "percentage" | "flat"; value: number }
) => {
  return discount.type === "percentage"
    ? Math.round(basePrice * (1 - discount.value / 100))
    : basePrice - discount.value;
};

const dayMap: Record<string, string> = {
  mon: "LU",
  tue: "MA",
  wed: "MI",
  thu: "JU",
  fri: "VI",
  sat: "SA",
  sun: "DO",
};

export const getFormattedDate = (isoString: string, time: string) => {
  const date = new Date(isoString);

  const weekday =
    dayMap[
      date.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase()
    ];

  // Manually format the date to always show two digits for day and month
  const day = String(date.getDate()).padStart(2, "0"); // Ensure day is two digits
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure month is two digits (months are zero-based)
  const formattedDate = `${day}/${month}`;

  const [hour, minute] = time.split(":");
  const dateWithTime = new Date(date.setHours(Number(hour), Number(minute)));

  // Get the formatted time (in AM/PM format)
  let formattedTime = dateWithTime.toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Remove the periods and extra spaces from AM/PM and any ":00" minute formatting
  formattedTime = formattedTime
    .replace(/\s?\.?\s?([a|p])\.?(\s?m\.?)?/gi, "$1M") // Remove periods and spaces from AM/PM
    .replace(/:00/, ""); // Remove minutes if it's 00 (e.g., 8:00 -> 8)

  return `${weekday}. ${formattedDate} – ${formattedTime.toUpperCase()}`;
};

export function formatDateTimeForURL(date: string, time: string) {
  const [hoursStr, minutesStr] = time.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  const dateObj = new Date(`${date}T${time}`);
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = String(dateObj.getFullYear()).slice(-2);

  const isPM = hours >= 12;
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;

  const timePart =
    minutes === 0
      ? `${hour12}${isPM ? "PM" : "AM"}`
      : `${hour12}-${String(minutes).padStart(2, "0")}${isPM ? "PM" : "AM"}`;

  return `${day}-${month}-${year}-${timePart}`;
}

export function getPerformanceSlugAndDate(
  date: string,
  time: string
): { formattedDate: string; performanceSlug: string } {
  return {
    formattedDate: getFormattedDate(date, time),
    performanceSlug: formatDateTimeForURL(date, time),
  };
}

export function getISODate(date: Date): string {
  return date.toISOString().split("T")[0]; // "2025-06-07"
}

export function getISOTime(time: Date): string {
  return time.toISOString().slice(11, 16); // "18:00"
}
