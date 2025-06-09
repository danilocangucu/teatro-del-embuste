import { getEvent } from "@/services/eventService";
import { getShowIdByShowSlug } from "@/services/showService";
import { filterUpcomingPerformances } from "./sharedUtils";
import { sanitizeEvent } from "./eventUtils";
import { EventFromDB } from "@/types/Event";
import { parsePerformanceSlug } from "./performanceUtils";
import { getPerformanceFromEvent } from "@/services/performanceService";

export async function getEventAndPerformanceIdsFromSlugs(
  showSlug: string,
  performanceSlug: string
): Promise<{ eventId: string; performanceId: string } | null> {
  try {
    console.log("🔍 Resolving slugs...");
    console.log("➡️ showSlug:", showSlug);
    console.log("➡️ performanceSlug:", performanceSlug);

    const showId = await getShowIdByShowSlug(showSlug);
    console.log("✅ Resolved showId:", showId);

    const eventFromDB = await getEvent(showId);
    console.log("📦 Fetched event from DB:", {
      eventId: eventFromDB.id,
    });

    const filteredPerformances = filterUpcomingPerformances(eventFromDB);
    console.log("🗓️ Filtered upcoming performances:", filteredPerformances.length);

    const mappedEvent = sanitizeEvent({
      ...eventFromDB,
      performances: filteredPerformances,
    } as EventFromDB);
    mappedEvent.id = eventFromDB.id;

    const { performanceDate, performanceTime } =
      parsePerformanceSlug(performanceSlug);
    console.log("🕒 Parsed performance date and time:", {
      performanceDate,
      performanceTime,
    });

    const performance = await getPerformanceFromEvent(
      mappedEvent.id,
      performanceDate,
      performanceTime
    );
    console.log("🎭 Resolved performanceId:", performance.id);

    return {
      eventId: mappedEvent.id,
      performanceId: performance.id,
    };
  } catch (err) {
    console.error("❌ Failed to resolve slugs to IDs:", err);
    return null;
  }
}
