import { TicketType } from "@/types/Event";
import { NextResponse } from "next/server";

const RESERVATION_COOKIE_KEY = "ticket-reservation";

function createReservationCookieKey(eventId: string, performanceId: string) {
  return `${RESERVATION_COOKIE_KEY}-${eventId}-${performanceId}`;
}

export function setReservationInCookie(
  response: NextResponse,
  eventId: string,
  performanceId: string,
  reservationId: string,
  expiresAt: Date,
  reservationItems: { id: string; ticketType: TicketType }[]
) {
  const key = createReservationCookieKey(eventId, performanceId);
  console.log("%%%%%%%%%%%%%%%");
  console.log("setReservationInCookie – expiresAt", expiresAt);
  console.log("%%%%%%%%%%%%%%%");

  const data = {
    reservationId,
    reservationItems,
    expiresAt: new Date(expiresAt).toISOString(),
  };

  response.cookies.set(key, JSON.stringify(data), {
    path: "/",
    httpOnly: true,
    maxAge: 15 * 60,
  });
}

export function getReservationFromCookieViaHeaders(
  reqHeaders: Headers,
  eventId: string,
  performanceId: string
): {
  reservationId: string;
  reservationItems: { id: string; ticketType: TicketType }[];
  expiresAt: Date
  userId: string | null;
} | null {
  const key = `${RESERVATION_COOKIE_KEY}-${eventId}-${performanceId}`;
  console.log(
    "🔍 [getReservationFromCookieViaHeaders] Looking for cookie with key:",
    key
  );

  const cookieHeader = reqHeaders.get("cookie");
  console.log(
    "🔍 [getReservationFromCookieViaHeaders] Raw Cookie Header:",
    cookieHeader
  );

  if (!cookieHeader) {
    console.warn(
      "⚠️ [getReservationFromCookieViaHeaders] No cookie header found"
    );
    return null;
  }

  const cookiesMap = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, decodeURIComponent(v.join("="))];
    })
  );

  console.log(
    "🗺️ [getReservationFromCookieViaHeaders] Parsed cookies map:",
    cookiesMap
  );

  const raw = cookiesMap[key];

  if (!raw) {
    console.warn(
      "⚠️ [getReservationFromCookieViaHeaders] Cookie not found for key:",
      key
    );
    return null;
  }

  console.log("📦 [getReservationFromCookieViaHeaders] Raw cookie value:", raw);

  try {
    const parsed = JSON.parse(raw);
    console.log(
      "✅ [getReservationFromCookieViaHeaders] Parsed cookie data:",
      parsed
    );

    if (
      !parsed.reservationId ||
      !Array.isArray(parsed.reservationItems) ||
      !parsed.expiresAt
    ) {
      console.warn(
        "⚠️ [getReservationFromCookieViaHeaders] Invalid cookie structure"
      );
      return null;
    }

    return {
      reservationId: parsed.reservationId,
      reservationItems: parsed.reservationItems,
      userId: parsed.userId || null,
      expiresAt: new Date(parsed.expiresAt),
    };
  } catch (err) {
    console.warn(
      "❌ [getReservationFromCookieViaHeaders] Failed to parse reservation cookie",
      err
    );
    return null;
  }
}

export function getServersTimeNow() {
  return new Date();
}
