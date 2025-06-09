import { NextResponse } from "next/server";
import { JwtPayload, SignOptions, sign, verify } from "jsonwebtoken";

import { TicketType } from "@/types/Event";
import { decrypt, encrypt } from "@/utils/cryptoUtils";
import { JWT_SECRET, RESERVATION_COOKIE_KEY } from "@/utils/constants";

export function setReservationInCookie(
  response: NextResponse,
  eventId: string,
  performanceId: string,
  reservationId: string,
  expiresAt: Date,
  reservationItems: { id: string; ticketType: TicketType }[]
) {
  console.log("[setReservationInCookie] Starting to set reservation cookie");

  const rawHandle = `${eventId}|${performanceId}`;
  console.log("[setReservationInCookie] rawHandle:", rawHandle);

  const encryptedHandle = encrypt(rawHandle);
  console.log("[setReservationInCookie] encryptedHandle:", encryptedHandle);

  // ✅ Encode the encrypted handle to make the cookie key safe
  const encodedHandle = encodeURIComponent(encryptedHandle);
  const key = `${RESERVATION_COOKIE_KEY}_${encodedHandle}`;
  console.log("[setReservationInCookie] cookie key:", key);

  const data = {
    reservationId,
    reservationItems,
    expiresAt: new Date(expiresAt).toISOString(),
  };
  console.log("[setReservationInCookie] data to sign:", data);

  const token = sign(data, JWT_SECRET, {
    algorithm: "HS256",
  } satisfies SignOptions);
  console.log("[setReservationInCookie] signed JWT token:", token);

  response.cookies.set(key, token, {
    path: "/",
    httpOnly: true,
    maxAge: 15 * 60, // 15 minutes
  });

  console.log("[setReservationInCookie] Cookie set successfully");
}

export function getReservationFromCookieViaHeaders(
  reqHeaders: Headers,
  eventId: string,
  performanceId: string
): {
  reservationId: string;
  reservationItems: { id: string; ticketType: TicketType }[];
  expiresAt: Date;
  userId: string | null;
} | null {
  const cookieHeader = reqHeaders.get("cookie");
  if (!cookieHeader) {
    console.warn("⚠️ No cookie header found");
    return null;
  }

  // Parse cookies into a map
  const cookiesMap = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, decodeURIComponent(v.join("="))];
    })
  );

  const matchingCookieEntry = Object.entries(cookiesMap).find(([key]) => {
    if (!key.startsWith(RESERVATION_COOKIE_KEY + "_")) return false;

    // Decode the URI component before decrypting
    const encryptedHandle = decodeURIComponent(
      key.substring(RESERVATION_COOKIE_KEY.length + 1)
    );

    try {
      const decryptedHandle = decrypt(encryptedHandle);
      const [decryptedEventId, decryptedPerformanceId] =
        decryptedHandle.split("|");
      return (
        decryptedEventId === eventId && decryptedPerformanceId === performanceId
      );
    } catch (error) {
      console.warn(`⚠️ Failed to decrypt cookie key: ${key}`, error);
      return false;
    }
  });

  if (!matchingCookieEntry) {
    console.warn(
      `⚠️ No matching cookie found for eventId=${eventId}, performanceId=${performanceId}`
    );
    return null;
  }

  const [, token] = matchingCookieEntry;
  if (!token) {
    console.warn("⚠️ No token found in matching cookie entry");
    return null;
  }

  try {
    const decoded = verify(token, JWT_SECRET) as JwtPayload;

    if (
      !decoded.reservationId ||
      !Array.isArray(decoded.reservationItems) ||
      !decoded.expiresAt
    ) {
      console.warn("⚠️ Invalid JWT payload structure");
      return null;
    }

    return {
      reservationId: decoded.reservationId as string,
      reservationItems: decoded.reservationItems as {
        id: string;
        ticketType: TicketType;
      }[],
      userId: (decoded.userId as string) || null,
      expiresAt: new Date(decoded.expiresAt as string),
    };
  } catch (err) {
    console.warn("❌ Failed to verify or decode JWT token", err);
    return null;
  }
}

export function getServersTimeNow() {
  return new Date();
}
