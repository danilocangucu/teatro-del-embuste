import { EventFromDB } from "@/types/Event";
import { prisma } from "@/lib/prisma";

export const getEvent = async (showId: string) => {
  const event = await prisma.events.findFirst({
    where: {
      show_id: showId,
      end_date: { gte: new Date() },
    },

    orderBy: { start_date: "asc" },

    select: {
      id: true,
      start_date: true,
      end_date: true,
      total_seats: true,
      is_premiere: true,
      default_time: true,

      event_pricings: {
        select: {
          pricings: {
            select: {
              type: true,
              price: true,
            },
          },
        },
      },

      event_discount_rules: {
        select: {
          discount_rules: {
            select: {
              type: true,
              discounts: {
                select: {
                  id: true,
                  value: true,
                  type: true,
                  description: true,
                },
              },
              discount_criteria: {
                select: {
                  days_before_event: true,
                  days_of_week: true,
                  ticket_types: true,
                },
              },
            },
          },
        },
      },

      performances: {
        select: {
          id: true,
          date: true,
          time: true,
          available_seats: true,
        },
        orderBy: [{ date: "asc" }, { time: "asc" }],
      },
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  return event as EventFromDB;
};

export const getShowIdByEventId = async (eventId: string) => {
  const event = await prisma.events.findUnique({
    where: { id: eventId },
    select: { show_id: true },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  return event.show_id;
};

export const getDefaultTimeByEventId = async (eventId: string) => {
  const event = await prisma.events.findUnique({
    where: { id: eventId },
    select: { default_time: true },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  return event.default_time;
};