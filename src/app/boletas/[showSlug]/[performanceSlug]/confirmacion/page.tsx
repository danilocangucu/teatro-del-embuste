import { notFound, redirect } from "next/navigation";
import { getShowIdAndTitle } from "@/services/showService";
import { getEvent } from "@/services/eventService";
import { parsePerformanceSlug } from "@/utils/performanceUtils";
import { getPerformanceFromEvent } from "@/services/performanceService";
import { getReservationFromCookieViaHeaders } from "@/services/cookieService";
import { headers } from "next/headers";
import { getReservation } from "@/services/ticketService";
import { Stepper } from "@/components/shared/Stepper";
import { ResultComponent } from "@/components/Ticket/ResultComponent";
import { reservation_status } from "@prisma/client";

export default async function ConfirmacionPage({
  params,
}: {
  params: Promise<{ showSlug: string; performanceSlug: string }>;
}) {
  const { showSlug, performanceSlug } = await params;

  console.log("Starting ConfirmacionPage for:", { showSlug, performanceSlug });

  // Fetch show and event info
  let showId: string;
  try {
    ({ showId } = await getShowIdAndTitle(showSlug));
    console.log("[CONFIRMACION] Fetched showId:", showId);
  } catch (err) {
    console.error("[CONFIRMACION] Error fetching showId:", err);
    notFound();
  }

  let event;
  try {
    event = await getEvent(showId);
    console.log("[CONFIRMACION] Fetched event:", { id: event.id });
  } catch (err) {
    console.error("[CONFIRMACION] Error fetching event:", err);
    notFound();
  }

  // Parse performance slug
  const { performanceDate, performanceTime } =
    parsePerformanceSlug(performanceSlug);
  console.log("[CONFIRMACION] Parsed performance slug:", {
    performanceDate,
    performanceTime,
  });

  // Get performance
  let performance;
  try {
    performance = await getPerformanceFromEvent(
      event.id,
      performanceDate,
      performanceTime
    );
    console.log(
      "[CONFIRMACION] Fetched performance:",
      performance
        ? { id: performance.id, date: performanceDate, time: performanceTime }
        : null
    );
  } catch (err) {
    console.error("[CONFIRMACION] Error fetching performance:", err);
    notFound();
  }
  if (!performance) {
    console.warn("[CONFIRMACION] Performance not found");
    notFound();
  }

  // Get reservation from cookie
  const reqHeaders = await headers();
  console.log("[CONFIRMACION] Request headers obtained");
  const reservationFromCookie = getReservationFromCookieViaHeaders(
    reqHeaders,
    event.id,
    performance.id
  );
  if (!reservationFromCookie) {
    console.warn("[CONFIRMACION] No reservation found in cookie");
    notFound();
  }
  console.log("[CONFIRMACION] Reservation from cookie:", reservationFromCookie);

  // TODO verification should check if expiresAt is still valid

  const reservation = await getReservation(reservationFromCookie.reservationId);

  if (!reservation) {
    console.warn("[CONFIRMACION] Reservation not found in database");
    notFound();
  }

  console.log("[CONFIRMACION] Reservation found in DB:", reservation);

  if (
    reservation.status !== reservation_status.confirmed &&
    reservation.status !== reservation_status.cancelled
  ) {
    console.warn(
      `[CONFIRMACION] Reservation not confirmed or cancelled, redirecting to showSlug/performanceSlug. Status: ${reservation.status}`
    );
    redirect(`/boletas/${showSlug}/${performanceSlug}`);
  }

  

  // No reservation yet → render polling component
  return (
    <>
      <Stepper currentStep="Confirmación" />
      <ResultComponent reservation={reservation} eventId={event.id} performanceId={performance.id} />
    </>
  );
}
