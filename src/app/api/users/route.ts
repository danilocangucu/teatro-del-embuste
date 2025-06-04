import { UserRegistrationSchema } from "@/lib/validators/user";
import { updateReservationUserId } from "@/services/ticketService";
import { createGuestUser } from "@/services/userService";
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
