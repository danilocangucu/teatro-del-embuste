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
import {
  getDefaultTimeByEventId,
  getShowIdByEventId,
} from "@/services/eventService";
import { getShowSlugFromShowId } from "@/services/showService";
import { reservation_status } from "@prisma/client";
import {
  formatDateTimeForURL,
  getISODate,
  getISOTime,
} from "@/utils/eventUtils";

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

  const reservation = await getReservation(boldOrderIdWithoutSufix);

  if (!reservation) {
    console.warn(
      "[VERIFICACION] No reservation found for bold-order-id YET:",
      boldOrderId
    );
    return (
      <>
        <Stepper currentStep="Verificación" />
        <PollingReservation boldOrderIdWithoutSufix={boldOrderIdWithoutSufix} />
      </>
    );
  }
  if (
    reservation.status !== reservation_status.confirmed &&
    reservation.status !== reservation_status.cancelled
  ) {
    console.warn(
      "[VERIFICACION] Reservation status is not confirmed or cancelled, current status:",
      reservation.status
    );
    return (
      <>
        <Stepper currentStep="Verificación" />
        <PollingReservation boldOrderIdWithoutSufix={boldOrderIdWithoutSufix} />
      </>
    );
  }

  const eventId = await getEventIdByPerformanceId(reservation.performance_id);

  if (!eventId) {
    console.warn(
      "[VERIFICACION] No event found for performance_id:",
      reservation.performance_id
    );
    notFound();
  }

  const reqHeaders = await headers();
  console.log("[VERIFICACION] Request headers obtained");

  const reservationFromCookie = getReservationFromCookieViaHeaders(
    reqHeaders,
    eventId,
    reservation.performance_id
  );
  if (!reservationFromCookie) {
    console.warn("[VERIFICACION] No reservation found in cookie");
    notFound();
  }
  console.log("[VERIFICACION] Reservation from cookie:", reservationFromCookie);

  if (reservationFromCookie.reservationId !== reservation.id) {
    console.warn(
      "[VERIFICACION] Reservation ID mismatch between cookie and database"
    );
    notFound();
  }

  if (reservationFromCookie.userId !== reservation.user_id) {
    console.warn(
      "[VERIFICACION] User ID mismatch between cookie and reservation"
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

  let eventDefaultTime;
  if (!performance.time) {
    console.warn(
      "[VERIFICACION] Performance time is not set, using event default time"
    );
    eventDefaultTime = await getDefaultTimeByEventId(eventId);
  }

  const performanceTime = performance.time || eventDefaultTime!;
  const performanceSlug = formatDateTimeForURL(
    getISODate(performance.date),
    getISOTime(performanceTime)
  );

  console.log("[VERIFICACION] Performance slug formatted:", performanceSlug);

  console.log(
    "[VERIFICACION] Reservation verified, redirecting to /confirmacion"
  );

  redirect(`/boletas/${showSlug}/${performanceSlug}/confirmacion`);
}
