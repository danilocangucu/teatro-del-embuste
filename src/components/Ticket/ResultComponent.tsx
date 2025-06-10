"use client";

import { reservation_status } from "@prisma/client";
import { useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ResultComponent({ reservation, showSlug, performanceSlug }: { reservation: any, showSlug: string, performanceSlug: string }) {
  useEffect(() => {
    if (!showSlug || !performanceSlug) return;

    const deleteReservation = async () => {
      try {
        const resDelete = await fetch(
          `/api/tickets/reservations?showSlug=${showSlug}&performanceSlug=${performanceSlug}`,
          {
            method: "DELETE",
          }
        );

        if (!resDelete.ok) {
          console.error(
            "[ResultComponent] Error deleting reservation:",
            resDelete.statusText
          );
          return;
        }

        const json = await resDelete.json();
        console.log("[ResultComponent] Reservation deleted successfully.");
        console.log("[ResultComponent] API body:", json);
      } catch (err) {
        console.error("[ResultComponent] Failed to delete reservation:", err);
      }
    };

    deleteReservation();
  }, [showSlug, performanceSlug]);

  if (!reservation) {
    return (
      <div style={{ marginTop: 40, marginLeft: 40, fontFamily: "sans-serif", maxWidth: 500 }}>
        <h1>Error</h1>
        <p>No se encontró la reserva.</p>
      </div>
    );
  }

  if (reservation.status === reservation_status.confirmed) {
    return (
      <div style={{ marginTop: 40, marginLeft: 40, fontFamily: "sans-serif", maxWidth: 500 }}>
        <h1>Reserva Confirmada</h1><br /><br /><br />
        <p>Gracias por tu compra.</p><br /><br />
        <p>Reserva ID: {reservation.id}</p><br />
        <p>Estado: {reservation.status}</p><br />
      </div>
    );
  }

  if (reservation.status === reservation_status.expired) {
    return (
      <div style={{ marginTop: 40, marginLeft: 40, fontFamily: "sans-serif", maxWidth: 500 }}>
        <h1>Reserva Expirada</h1><br /><br /><br />
        <p>Tu reserva ha expirado. Por favor, intenta nuevamente.</p><br />
        <p>Reserva ID: {reservation.id}</p><br />
        <p>Estado: {reservation.status}</p><br />
      </div>
    );
  }

  if (reservation.status === reservation_status.cancelled) {
    return (
      <div style={{ marginTop: 40, marginLeft: 40, fontFamily: "sans-serif", maxWidth: 500 }}>
        <h1>Reserva Cancelada</h1><br /><br /><br />
        <p>Tu reserva ha sido cancelada. Por favor, intenta nuevamente.</p><br />
        <p>Reserva ID: {reservation.id}</p><br />
        <p>Estado: {reservation.status}</p><br />
      </div>
    );
  }

  return (
    <div>
    </div>
  );
}