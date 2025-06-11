import { prisma } from "@/lib/prisma";
import { ticket_type } from "@prisma/client";

export const createTickets = async (
  eventId: string,
  performanceId: string,
  reservationId: string,
  userId: string,
  userEmail: string,
  reservationItems: { id: string; ticket_type: ticket_type }[]
) => {
  const operations = reservationItems.map((item) =>
    prisma.tickets.create({
      data: {
        event_id: eventId,
        performance_id: performanceId,
        reservation_id: reservationId,
        reservation_item_id: item.id,
        user_id: userId,
        user_email: userEmail,
        ticket_type: item.ticket_type,
      },
    })
  );

  const createdTickets = await prisma.$transaction(operations);
  return createdTickets.map((ticket) => ({
    id: ticket.id,
    type: ticket.ticket_type,
  }));
};

export const getTicketById = async (ticketId: string) => {
  return prisma.tickets.findUnique({
    where: { id: ticketId },
  });
};