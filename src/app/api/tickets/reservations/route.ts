import { setReservationInCookie } from "@/services/cookieService";
import {
  getDefaultTimeByEventId,
  getShowIdByEventId,
} from "@/services/eventService";
import {
  getEventIdByPerformanceId,
  getPerformance,
} from "@/services/performanceService";
import { getShowSlugFromShowId } from "@/services/showService";
import { getReservation } from "@/services/reservationService";
import {
  formatDateTimeForURL,
  getISODate,
  getISOTime,
} from "@/utils/eventUtils";
import { reservation_status } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { eventId, performanceId, reservationId, expiresAt, reservationItems } =
    await req.json();

  const response = NextResponse.json({ success: true });

  setReservationInCookie(
    response,
    eventId,
    performanceId,
    reservationId,
    expiresAt,
    reservationItems
  );

  return response;
}

export async function PUT(req: Request) {
  const { eventId, performanceId, userId } = await req.json();

  const reqCookies = req.headers.get("cookie") || "";

  const key = `ticket-reservation-${eventId}-${performanceId}`;
  const cookiesMap = Object.fromEntries(
    reqCookies.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, decodeURIComponent(v.join("="))];
    })
  );

  const existing = cookiesMap[key];

  if (!existing) {
    console.warn("⚠️ No existing cookie found to update.");
    return NextResponse.json({ success: false, error: "No cookie found." });
  }

  let parsed;
  try {
    parsed = JSON.parse(existing);
  } catch (err) {
    console.error("Failed to parse cookie", existing, err);
    return NextResponse.json({ success: false, error: "Bad cookie format." });
  }

  parsed.userId = userId;

  const expiresAt = new Date(parsed.expiresAt).getTime();
  const now = Date.now();
  const remainingMs = expiresAt - now;
  const remainingSeconds = Math.max(1, Math.floor(remainingMs / 1000)); // avoid 0 or negative

  const response = NextResponse.json({ success: true });
  response.cookies.set(key, JSON.stringify(parsed), {
    path: "/",
    httpOnly: true,
    maxAge: remainingSeconds,
  });

  return response;
}

export async function GET(req: Request) {
  console.log("🔍 Checking reservation status...");
  const reservationIdFromParams = new URL(req.url).searchParams.get("id");

  if (!reservationIdFromParams) {
    console.warn("⚠️ No reservation ID found in query params.");
    return NextResponse.json({
      success: false,
      error: "No reservation ID provided.",
    });
  }

  const reservation = await getReservation(reservationIdFromParams);

  if (!reservation) {
    console.warn("⚠️ No reservation found for ID:", reservationIdFromParams);
    return NextResponse.json({
      success: false,
      error: "Reservation not found.",
    });
  }

  console.log("✅ Reservation found:", reservation);

  if (!reservation.user_id) {
    console.warn("⚠️ No user ID associated with reservation.");
    return NextResponse.json({
      success: false,
      error: "No user ID associated with reservation.",
    });
  }

  if (!reservation.bold_payment_id) {
    console.warn("⚠️ No bold payment ID associated with reservation.");
    return NextResponse.json({
      success: false,
      error: "No bold payment ID associated with reservation.",
    });
  }

  if (
    reservation.status !== reservation_status.confirmed &&
    reservation.status !== reservation_status.cancelled
  ) {
    console.warn(
      "⚠️ Reservation status is not confirmed or cancelled:",
      reservation.status
    );
    return NextResponse.json({
      success: false,
      error: "Reservation status is not confirmed or cancelled.",
    });
  }

  console.log("✅ Reservation status is valid:", reservation.status);

  const performance = await getPerformance(reservation.performance_id);

  if (!performance) {
    console.warn("⚠️ No performance found for reservation:", reservation);
    return NextResponse.json({
      success: false,
      error: "Performance not found.",
    });
  }

  const eventId = await getEventIdByPerformanceId(performance.id);
  if (!eventId) {
    console.warn("⚠️ No event found for performance:", performance);
    return NextResponse.json({
      success: false,
      error: "Event not found.",
    });
  }

  let eventDefaultTime;
  if (!performance.time) {
    console.warn("⚠️ Performance time is not set, using event default time.");
    eventDefaultTime = await getDefaultTimeByEventId(eventId);
  }

  const performanceTime = performance.time || eventDefaultTime!;
  const performanceSlug = formatDateTimeForURL(
    getISODate(performance.date),
    getISOTime(performanceTime)
  );

  const showId = await getShowIdByEventId(eventId);

  if (!showId) {
    console.warn("⚠️ No show found for event ID:", eventId);
    return NextResponse.json({
      success: false,
      error: "Show not found.",
    });
  }

  const showSlug = await getShowSlugFromShowId(showId);

  if (!showSlug) {
    console.warn("⚠️ No show slug found for show ID:", showId);
    return NextResponse.json({
      success: false,
      error: "Show slug not found.",
    });
  }

  return NextResponse.json({
    success: true,
    reservation: {
      status: reservation.status,
      expiresAt: reservation.expires_at,
      performanceSlug,
      showSlug,
    },
  });
}

export async function DELETE(req: Request) {
  const { eventId, performanceId } = await req.json();

  const key = `ticket-reservation-${eventId}-${performanceId}`;
  const response = NextResponse.json({ success: true });

  response.cookies.set(key, "", {
    path: "/",
    maxAge: 0,
  });

  return response;
}