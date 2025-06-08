import { UserRegistrationSchema } from "@/lib/validators/user";
import { updateReservationUserId } from "@/services/reservationService";
import { createGuestUser, updateUser } from "@/services/userService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const json = await req.json();

  const result = UserRegistrationSchema.safeParse(json);

  if (!result.success) {
    return NextResponse.json(
      { success: false, errors: result.error.flatten() },
      { status: 400 }
    );
  }

  const data = result.data;

  console.log("[/api/users POST] Received user data:", data);

  if (data.isGuest) {
    const userId = await createGuestUser(
      data.fullName,
      data.email,
      data.phone,
      data.isGuest,
      data.reservationId
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
      data.reservationId,
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
      `[/api/users POST] Updated reservation ${data.reservationId} with user ID ${userId}`
    );

    return NextResponse.json({ success: true, userId });
  }

  // TODO Future: handle non-guest registration logic api
  return NextResponse.json(
    { success: false, error: "Non-guest registration is not allowed" },
    { status: 501 }
  );
}

export async function PATCH(req: Request) {
  const json = await req.json();

  console.log("[/api/users PATCH] Incoming request payload:", json);

  const { userId, fullName, email, phone } = json;

  if (!userId) {
    console.warn("[/api/users PATCH] Missing userId");
    return NextResponse.json(
      { success: false, error: "Missing userId" },
      { status: 400 }
    );
  }

  const updates: Record<string, string | undefined> = {};
  if (fullName !== undefined) updates.full_name = fullName;
  if (email !== undefined) updates.email = email;
  if (phone !== undefined) updates.phone = phone;

  console.log("[/api/users PATCH] Fields to update:", updates);

  if (Object.keys(updates).length === 0) {
    console.warn("[/api/users PATCH] No changes provided");
    return NextResponse.json(
      { success: false, error: "No changes provided" },
      { status: 400 }
    );
  }

  try {
    const isUserUpdated = await updateUser(userId, updates);
    console.log("[/api/users PATCH] User updated successfully?", isUserUpdated);
    return NextResponse.json({ success: isUserUpdated });
  } catch (err) {
    console.error("[/api/users PATCH] Error updating user:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}