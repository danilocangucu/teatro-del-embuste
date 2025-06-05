import { prisma } from "@/lib/prisma";

import { TicketType } from "@/types/Event";
import { reservation_status } from "@prisma/client";

export const createReservation = async (
  performanceId: string,
  status: reservation_status = reservation_status.selecting,
  userId: null
) => {
  const now = new Date();

  const reservation = await prisma.reservations.create({
    data: {
      performance_id: performanceId,
      status: status,
      created_at: now,
      expires_at: new Date(now.getTime() + 15 * 60 * 1000),
      user_id: userId,
      total_price: 0,
      ticket_total_price: 0,
      bold_fee: 0,
    },
  });

  return {
    id: reservation.id,
    timeNow: new Date(),
    expiresAt: reservation.expires_at,
  };
};

export const createReservationItem = async (
  reservationId: string,
  ticketType: TicketType,
  unitPrice: number,
  discountId: string | null
) => {
  const reservationItem = await prisma.reservation_items.create({
    data: {
      reservation_id: reservationId,
      ticket_type: ticketType,
      quantity: 0,
      unit_price: unitPrice,
      discount_id: discountId,
      total_price: 0,
    },
  });

  return {
    id: reservationItem.id,
    ticketType,
    quantity: reservationItem.quantity,
  };
};

export const getReservationItems = async (reservationItemIds: string[]) => {
  const reservationItems = await prisma.reservation_items.findMany({
    where: {
      id: {
        in: reservationItemIds,
      },
    },
  });

  return reservationItems;
};

export const getReservationItemsByReservationId = async (
  reservationId: string
) => {
  const reservationItems = await prisma.reservation_items.findMany({
    where: {
      reservation_id: reservationId,
    },
  });

  return reservationItems;
};

export const getReservationItem = async (reservationItemId: string) => {
  const reservationItem = await prisma.reservation_items.findUnique({
    where: {
      id: reservationItemId,
    },
  });

  return reservationItem;
};

// TODO HANDLE ERROR PROPERLY: Inconsistent column data: Error creating UUID, invalid character: expected an optional prefix of `urn:uuid:` followed by [0-9a-fA-F-], found `h` at 1 -- db should return an error instead of crashing
export const getReservation = async (reservationId: string) => {
  const reservation = await prisma.reservations.findUnique({
    where: {
      id: reservationId,
    },
  });

  if (!reservation) {
    console.warn(`No reservation found with ID: ${reservationId}`);
    return null;
  }

  return reservation;
};

export const updateReservationQuantityAndSeats = async (
  reservationItemId: string,
  newQuantity: number,
  performanceId: string,
  newAvailableSeats: number
) => {
  try {
    const [updatedReservationItem, updatedPerformance] =
      await prisma.$transaction([
        prisma.reservation_items.update({
          where: { id: reservationItemId },
          data: { quantity: newQuantity },
        }),
        prisma.performances.update({
          where: { id: performanceId },
          data: { available_seats: newAvailableSeats },
        }),
      ]);

    return {
      reservationItemQuantity: updatedReservationItem.quantity,
      availableSeats: updatedPerformance.available_seats,
    };
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error; // rethrow so the caller can handle the error
  }
};

export const updateReservationStatus = async (
  reservationId: string,
  status: reservation_status
) => {
  const updatedReservation = await prisma.reservations.update({
    where: { id: reservationId },
    data: { status },
  });

  return updatedReservation;
};

export const getDiscountById = async (discountId: string) => {
  const discount = await prisma.discounts.findUnique({
    where: { id: discountId },
  });

  return discount;
};

export const getDiscountsByIds = async (discountIds: string[]) => {
  const discounts = await prisma.discounts.findMany({
    where: {
      id: {
        in: discountIds,
      },
    },
  });

  return discounts;
};

export const updateReservationAndItemsTotalPrices = async (
  reservationId: string,
  items: { id: string; total_price: number }[],
  ticketTotalPrice: number,
  boldFee: number,
  totalPrice: number
) => {
  return prisma.$transaction(async (tx) => {
    const updatedItems = await Promise.all(
      items.map((item) =>
        tx.reservation_items.update({
          where: { id: item.id },
          data: { total_price: item.total_price },
        })
      )
    );

    const updatedReservation = await tx.reservations.update({
      where: { id: reservationId },
      data: {
        total_price: totalPrice,
        ticket_total_price: ticketTotalPrice,
        bold_fee: boldFee,
      },
    });

    return { updatedItems, updatedReservation };
  });
};

export const updateReservationStatusAndPaymentId = async (
  reservationId: string,
  status: reservation_status,
  boldPaymentId: string
) => {
  const updatedReservation = await prisma.reservations.update({
    where: { id: reservationId },
    data: { status, bold_payment_id: boldPaymentId },
  });

  if (!updatedReservation) {
    throw new Error(`Reservation with ID ${reservationId} not found`);
  }

  return updatedReservation;
};

export const getReservationByBoldPaymentId = async (boldPaymentId: string) => {
  const reservation = await prisma.reservations.findFirst({
    where: {
      bold_payment_id: boldPaymentId,
    },
  });

  if (!reservation) {
    console.warn(`No reservation found with bold_payment_id: ${boldPaymentId}`);

    // console all reservations and their bold_payment_id
    const allReservations = await prisma.reservations.findMany({
      select: {
        id: true,
        bold_payment_id: true,
      },
    });

    console.log(
      "All reservations with their bold_payment_id:",
      allReservations
    );
    return null;
  }

  return reservation;
};

export const updateReservationUserId = async (
  reservationId: string,
  userId: string
) => {
  console.log(`Updating reservation ${reservationId} with user ID ${userId}`);

  const updatedReservation = await prisma.reservations.update({
    where: { id: reservationId },
    data: { user_id: userId },
  });

  if (!updatedReservation) {
    throw new Error(`Reservation with ID ${reservationId} not found`);
  }

  return true;
};

export const getReservationStatus = async (reservationId: string) => {
  const reservation = await prisma.reservations.findUnique({
    where: { id: reservationId },
    select: { status: true },
  });

  if (!reservation) {
    console.warn(`No reservation found with ID: ${reservationId}`);
    return null;
  }

  return reservation.status;
};