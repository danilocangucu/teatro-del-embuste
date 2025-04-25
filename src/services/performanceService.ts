import { PerformanceFromDB } from "@/types/Event";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
        date: true,
        time: true,
      },
    });
  
    if (!performance) {
      throw new Error("Performance not found");
    }
  
    return performance as PerformanceFromDB;
  }