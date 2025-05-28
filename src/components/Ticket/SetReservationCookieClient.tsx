"use client";

import { useEffect } from "react";

interface Props {
  eventId: string;
  performanceId: string;
  reservationId: string;
    expiresAt: Date;
  reservationItems: { id: string; ticketType: string }[];
}

// TODO there is a mismatch with the expiring time: when this component is reached, some seconds have already passed since the reservation was created
export function SetReservationCookieClient({
  eventId,
  performanceId,
  reservationId,
  expiresAt,
  reservationItems,
}: Props) {
  useEffect(() => {
    fetch("/api/tickets/reservations", {
      method: "POST",
      body: JSON.stringify({
        eventId,
        performanceId,
        reservationId,
        expiresAt,
        reservationItems,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }, [eventId, expiresAt, performanceId, reservationId, reservationItems]);

  return null;
}
