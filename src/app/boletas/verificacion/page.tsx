import { notFound, redirect } from "next/navigation";
import { getReservation } from "@/services/ticketService";
import { PollingReservation } from "@/components/Ticket/PollingReservation";
import { Stepper } from "@/components/shared/Stepper";
import { headers } from "next/headers";
import { getReservationFromCookieViaHeaders } from "@/services/cookieService";
import {
  getEventIdByPerformanceId,
  getPerformanceByReservationId,
} from "@/services/performanceService";
import { getShowIdByEventId } from "@/services/eventService";
import { getShowSlugFromShowId } from "@/services/showService";
import { reservation_status } from "@prisma/client";

// TODO how could I block access to this page if someone puts a fake bold-order-id in the URL?

const TICKET_SUFIX = process.env.TICKET_SUFIX!;

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const boldOrderId =
    typeof params["bold-order-id"] === "string"
      ? params["bold-order-id"]
      : undefined;

  if (!boldOrderId) {
    console.warn("[VERIFICACION] No bold-order-id found in search params");
    notFound();
  }

  console.log("[VERIFICACION] Bold order ID received:", boldOrderId);

  const boldOrderIdWithoutSufix = boldOrderId.replace(TICKET_SUFIX, "");

  // TODO retry to fetch reservation,
  const reservation = await getReservation(boldOrderIdWithoutSufix);

  if (!reservation) {
    console.warn(
      "[VERIFICACION] No reservation found for bold-order-id:",
      boldOrderId
    );
  } else {
    console.log("[VERIFICACION] Reservation fetched:", reservation);
    if (reservation.status !== reservation_status.confirmed) {
      console.warn(
        "[VERIFICACION] Reservation status is not confirmed, current status:",
        reservation.status
      );
      return (
    <>
      <Stepper currentStep="Verificación" />
      <PollingReservation boldOrderId={boldOrderId}/>
    </>
      )
    }

    const eventId = await getEventIdByPerformanceId(reservation.performance_id);

    if (!eventId) {
      console.warn(
        "[VERIFICACION] No event found for performance_id:",
        reservation.performance_id
      );
      notFound();
    }
    // Get reservation from cookie
    const reqHeaders = await headers();
    console.log("[VERIFICACION] Request headers obtained");
    // TODO verificacion should also check if user is the same from the cookie & reservation
    const reservationFromCookie = await getReservationFromCookieViaHeaders(
      reqHeaders,
      eventId,
      reservation.performance_id
    );
    if (!reservationFromCookie) {
      console.warn("[VERIFICACION] No reservation found in cookie");
      notFound();
    }
    console.log(
      "[VERIFICACION] Reservation from cookie:",
      reservationFromCookie
    );

    if (reservationFromCookie.reservationId !== reservation.id) {
      console.warn(
        "[VERIFICACION] Reservation ID mismatch between cookie and database"
      );
      notFound();
    }

    // TODO verification should check if expiresAt is still valid

    const performance = await getPerformanceByReservationId(reservation.id);
    if (!performance) {
      console.warn(
        "[VERIFICACION] No performance found for reservation ID:",
        reservation.id
      );
      notFound();
    }

    console.log("[VERIFICACION] Performance fetched:", performance);

    const showId = await getShowIdByEventId(eventId);

    if (!showId) {
      console.warn("[VERIFICACION] No show found for event ID:", eventId);
      notFound();
    }

    console.log("[VERIFICACION] Show ID fetched:", showId);

    const showSlug = await getShowSlugFromShowId(showId);

    if (!showSlug) {
      console.warn("[VERIFICACION] No show slug found for show ID:", showId);
      notFound();
    }

    console.log("[VERIFICACION] Show slug fetched:", showSlug);

    // TODO check how to make the performanceSlug
    // const performanceSlug = formatDateTimeForURL(performance.date.toISOString(), performance.time!.toISOString());

    const performanceSlug = "07-06-25-6PM";

    console.log("[VERIFICACION] Performance slug formatted:", performanceSlug);

    console.log(
      "[VERIFICACION] Reservation verified, redirecting to /confirmacion"
    );

    redirect(`/boletas/${showSlug}/${performanceSlug}/confirmacion`);
  }
}
