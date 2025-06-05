import {
  getDiscountById,
  getReservation,
  getReservationItemsByReservationId,
  updateReservationAndItemsTotalPrices,
  updateReservationStatus,
} from "@/services/ticketService";
import { DiscountDTO } from "@/types/Event";
import { boldFeePercentage, boldFixedFee } from "@/utils/constants";
import { getDiscountedPrice } from "@/utils/sharedUtils";
import { reservation_status, ticket_type } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const { reservationId } = await req.json();
  if (!reservationId || typeof reservationId !== "string") {
    return NextResponse.json(
      { error: "Invalid or missing reservationId" },
      { status: 400 }
    );
  }

  // Here you would typically validate the reservationId against your database
  const reservation = await getReservation(reservationId);
  if (!reservation) {
    return NextResponse.json(
      { error: "Reservation not found" },
      { status: 404 }
    );
  }

  if (
    reservation.status !== reservation_status.selecting &&
    reservation.status !== reservation_status.identifying &&
    reservation.status !== reservation_status.reviewing
  ) {
    return NextResponse.json(
      { error: "Reservation is not in a valid state for review" },
      { status: 400 }
    );
  }

  const timeNow = new Date();
  if (reservation.expires_at) {
    const expiresAt = new Date(reservation.expires_at);
    if (expiresAt < timeNow) {
      return NextResponse.json(
        { error: "Reservation has expired" },
        { status: 400 }
      );
    }
  }

  // Update the reservation status to 'reviewing'
  if (reservation.status !== reservation_status.selecting) {
    await updateReservationStatus(reservationId, reservation_status.selecting);
    console.log(`Updating reservation ${reservationId} status to 'selecting'`);
  }

  const reservationItems = await getReservationItemsByReservationId(
    reservationId
  );
  if (!reservationItems || reservationItems.length === 0) {
    return NextResponse.json(
      { error: "No reservation items found for this reservation" },
      { status: 404 }
    );
  }
  console.log("Fetched reservation items in review:", reservationItems);

  if (reservationItems.every((item) => item.quantity <= 0)) {
    return NextResponse.json(
      { error: "All reservation items have a quantity of zero" },
      { status: 400 }
    );
  }

  if (reservationItems.some((item) => item.quantity > 10)) {
    return NextResponse.json(
      {
        error: "One or more reservation items have a quantity greater than 10",
      },
      { status: 400 }
    );
  }

  const hasDiscount = reservationItems.some((item) => item.discount_id != null);
  console.log("Has discount:", hasDiscount);

  const discountsByTicketType: Record<string, DiscountDTO | null> = {};

  if (hasDiscount) {
    await Promise.all(
      reservationItems.map(async (item) => {
        if (item.discount_id) {
          const dbDiscount = await getDiscountById(item.discount_id);
          const discountDTO: DiscountDTO | null = dbDiscount
            ? {
                id: dbDiscount.id,
                type: dbDiscount.type,
                value: Number(dbDiscount.value),
                description: dbDiscount.description,
              }
            : null;

          discountsByTicketType[item.ticket_type] = discountDTO;
        }
      })
    );
  }

  const standardItem = reservationItems.find(
    (item) => item.ticket_type === ticket_type.standard
  );
  const studentItem = reservationItems.find(
    (item) => item.ticket_type === ticket_type.student
  );

  // Helper to calculate discounted or normal price
  const calculateTotalPrice = (
    item: (typeof reservationItems)[number] | undefined,
    discount: DiscountDTO | null
  ): number => {
    if (!item) return 0;
    const unitPrice = discount
      ? getDiscountedPrice(item.unit_price, discount)
      : item.unit_price;
    return unitPrice * item.quantity;
  };

  let standardTotalPrice = 0;
  let studentTotalPrice = 0;

  if (hasDiscount) {
    standardTotalPrice = calculateTotalPrice(
      standardItem,
      discountsByTicketType["standard"]
    );
    studentTotalPrice = calculateTotalPrice(
      studentItem,
      discountsByTicketType["student"]
    );
  } else {
    standardTotalPrice = calculateTotalPrice(standardItem, null);
    studentTotalPrice = calculateTotalPrice(studentItem, null);
  }

  const itemsToUpdate = [];

  if (standardItem) {
    itemsToUpdate.push({
      id: standardItem.id,
      total_price: standardTotalPrice,
    });
  }
  if (studentItem) {
    itemsToUpdate.push({ id: studentItem.id, total_price: studentTotalPrice });
  }

  const ticketTotalPrice = standardTotalPrice + studentTotalPrice;

  // Bold fee is 3.49% of ticket price + 900 COP flat fee
  const boldFee =
    Math.round(ticketTotalPrice * boldFeePercentage) + boldFixedFee;

  const totalPrice = ticketTotalPrice + boldFee;

  // Perform all updates in a single transaction
  const { updatedItems, updatedReservation } =
    await updateReservationAndItemsTotalPrices(
      reservationId,
      itemsToUpdate,
      ticketTotalPrice,
      boldFee,
      totalPrice
    );

  console.log("Updated reservation items:", updatedItems);
  console.log("Updated reservation:", updatedReservation);

  const response = NextResponse.json({ success: true });

  return response;
}
