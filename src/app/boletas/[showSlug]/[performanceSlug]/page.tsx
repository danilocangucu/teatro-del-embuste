import { parsePerformanceSlug } from "@/utils/performanceUtils";
import { getShowIdAndTitle } from "@/services/showService";
import { getEvent } from "@/services/eventService";
import { sanitizeEvent } from "@/utils/eventUtils";
import { filterUpcomingPerformances } from "@/utils/sharedUtils";
import { getPerformanceFromEvent } from "@/services/performanceService";
import { notFound } from "next/navigation";
import {
  PerformanceDTO,
  EventDTO,
  EventFromDB,
  TicketType,
} from "@/types/Event";
import { isDiscountActive } from "@/utils/ticketsUtils";
import { getTicketStatus } from "@/utils/showUtils";
import { TicketSelectionPage } from "@/components/Ticket/TicketSelectionPage";
import {
  createReservation,
  createReservationItem,
  getReservationStatus,
} from "@/services/ticketService";
import { headers } from "next/headers";
import {
  getReservationFromCookieViaHeaders,
  getServersTimeNow,
} from "@/services/cookieService";
import { reservation_status } from "@prisma/client";

// TODO performance page should not create a new reservation if there is no reservation in cookie & available seats of performance === 0
export default async function PerformancePage({
  params,
}: {
  params: Promise<{ showSlug: string; performanceSlug: string }>;
}) {
  const { showSlug, performanceSlug } = await params;

  let showId: string;
  let showTitle: string;
  try {
    ({ showId, showTitle } = await getShowIdAndTitle(showSlug));
  } catch (err) {
    console.error("Error fetching show:", err);
    notFound();
  }

  let mappedEvent: EventDTO;
  try {
    const eventFromDB = await getEvent(showId);
    const filteredPerformances = filterUpcomingPerformances(eventFromDB);
    // TODO this sanitizeEvent maybe is only for buying single ticket or something
    mappedEvent = sanitizeEvent({
      ...eventFromDB,
      performances: filteredPerformances,
    } as EventFromDB);
    mappedEvent.id = eventFromDB.id;
  } catch (err) {
    console.error("Error fetching event:", err);
    notFound();
  }

  const { performanceDate, performanceTime } =
    parsePerformanceSlug(performanceSlug);

  let performanceInEvent: PerformanceDTO | null = null;
  try {
    const queriedPerformance = await getPerformanceFromEvent(
      mappedEvent.id,
      performanceDate,
      performanceTime
    );

    performanceInEvent =
      mappedEvent.performances.find((p) => p.id === queriedPerformance.id) ||
      null;
  } catch (err) {
    console.error("Error fetching performance:", err);
  }

  // TODO could be necessary to handle more discount cases
  const discountRule = mappedEvent.discountRules?.find(
    (rule) => rule.type === "time_based"
  );

  const discountActive =
    discountRule && isDiscountActive(discountRule, mappedEvent.startDate);

  let ticketStatus;
  if (performanceInEvent) {
    ticketStatus = getTicketStatus(
      performanceInEvent.availableSeats,
      mappedEvent.totalSeats
    );
  }

  let reservationId = "";
  let timeNow = new Date();
  let expiresAt = new Date();
  let reservationItems: { id: string; ticketType: TicketType }[] = [];
  let reservationWasCreatedNow = false;
  let reservationStatus: reservation_status | null = null;
  if (performanceInEvent) {
    const reqHeaders = await headers();

    const existingReservation = getReservationFromCookieViaHeaders(
      reqHeaders,
      mappedEvent.id,
      performanceInEvent.id
    );
    console.log("existingReservation fetched");

    if (existingReservation) {
      reservationId = existingReservation.reservationId;
      reservationItems = existingReservation.reservationItems;
      timeNow = getServersTimeNow();
      expiresAt = existingReservation.expiresAt;

      if (timeNow.getTime() >= expiresAt.getTime()) {
        console.error(
          "Reservation creation failed: Time now is after expiration time."
        );
        return notFound();
      }

      reservationStatus = await getReservationStatus(reservationId);
    } else {
      const createdReservation = await createReservation(
        performanceInEvent.id,
        reservation_status.selecting,
        null
      );
      reservationId = createdReservation.id;
      timeNow = createdReservation.timeNow;
      expiresAt = createdReservation.expiresAt;
      reservationStatus = reservation_status.selecting;

      reservationItems = await Promise.all(
        mappedEvent.pricings.map((pricing) =>
          createReservationItem(
            reservationId,
            pricing.type,
            pricing.price,
            discountActive ? discountRule?.discount.id : null
          )
        )
      );

      reservationWasCreatedNow = true;
    }

    console.log("reservationId", reservationId);
    console.log("reservationItems", reservationItems);
  }

  return (
    <TicketSelectionPage
      // TODO organise showTitle and showSlug to be passed together
      showTitle={showTitle}
      performanceInEvent={performanceInEvent}
      // TODO: maybe its not necessary to pass down the whole mappedEvent or it can be fetched with the necessary info only: startDate, totalSeats, pricings, discontRules and performances
      mappedEvent={mappedEvent}
      discountRule={discountRule}
      discountActive={discountActive}
      ticketStatus={ticketStatus}
      reservation={{
        id: reservationId,
        items: reservationItems,
        timeNow,
        expiresAt,
        status: reservationStatus,
      }}
      reservationWasCreatedNow={reservationWasCreatedNow}
    />
  );
}
