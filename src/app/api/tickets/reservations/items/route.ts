import {
  getReservation,
  getReservationItem,
  getReservationItems,
  updateReservationQuantityAndSeats,
} from "@/services/reservationService";
import { NextResponse } from "next/server";
import { reservation_status } from "@prisma/client";
import {
  getPerformance,
} from "@/services/performanceService";

export async function POST(req: Request) {
  const { reservationItemIds } = await req.json();

  if (!Array.isArray(reservationItemIds) || reservationItemIds.length === 0) {
    return NextResponse.json(
      { error: "Missing or invalid reservationItemIds" },
      { status: 400 }
    );
  }

  const items = await getReservationItems(reservationItemIds);
  // TODO refactor this to sanitize function
  const mappedItems = items.map((item) => ({
    id: item.id,
    ticketType: item.ticket_type,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    totalPrice: item.total_price,
  }));

  return NextResponse.json({ reservationItems: mappedItems });
}

export async function PATCH(req: Request) {
  const { reservationItemId, newQuantity } = await req.json();

  if (
    typeof reservationItemId !== "string" ||
    typeof newQuantity !== "number" ||
    !Number.isInteger(newQuantity) ||
    newQuantity < 0 ||
    newQuantity > 10
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const reservationItem = await getReservationItem(reservationItemId);

  if (!reservationItem) {
    return NextResponse.json(
      { error: "Reservation item not found" },
      { status: 404 }
    );
  }

  const reservation = await getReservation(reservationItem.reservation_id);

  if (!reservation) {
    return NextResponse.json(
      { error: "Reservation not found" },
      { status: 404 }
    );
  }

  if (
    reservation.status !== reservation_status.selecting &&
    reservation.status !== reservation_status.reviewing &&
    reservation.status !== reservation_status.identifying
  ) {
    return NextResponse.json(
      { error: "Reservation is not in a valid state" },
      { status: 400 }
    );
  }

  if (reservation.expires_at) {
    const expiresAt = new Date(reservation.expires_at);
    const now = new Date();

    if (expiresAt < now) {
      return NextResponse.json(
        { error: "Reservation has expired" },
        { status: 400 }
      );
    }
  } else {
    return NextResponse.json(
      { error: "Reservation does not have an expiration date" },
      { status: 400 }
    );
  }

  const quantityDifference = newQuantity - reservationItem.quantity;

  if (quantityDifference === 0) {
    return new NextResponse(null, { status: 204 });
  }

  const performance = await getPerformance(reservation.performance_id);

  if (!performance) {
    return NextResponse.json(
      { error: "Performance not found" },
      { status: 404 }
    );
  }

  const newAvailableSeats = performance.available_seats - quantityDifference;
  if (newAvailableSeats < 0) {
    return NextResponse.json(
      { error: "Not enough available seats" },
      { status: 400 }
    );
  }

  try {
    const result = await updateReservationQuantityAndSeats(
      reservationItemId,
      newQuantity,
      reservation.performance_id,
      newAvailableSeats
    );

    return NextResponse.json(result);
  } catch (error){
    console.error("Error updating reservation and performance:", error);
    return NextResponse.json(
      { error: "Failed to update reservation and performance" },
      { status: 500 }
    );
  }
}
