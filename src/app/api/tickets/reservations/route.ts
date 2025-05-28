import { setReservationInCookie } from "@/services/cookieService";
import { getReservation } from "@/services/ticketService";
import { NextResponse } from "next/server";

const TICKET_SUFIX = process.env.TICKET_SUFIX!;

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
  // TODO do I still need eventId and performanceId to check the reservation status?!
  const eventId = "e410f25f-b097-47a2-96cc-ed6b23978f34";
  const performanceId = "87735ae2-f147-4a1c-9f78-146e6dadca75";

  // TODO get reservationId from query params
  const reservationIdFromParams = new URL(req.url).searchParams.get("id");

  if (!reservationIdFromParams) {
    console.warn("⚠️ No reservation ID found in query params.");
    return NextResponse.json({
      success: false,
      error: "No reservation ID provided.",
    });
  }

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
    console.warn("⚠️ No existing cookie found.");
    return NextResponse.json({
      success: false,
      error: "No cookie found.",
      status: 400,
    });
  }

  let parsed;
  try {
    parsed = JSON.parse(existing);
  } catch (err) {
    console.error("Failed to parse cookie", existing, err);
    return NextResponse.json({ success: false, error: "Bad cookie format." });
  }

  const reservationId = parsed.reservationId;
  if (!reservationId) {
    console.warn("⚠️ No reservation ID found in cookie.");
    return NextResponse.json({
      success: false,
      error: "No reservation ID found.",
      status: 400,
    });
  }

  if (`${reservationId}${TICKET_SUFIX}` !== reservationIdFromParams) {
    console.warn(
      "⚠️ Reservation ID from cookie with TICKET_SUFIX does not match query param."
    );
    console.warn("Cookie reservation ID with TICKET_SUFIX:", reservationId);
    console.warn("Query param reservation ID:", reservationIdFromParams);
    return NextResponse.json({
      success: false,
      error: "Reservation ID mismatch.",
    });
  }

  const userId = parsed.userId;
  if (!userId) {
    console.warn("⚠️ No user ID found in cookie.");
    return NextResponse.json({ success: false, error: "No user ID found." });
  }

  const reservation = await getReservation(reservationId);

  if (!reservation) {
    console.warn("⚠️ No reservation found for ID:", reservationId);
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

  if (reservation.user_id !== userId) {
    console.warn("⚠️ User ID from cookie does not match reservation user ID.");
    return NextResponse.json({ success: false, error: "User ID mismatch." });
  }

  console.log("✅ User ID matches reservation user ID:", userId);

  if (!reservation.bold_payment_id) {
    console.warn("⚠️ No bold payment ID associated with reservation.");
    return NextResponse.json({
      success: false,
      error: "No bold payment ID associated with reservation.",
    });
  }

  return NextResponse.json({
    success: true,
    reservation: {
      status: reservation.status,
      expiresAt: reservation.expires_at,
    },
  });
}
