import { notFound } from "next/navigation";
import { getShowIdAndTitle } from "@/services/showService";
import { getEvent } from "@/services/eventService";
import { parsePerformanceSlug } from "@/utils/performanceUtils";
import { getPerformanceFromEvent } from "@/services/performanceService";
import { getReservationFromCookieViaHeaders } from "@/services/cookieService";
import { headers } from "next/headers";
import {
  getReservation,
  getReservationItemsByReservationId,
  updateReservationStatus,
} from "@/services/ticketService";
import { UserOptions } from "@/components/Ticket/UserOptions";
import { Stepper } from "@/components/shared/Stepper";
import { reservation_status } from "@prisma/client";
import { getUser } from "@/services/userService";
import ReservationCountdown from "@/components/Ticket/ReservationCountdown";

// TODO should check if there is an userId in the cookie. if there is, could mean that the user want's to edit their info so load Identidad with user info. activates the "edit" mode and button to save changes should only be active if there are changes made

export default async function IdentidadPage({
  params,
}: {
  params: Promise<{ showSlug: string; performanceSlug: string }>;
}) {
  const { showSlug, performanceSlug } = await params;

  console.log("Starting IdentidadPage for:", { showSlug, performanceSlug });

  // Fetch show and event info
  let showId: string;
  try {
    ({ showId } = await getShowIdAndTitle(showSlug));
    console.log("Fetched showId:", showId);
  } catch (err) {
    console.error("Error fetching showId:", err);
    notFound();
  }

  let event;
  try {
    event = await getEvent(showId);
    console.log("Fetched event:", { id: event.id });
  } catch (err) {
    console.error("Error fetching event:", err);
    notFound();
  }

  // Parse performance slug
  const { performanceDate, performanceTime } =
    parsePerformanceSlug(performanceSlug);
  console.log("Parsed performance slug:", { performanceDate, performanceTime });

  // Get performance
  let performance;
  try {
    performance = await getPerformanceFromEvent(
      event.id,
      performanceDate,
      performanceTime
    );
    console.log(
      "Fetched performance:",
      performance
        ? { id: performance.id, date: performanceDate, time: performanceTime }
        : null
    );
  } catch (err) {
    console.error("Error fetching performance:", err);
    notFound();
  }
  if (!performance) {
    console.warn("Performance not found");
    notFound();
  }

  // Get reservation from cookie
  const reqHeaders = await headers();
  console.log("Request headers obtained");
  const reservationFromCookie = getReservationFromCookieViaHeaders(
    reqHeaders,
    event.id,
    performance.id
  );
  if (!reservationFromCookie) {
    console.warn("No reservation found in cookie");
    notFound();
  }
  console.log("Reservation from cookie:", reservationFromCookie);

  // Check reservation expiration
  const now = new Date();
  if (reservationFromCookie.expiresAt < now) {
    console.warn(
      "Reservation expired:",
      reservationFromCookie.expiresAt,
      "now:",
      now
    );
    notFound();
  }
  console.log("Reservation not expired");

  // Fetch reservation from DB
  const reservationFromDB = await getReservation(
    reservationFromCookie.reservationId
  );
  if (!reservationFromDB) {
    console.warn(
      "No reservation found in DB for id:",
      reservationFromCookie.reservationId
    );
    notFound();
  }
  console.log("Reservation from DB:", reservationFromDB);

  // TODO cookie expiration time should be the same as the DB reservation expires_at
  // Check expiration consistency
  //   if (reservationFromCookie.expiresAt !== reservationFromDB.expires_at) {
  //     console.warn(
  //       "Mismatch between cookie expiresAt and DB expires_at",
  //       reservationFromCookie.expiresAt,
  //       reservationFromDB.expires_at
  //     );
  //     notFound();
  //   }
  //   console.log("Expiration dates match");


  // Check reservation belongs to this performance
  if (reservationFromDB.performance_id !== performance.id) {
    console.warn(
      "Reservation performance_id mismatch",
      reservationFromDB.performance_id,
      performance.id
    );
    notFound();
  }
  console.log("Reservation matches performance");

  if (
    !(
      [
        reservation_status.selecting,
        reservation_status.identifying,
        reservation_status.reviewing,
        reservation_status.paying,
      ] as readonly reservation_status[]
    ).includes(reservationFromDB.status)
  ) {
    console.warn(`Invalid reservation status: ${reservationFromDB.status}`);
    notFound();
  }

  if (reservationFromDB.status !== reservation_status.identifying) {
    const updatedReservationStatus = await updateReservationStatus(
      reservationFromDB.id,
      reservation_status.identifying
    );

    console.log(
      `[IDENTIDAD PAGE] Updated reservation ${reservationFromDB.id} status to 'identifying':`,
      updatedReservationStatus
    );
  } else {
    console.log(
      `[IDENTIDAD PAGE] Reservation ${reservationFromDB.id} is already in 'identifying' status`
    );
  }

  const reservationItems = await getReservationItemsByReservationId(
    reservationFromDB.id
  );

  if (!reservationItems || reservationItems.length === 0) {
    console.warn(
      "No reservation items found for reservation id:",
      reservationFromDB.id
    );
    notFound();
  }

  if (!reservationItems.some((item) => item.quantity >= 1)) {
    console.warn("No reservation item has quantity >= 1");
    notFound();
  }
  console.log("At least one reservation item has quantity >= 1");

  let user;
  if (reservationFromDB.user_id) {
    console.log("Fetching user for reservation:", reservationFromDB.user_id);
    user = await getUser(reservationFromDB.user_id);
  }

  return (
    <>
      <Stepper currentStep="Identidad" />
      <ReservationCountdown
        expiresAt={reservationFromDB.expires_at}
        timeNow={now}
      />
      <UserOptions reservationId={reservationFromCookie.reservationId} eventId={event.id} performanceId={performance.id} showSlug={showSlug} performanceSlug={performanceSlug} user={user} />
    </>
  );
}
