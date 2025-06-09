import { UserRegistrationSchema } from "@/lib/validators/user";
import { getReservationFromCookieViaHeaders } from "@/services/cookieService";
import { updateReservationUserId } from "@/services/reservationService";
import { createGuestUser, updateUser } from "@/services/userService";
import { JWT_SECRET, RESERVATION_COOKIE_KEY } from "@/utils/constants";
import { decrypt } from "@/utils/cryptoUtils";
import { getEventAndPerformanceIdsFromSlugs } from "@/utils/reservationUtils";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const json = await req.json();

  const validationResult = UserRegistrationSchema.safeParse(json);

  if (!validationResult.success) {
    return NextResponse.json(
      { success: false, errors: validationResult.error.flatten() },
      { status: 400 }
    );
  }

  const data = validationResult.data;

  const result = await getEventAndPerformanceIdsFromSlugs(
    data.showSlug,
    data.performanceSlug
  );

  if (!result) {
    console.error(
      "[/api/users POST] Failed to resolve event and performance IDs"
    );
    return NextResponse.json(
      { success: false, error: "Invalid show or performance slug" },
      { status: 400 }
    );
  }

  const { eventId, performanceId } = result;

  const reqHeaders = await headers();

  const reservation = getReservationFromCookieViaHeaders(
    reqHeaders,
    eventId,
    performanceId
  );

  if (!reservation) {
    console.error("[/api/users POST] No reservation found in cookie");
    return NextResponse.json(
      { success: false, error: "No reservation found" },
      { status: 400 }
    );
  }

  console.log("[/api/users POST] Received user data:", data);

  if (data.isGuest) {
    const userId = await createGuestUser(
      data.fullName,
      data.email,
      data.phone,
      data.isGuest,
      reservation.reservationId
    );

    if (!userId) {
      console.error("[/api/users POST] Failed to create user");
      return NextResponse.json(
        { success: false, error: "Failed to create user" },
        { status: 500 }
      );
    }

    console.log("[/api/users POST] Created user with ID:", userId);

    const updatedReservation = await updateReservationUserId(
      reservation.reservationId,
      userId
    );

    if (!updatedReservation) {
      console.error(
        "[/api/users POST] Failed to update reservation with user ID"
      );
      return NextResponse.json(
        { success: false, error: "Failed to update reservation" },
        { status: 500 }
      );
    }

    console.log(
      `[/api/users POST] Updated reservation ${reservation.reservationId} with user ID ${userId}`
    );

    const cookieHeader = reqHeaders.get("cookie");
    if (!cookieHeader) {
      console.warn("⚠️ No cookie header found");
      return NextResponse.json(
        { success: false, error: "No reservation cookie found" },
        { status: 400 }
      );
    }

    console.log("📦 Raw cookie header:", cookieHeader);

    // Build cookie map
    const cookiesMap = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, decodeURIComponent(v.join("="))];
      })
    );

    console.log("🗺️ Parsed cookies:", cookiesMap);

    // 🔍 Find correct cookie key
    const matchingEntry = Object.entries(cookiesMap).find(([key]) => {
      if (!key.startsWith(RESERVATION_COOKIE_KEY + "_")) return false;

      const encryptedHandle = decodeURIComponent(
        key.substring(RESERVATION_COOKIE_KEY.length + 1)
      );

      try {
        const decrypted = decrypt(encryptedHandle);
        const [cookieEventId, cookiePerformanceId] = decrypted.split("|");

        console.log(`🔑 Decrypted cookie key:`, {
          cookieEventId,
          cookiePerformanceId,
          rawKey: key,
        });

        return (
          cookieEventId === eventId && cookiePerformanceId === performanceId
        );
      } catch (err) {
        console.warn("❌ Failed to decrypt cookie key", key, err);
        return false;
      }
    });

    if (!matchingEntry) {
      console.warn(
        `❌ Could not find matching reservation cookie for eventId=${eventId}, performanceId=${performanceId}`
      );
      return NextResponse.json(
        { success: false, error: "Matching reservation cookie not found" },
        { status: 400 }
      );
    }

    const [cookieKey, jwt] = matchingEntry;

    console.log("✅ Found matching cookie key:", cookieKey);

    let payload;
    try {
      payload = verify(jwt, JWT_SECRET) as JwtPayload;
    } catch (err) {
      console.error("❌ Failed to verify JWT", err);
      return NextResponse.json(
        { success: false, error: "Invalid reservation token" },
        { status: 400 }
      );
    }

    // 👤 Add userId
    payload.userId = userId;
    console.log("👤 Added userId to payload:", userId);

    // ⏳ Recalculate expiration
    const expiresAt = new Date(payload.expiresAt).getTime();
    const now = Date.now();
    const remainingSeconds = Math.max(1, Math.floor((expiresAt - now) / 1000));

    console.log("⏳ Cookie will expire in (s):", remainingSeconds);

    // 🔏 Resign JWT
    const updatedJwt = sign(payload, JWT_SECRET);

    // 🍪 Set new cookie
    const response = NextResponse.json({ success: true });

    response.cookies.set(cookieKey, updatedJwt, {
      path: "/",
      httpOnly: true,
      maxAge: remainingSeconds,
    });

    console.log("🍪 Updated cookie set with same key:", cookieKey);

    return response;
  }

  // TODO Future: handle non-guest registration logic api
  return NextResponse.json(
    { success: false, error: "Non-guest registration is not allowed" },
    { status: 501 }
  );
}

export async function PATCH(req: Request) {
  const json = await req.json();
  const reqHeaders = await headers();

  console.log("📩 [/api/users PATCH] Incoming request payload:", json);

  const { showSlug, performanceSlug, fullName, email, phone } = json;

  if (!showSlug || !performanceSlug) {
    console.warn("🚫 Missing slugs: showSlug or performanceSlug is undefined");
    return NextResponse.json(
      { success: false, error: "Missing show or performance slug" },
      { status: 400 }
    );
  }

  const result = await getEventAndPerformanceIdsFromSlugs(
    showSlug,
    performanceSlug
  );

  if (!result) {
    console.error("❌ Failed to resolve slugs for:", showSlug, performanceSlug);
    return NextResponse.json(
      { success: false, error: "Invalid show or performance slug" },
      { status: 400 }
    );
  }

  const { eventId, performanceId } = result;
  console.log("🔗 Resolved event and performance IDs:", {
    eventId,
    performanceId,
  });

  const reservation = getReservationFromCookieViaHeaders(
    reqHeaders,
    eventId,
    performanceId
  );

  if (!reservation) {
    console.warn("🕳️ No reservation found for these IDs");
    return NextResponse.json(
      { success: false, error: "No reservation found" },
      { status: 400 }
    );
  }

  const cookieHeader = reqHeaders.get("cookie");
  if (!cookieHeader) {
    console.warn("⚠️ No cookie header found");
    return NextResponse.json(
      { success: false, error: "No reservation cookie found" },
      { status: 400 }
    );
  }

  const cookiesMap = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, decodeURIComponent(v.join("="))];
    })
  );

  const matchingEntry = Object.entries(cookiesMap).find(([key]) => {
    if (!key.startsWith(RESERVATION_COOKIE_KEY + "_")) return false;

    const encryptedHandle = decodeURIComponent(
      key.substring(RESERVATION_COOKIE_KEY.length + 1)
    );

    try {
      const decrypted = decrypt(encryptedHandle);
      const [cookieEventId, cookiePerformanceId] = decrypted.split("|");
      return cookieEventId === eventId && cookiePerformanceId === performanceId;
    } catch {
      console.warn("🔐 Failed to decrypt a reservation cookie");
      return false;
    }
  });

  if (!matchingEntry) {
    console.warn("🍪 Matching reservation cookie not found");
    return NextResponse.json(
      { success: false, error: "Matching reservation cookie not found" },
      { status: 400 }
    );
  }

  const [, jwt] = matchingEntry;

  let payload;
  try {
    payload = verify(jwt, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error("🛑 Invalid reservation token:", error);
    return NextResponse.json(
      { success: false, error: "Invalid reservation token" },
      { status: 400 }
    );
  }

  const userId = payload.userId;
  if (!userId) {
    console.error("🔎 No userId found in token payload");
    return NextResponse.json(
      { success: false, error: "No user ID in reservation token" },
      { status: 400 }
    );
  }

  const updates: Record<string, string | undefined> = {};
  if (fullName !== undefined) updates.full_name = fullName;
  if (email !== undefined) updates.email = email;
  if (phone !== undefined) updates.phone = phone;

  if (Object.keys(updates).length === 0) {
    console.log("ℹ️ No user fields to update");
    return NextResponse.json(
      { success: false, error: "No changes provided" },
      { status: 400 }
    );
  }

  console.log(`📝 Attempting to update user (${userId}) with:`, updates);

  try {
    const isUserUpdated = await updateUser(userId, updates);
    console.log(
      isUserUpdated
        ? `✅ User (${userId}) updated successfully`
        : `❗ User (${userId}) update returned false`
    );
    return NextResponse.json({ success: isUserUpdated });
  } catch (err) {
    console.error("🔥 Failed to update user:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}
