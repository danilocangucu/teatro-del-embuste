import { PerformanceFromDB } from "@/types/Event";
import { prisma } from "@/lib/prisma";

export const getPerformanceFromEvent = async (
  eventId: string,
  performanceDate: Date,
  performanceTime: Date
) => {
  const performance = await prisma.performances.findFirst({
    where: {
      event_id: eventId,
      date: performanceDate,
      time: performanceTime,
    },
    select: {
      id: true,
      date: true,
      time: true,
    },
  });

  if (!performance) {
    throw new Error("Performance not found");
  }

  return performance as PerformanceFromDB;
};

export const getPerformance = async (performanceId: string) => {
  const performance = await prisma.performances.findUnique({
    where: {
      id: performanceId,
    },
  });

  if (!performance) {
    throw new Error("Performance not found");
  }

  return performance;
};

export const getPerformanceByReservationId = async (reservationId: string) => {
  const performance = await prisma.performances.findFirst({
    where: {
      reservations: {
        some: {
          id: reservationId,
        },
      },
    },
  });

  if (!performance) {
    throw new Error("Performance not found for the given reservation ID");
  }

  return performance;
};

export const getEventIdByPerformanceId = async (performanceId: string) => {
  const event = await prisma.performances.findUnique({
    where: { id: performanceId },
    select: { event_id: true },
  });

  if (!event) {
    throw new Error("Performance not found");
  }

  return event.event_id;
};