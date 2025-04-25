import { EventFromDB } from "@/types/Event";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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