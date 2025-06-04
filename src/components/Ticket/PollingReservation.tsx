"use client";

import { reservation_status } from "@prisma/client";
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useState } from "react";


export function PollingReservation({ boldOrderIdWithoutSufix }: { boldOrderIdWithoutSufix: string }) {
  const [attempts, setAttempts] = useState(0);
  const [foundReservation, setFoundReservation] = useState(false);
  const [reservationStatus, setReservationStatus] = useState<string | null>(null);

  const router = useRouter();
  const maxAttempts = 5;
  const intervalMs = 4000;

  useEffect(() => {
    if (attempts >= maxAttempts) return;

    const timer = setTimeout(async () => {
      try {
        console.log(
          `"[POLLING RESERVATION] Attempt #${attempts} to fetch reservation for boldOrderId:"`,
          boldOrderIdWithoutSufix
        );
        const res = await fetch(`/api/tickets/reservations?id=${boldOrderIdWithoutSufix}`);
        console.log("[POLLING RESERVATION] Fetching reservation...");
        console.log("[POLLING RESERVATION] Response status:", res.status);
        if (res.ok) {
          const data = await res.json();
          console.log("[POLLING RESERVATION] Response data:", data);
          if (data.reservation) {
            console.log("[POLLING RESERVATION] Reservation found:", data.reservation);

            if (data.reservation.status === reservation_status.confirmed || data.reservation.status === reservation_status.cancelled) {
              console.log(
                "[POLLING RESERVATION] Reservation confirmed, stopping polling."
              );
              clearTimeout(timer);
              setAttempts(maxAttempts);
              router.push(`/boletas/${data.reservation.showSlug}/${data.reservation.performanceSlug}/confirmacion`);
            }
            setFoundReservation(true);
            setReservationStatus(data.reservation.status);
          };
          setAttempts(attempts + 1);
        } else {
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
  }, [attempts, boldOrderIdWithoutSufix, router]);

  if (!foundReservation && attempts >= maxAttempts) {
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
          No hemos encontrado tu reserva.
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

  if (foundReservation && reservationStatus && attempts >= maxAttempts) {
    console.log("[POLLING RESERVATION] attempts:", attempts);
    console.log("[POLLING RESERVATION] Reservation found, status:", reservationStatus);
    console.log("[POLLING RESERVATION] Reservation status:", reservationStatus);
    return (
      <div style={{ marginTop: 40, marginLeft: 40, fontFamily: "sans-serif", maxWidth: 500 }}>
        <h1>Estado de la verificación</h1>
        <br />
        <br />
        <br />
        <br />
        <p>
          El pago de tu reserva no ha sido confirmado. El equipo del Teatro del Embuste ha sido notificado y está trabajando para resolver el problema. Por favor, ten paciencia mientras verificamos tu pago. Pronto te contactaremos por correo electrónico o por teléfono si has proporcionado un número de contacto.
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
