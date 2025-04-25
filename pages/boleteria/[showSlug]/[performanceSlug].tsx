import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar/Navbar";
import { EventDTO, EventFromDB, PerformanceDTO } from "@/types/Event";
import { GetServerSideProps } from "next";
import "../../../src/styles/globals.css";
import { parsePerformanceSlug } from "@/utils/performanceUtils";
import { getShowId } from "@/services/showService";
import { getEvent } from "@/services/eventService";
import { sanitizeEvent } from "@/utils/eventUtils";
import { filterUpcomingPerformances } from "@/utils/sharedUtils";
import { getPerformanceFromEvent } from "@/services/performanceService";

interface PerformancePageProps {
  eventData: EventDTO | null;
  performanceInEvent: PerformanceDTO | null;
}

export default function PerformancePage({
  eventData,
  performanceInEvent,
}: PerformancePageProps) {
  console.log("performanceExistsInEvent", performanceInEvent);
  console.log("eventData", eventData);

  return (
    <>
      <Navbar />
      {performanceInEvent ? (
        <div>RENDER _IDEAL LAYOUT_</div>
      ) : eventData?.performances.length !== 0 ? (
        <div>
          RENDER _THIS PERFORMANCE DOESNT EXIST BUT YOU CAN CHOOSE MORE
          PERFORMANCES FROM THIS EVENT_
        </div>
      ) : (
        <div>
          RENDER _THIS SHOW DOESNT HAVE PERFORMANCES RIGHT NOW. MAYBE YOU WANT
          TO CHECK OUR CURRENT PROGRAMME?_
        </div>
      )}
      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<
  PerformancePageProps
> = async (context) => {
  const { showSlug, performanceSlug } = context.params as {
    showSlug: string;
    performanceSlug: string;
  };

  let showId;
  try {
    showId = await getShowId(showSlug);
  } catch (error) {
    console.error("Error fetching show:", error);
    return {
      notFound: true,
    };
  }

  let mappedEvent;
  try {
    const eventFromDB = await getEvent(showId);
    const filteredPerformances = filterUpcomingPerformances(eventFromDB);
    mappedEvent = sanitizeEvent({
      ...eventFromDB,
      performances: filteredPerformances,
    } as EventFromDB);
    mappedEvent.id = eventFromDB.id;
  } catch (error) {
    console.error("Error fetching event:", error);
    return {
      notFound: true,
    };
  }

  const { performanceDate, performanceTime } =
    parsePerformanceSlug(performanceSlug);


    let performanceInEvent;
  try {
    const queriedPerformance = await getPerformanceFromEvent(
      mappedEvent.id,
      performanceDate,
      performanceTime
    );

    const dateStr = queriedPerformance.date.toISOString().slice(0, 10);
    const timeStr = queriedPerformance.time!.toISOString().slice(11, 16);
  
    performanceInEvent = mappedEvent.performances.find(
      (p) => p.date === dateStr && p.time === timeStr
    );
  } catch (error) {
    console.error("Error fetching performance:", error);
  }

  return {
    props: {
      eventData: mappedEvent,
      performanceInEvent: performanceInEvent || null,
    },
  };
};
