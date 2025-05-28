import { notFound } from "next/navigation";
import { getReservation  } from "@/services/ticketService";
import { Stepper } from "@/components/shared/Stepper";
import Pago from "@/components/Ticket/Pago";
import { generateIntegritySignature } from "@/utils/ticketsUtils";

const BOLD_SECRET_KEY = process.env.BOLD_PRUEBA_LLAVE_SECRETA!;
const TICKET_SUFIX = process.env.TICKET_SUFIX!;

export default async function PagoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const reservationId =
    typeof params["reserva"] === "string"
      ? params["reserva"]
      : undefined;

  if (!reservationId) {
    console.warn("[PAGO] No reservation found in search params");
    notFound();
  }

  const reservation = await getReservation(reservationId);

  if (reservation) {
      console.log("[PAGO] Reservation fetched:", reservation);
  } else {
        console.warn("[PAGO] No reservation found for ID:", reservationId);
        notFound();
    }

    // TODO check reservation status, expiration, userId !== null

    const boldOrderId = `${reservation.id}${TICKET_SUFIX}`;
    const concatenatedString = `${boldOrderId}${reservation.total_price}COP${BOLD_SECRET_KEY}`;
    const integritySignature = await generateIntegritySignature(concatenatedString)

    if (!integritySignature) {
      console.error("[PAGO] Failed to generate integrity signature");
      notFound();
    }
    
    const description = "prueba de pago";

  return (
    <>
      <Stepper currentStep="Pago" />
      <Pago orderId={boldOrderId} amount={reservation.total_price} integritySignature={integritySignature} description={description}/>
    </>
  );
}
