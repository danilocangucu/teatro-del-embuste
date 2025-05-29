"use client";

import { useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ResultComponent({ reservation, eventId, performanceId }: { reservation: any, eventId: string, performanceId: string }) {
  useEffect(() => {
    if (!eventId || !performanceId) return;

    const deleteReservation = async () => {
      try {
        const resDelete = await fetch("/api/tickets/reservations", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, performanceId }),
        });

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
  }, [eventId, performanceId]);

  if (!reservation) {
    return (
      <div style={{ marginTop: 40, marginLeft: 40, fontFamily: "sans-serif", maxWidth: 500 }}>
        <h1>Error</h1>
        <p>No se encontró la reserva.</p>
      </div>
    );
  }

  if (reservation.status === "confirmed") {
    return (
      <div style={{ marginTop: 40, marginLeft: 40, fontFamily: "sans-serif", maxWidth: 500 }}>
        <h1>Reserva Confirmada</h1><br /><br /><br />
        <p>Gracias por tu compra.</p><br /><br />
        <p>Reserva ID: {reservation.id}</p><br />
        <p>Estado: {reservation.status}</p><br />
      </div>
    );
  }

  if (reservation.status === "expired") {
    return (
      <div style={{ marginTop: 40, marginLeft: 40, fontFamily: "sans-serif", maxWidth: 500 }}>
        <h1>Reserva Expirada</h1><br /><br /><br />
        <p>Tu reserva ha expirado. Por favor, intenta nuevamente.</p><br />
        <p>Reserva ID: {reservation.id}</p><br />
        <p>Estado: {reservation.status}</p><br />
      </div>
    );
  }

  if (reservation.status === "cancelled") {
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