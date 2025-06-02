import { updateReservationUserId } from "@/services/ticketService";
import { createUser } from "@/services/userService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { fullName, email, phone, isGuest, reservationId } = await req.json();

  console.log("[/api/users POST] Received user data:", {
    fullName,
    email,
    phone,
    isGuest,
    reservationId,
  });

  const userId = await createUser(
    fullName,
    email,
    phone,
    isGuest,
    reservationId
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
    reservationId,
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
    `[/api/users POST] Updated reservation ${reservationId} with user ID ${userId}`
  );

  const response = NextResponse.json({ success: true, userId });

  return response;
}
