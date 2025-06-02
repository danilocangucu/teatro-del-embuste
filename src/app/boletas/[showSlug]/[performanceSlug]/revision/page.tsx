import { notFound } from "next/navigation";
import { getShowIdAndTitle } from "@/services/showService";
import { getEvent } from "@/services/eventService";
import { parsePerformanceSlug } from "@/utils/performanceUtils";
import { getPerformanceFromEvent } from "@/services/performanceService";
import { getReservationFromCookieViaHeaders } from "@/services/cookieService";
import { headers } from "next/headers";
import {
  getDiscountsByIds,
  getReservation,
  getReservationItemsByReservationId,
} from "@/services/ticketService";
import { Stepper } from "@/components/shared/Stepper";
import { Review } from "@/components/Ticket/Review";
import { getUser } from "@/services/userService";
import { $Enums, reservation_status } from "@prisma/client";

export default async function RevisionPage({
  params,
}: {
  params: Promise<{ showSlug: string; performanceSlug: string }>;
}) {
  const { showSlug, performanceSlug } = await params;

  console.log("Starting RevisiónPage for:", { showSlug, performanceSlug });

  let showId: string;
  let showTitle: string;
  try {
    ({ showId, showTitle } = await getShowIdAndTitle(showSlug));
    console.log("[Revisión] Fetched showId:", showId);
  } catch (err) {
    console.error("[Revisión] Error fetching showId:", err);
    notFound();
  }

  let event;
  try {
    event = await getEvent(showId);
    console.log("[Revisión] Fetched event:", { id: event.id });
  } catch (err) {
    console.error("[Revisión] Error fetching event:", err);
    notFound();
  }

  const { performanceDate, performanceTime } =
    parsePerformanceSlug(performanceSlug);
  console.log("[Revisión] Parsed performance slug:", {
    performanceDate,
    performanceTime,
  });

  let performance;
  try {
    performance = await getPerformanceFromEvent(
      event.id,
      performanceDate,
      performanceTime
    );
    console.log(
      "[Revisión] Fetched performance:",
      performance
        ? { id: performance.id, date: performanceDate, time: performanceTime }
        : null
    );
  } catch (err) {
    console.error("[Revisión] Error fetching performance:", err);
    notFound();
  }
  if (!performance) {
    console.warn("[Revisión] Performance not found");
    notFound();
  }

  const reqHeaders = await headers();

  const reservationFromCookie = await getReservationFromCookieViaHeaders(
    reqHeaders,
    event.id,
    performance.id
  );

  if (!reservationFromCookie) {
    console.warn("[Revisión] No reservation found in cookie");
    notFound();
  }
  console.log("[Revisión] Reservation from cookie:", reservationFromCookie);

  const now = new Date();
  if (reservationFromCookie.expiresAt < now) {
    console.warn(
      "[Revisión] Reservation expired:",
      reservationFromCookie.expiresAt,
      "now:",
      now
    );
    notFound();
  }
  console.log("[Revisión] Reservation not expired");

  if (!reservationFromCookie.userId || reservationFromCookie.userId === "") {
    console.warn("[Revisión] No userId found in reservation cookie");
    notFound();
  }

  const user = await getUser(reservationFromCookie.userId);

  if (!user) {
    console.warn(
      "[Revisión] User not found for userId:",
      reservationFromCookie.userId
    );
    notFound();
  }

  const reservationFromDB = await getReservation(
    reservationFromCookie.reservationId
  );
  if (!reservationFromDB) {
    console.warn(
      "[Revisión] No reservation found in DB for id:",
      reservationFromCookie.reservationId
    );
    notFound();
  }
  console.log("[Revisión] Reservation from DB:", reservationFromDB);

  if (reservationFromCookie.reservationId !== reservationFromDB.id) {
    console.warn(
      "[Revisión] Reservation ID mismatch between cookie and DB:",
      reservationFromCookie.reservationId,
      reservationFromDB.id
    );
    notFound();
  }

  if (reservationFromDB.user_id !== reservationFromCookie.userId) {
    console.warn(
      "[Revisión] Reservation user_id mismatch between cookie and DB:",
      reservationFromDB.user_id,
      reservationFromCookie.userId
    );
    notFound();
  }

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
      "[Revisión] Reservation performance_id mismatch",
      reservationFromDB.performance_id,
      performance.id
    );
    notFound();
  }
  console.log("[Revisión] Reservation matches performance");

  if (reservationFromDB.status !== reservation_status.reviewing) {
    console.warn(
      "[Revisión] Reservation status not 'reviewing':",
      reservationFromDB.status
    );
    notFound();
  }
  console.log("[Revisión] Reservation status is reviewing");

  const reservationItems = await getReservationItemsByReservationId(
    reservationFromDB.id
  );

  if (!reservationItems || reservationItems.length === 0) {
    console.warn(
      "[Revisión] No reservation items found for reservation id:",
      reservationFromDB.id
    );
    notFound();
  }

  if (!reservationItems.some((item) => item.quantity >= 1)) {
    console.warn("[Revisión] No reservation item has quantity >= 1");
    notFound();
  }
  console.log("[Revisión] At least one reservation item has quantity >= 1");

  const validReservationItems = reservationItems.filter(
    (item) => item.quantity >= 1
  );

  const discountedItems = validReservationItems.filter(
    (item) => item.discount_id !== null
  );
  const discountTicketMap = new Map<string, Set<$Enums.ticket_type>>();
  for (const item of discountedItems) {
    if (item.discount_id) {
      if (!discountTicketMap.has(item.discount_id)) {
        discountTicketMap.set(item.discount_id, new Set());
      }
      discountTicketMap.get(item.discount_id)!.add(item.ticket_type);
    }
  }

  const discountIdsToFetch = [...discountTicketMap.keys()];

  const discounts = await getDiscountsByIds(discountIdsToFetch);

  if (!discounts || discounts.length === 0) {
    console.warn("[Revisión] No discounts found for reservation items");
    notFound();
  }

  console.log("[Revisión] Discounts fetched:", discounts);

  const discountLookup = new Map(discounts.map((d) => [d.id, d]));

  const enrichedReservationItems = validReservationItems.map((item) => {
    const discount = item.discount_id
      ? discountLookup.get(item.discount_id)
      : null;

    return {
      ...item,
      discount: discount
        ? {
          ...discount,
          value: discount.value.toNumber(),
        }
        : null,
    };
  });

  return (
    <>
      <Stepper currentStep="Revisión" />
      <Review
        showTitle={showTitle}
        performance={performance}
        reservation={reservationFromDB}
        reservationItems={enrichedReservationItems}
        user={user}
        showSlug={showSlug}
        performanceSlug={performanceSlug}
      />
    </>
  );
}
