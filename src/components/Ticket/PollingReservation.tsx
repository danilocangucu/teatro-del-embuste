"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// TODO temporary reservation type in PollingReservation.tsx
type Reservation = {
  id: string;
  status: string;
  // add other fields if needed
};

export function PollingReservation({ boldOrderId }: { boldOrderId: string }) {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<number | null>(null);

  const router = useRouter();
  const maxAttempts = 5;
  const intervalMs = 4000;

  useEffect(() => {
    if (reservation || attempts >= maxAttempts) return;

    const timer = setTimeout(async () => {
      try {
        console.log(
          `"[POLLING RESERVATION] Attempt #${attempts} to fetch reservation for boldOrderId:"`,
          boldOrderId
        );
        const res = await fetch(`/api/tickets/reservations?id=${boldOrderId}`);
        console.log("[POLLING RESERVATION] Fetching reservation...");
        console.log("[POLLING RESERVATION] Response status:", res.status);
        console.log("[POLLING RESERVATION] Response ok:", res.ok);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 400) {
            console.warn(
              "[POLLING RESERVATION] No reservation found in cookie"
            );
            setStatus(400);
            return;
          }
          console.log("[POLLING RESERVATION] Response data:", data);
          if (data.reservation) {
            if (data.reservation.status === "confirmed" || data.reservation.status === "cancelled") {
              console.log(
                "[POLLING RESERVATION] Reservation confirmed, stopping polling."
              );
              clearTimeout(timer);
              setAttempts(maxAttempts);
              // TODO redirect for now needs showSlug and performanceSlug and its hardcoded.
              router.push(`/boletas/la-secreta/07-06-25-6PM/confirmacion`);
            }
            console.log(
              "[POLLING RESERVATION] Reservation found, updating state."
            );
            setReservation(data.reservation);
          }
          setAttempts(attempts + 1);
        } else {
          console.log("[POLLING RESERVATION] !Res.ok:");
          setAttempts(attempts + 1);
        }
      } catch (error) {
        console.error(
          "[POLLING RESERVATION] Error fetching reservation:",
          error
        );
        setAttempts(attempts + 1);
      }
    }, intervalMs);

    return () => clearTimeout(timer);
  }, [reservation, attempts, boldOrderId, router]);

  if (reservation) {
    console.log("[POLLING RESERVATION] Reservation found:", reservation);
    return (
      <div style={{ marginTop: 40, marginLeft: 40, fontFamily: "sans-serif", maxWidth: 500 }}>
        <h1>Confirmación</h1>
        <br /><br />
        <p>Tu compra ha sido encontrada.</p>
        <br />
        <p>Cargando detalles...</p>
        <br />
      </div>
    );
  }

  if (status === 400) {
    return (
      <div style={{ marginTop: 40, marginLeft: 40, fontFamily: "sans-serif", maxWidth: 500 }}>
        <p>
          No se encontró una reserva en tu sesión. Por favor, verifica que hayas
          realizado el pago correctamente y vuelve a intentarlo.
        </p><br /><br />
        <p>
          Si el problema persiste, contáctanos por correo al embuste@gmail.com o
          por teléfono al 3112326206.
        </p><br />
        <p>Horario de atención: lunes a viernes, de 9:00 a.m. a 5:00 p.m.</p><br /><br />
        <p>Gracias por tu paciencia.</p>
      </div>
    );
  }

  if (attempts >= maxAttempts) {
    console.warn(
      "[POLLING RESERVATION] Max attempts reached, no reservation found."
    );
    return (
      <div style={{ marginTop: 40, marginLeft: 40, fontFamily: "sans-serif", maxWidth: 500 }}>
        <h1>Estado de la verificación</h1>
        <br />
        <br />
        <br />
        <p>
          Tu pedido aún no ha sido confirmado. Estamos revisando tu pago y te
          contactaremos por correo o teléfono si compartiste esa información.
          Revisa tu correo, incluyendo la carpeta de spam, para actualizaciones.
        </p>
        <br />
        <br />
        <p>
          Si necesitas ayuda, contáctanos por correo a embuste@gmail.com o por
          teléfono al 3112326206.
        </p>
        <br />
        <p>Horario de atención: lunes a viernes</p>
        <br />
        <p>De 9:00 a.m. a 5:00 p.m.</p>
        <br />
        <br />
        <p>Gracias por tu paciencia.</p>
      </div>
    );
  }

  return <div style={{ marginTop: 40, marginLeft: 40, fontFamily: "sans-serif", maxWidth: 500 }}>
    <p>
      Verificando su pago, por favor espere...
    </p>
  </div>;
}
