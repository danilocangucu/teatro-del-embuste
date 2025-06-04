import { notFound } from "next/navigation";
import { getReservation, getReservationItemsByReservationId } from "@/services/ticketService";
import { Stepper } from "@/components/shared/Stepper";
import Pago from "@/components/Ticket/Pago";
import { generateIntegritySignature, generatePaymentDescription } from "@/utils/ticketsUtils";
import ReservationCountdown from "@/components/Ticket/ReservationCountdown";
import { getEventIdByPerformanceId, getPerformanceByReservationId } from "@/services/performanceService";
import { getShowTitleByEventId } from "@/services/showService";

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

  const reservationFromDB = await getReservation(reservationId);

  if (reservationFromDB) {
    console.log("[PAGO] Reservation fetched:", reservationFromDB);
  } else {
        console.warn("[PAGO] No reservation found for ID:", reservationId);
        notFound();
    }

    // TODO check reservation status, expiration, userId !== null

  const boldOrderId = `${reservationFromDB.id}${TICKET_SUFIX}`;
  const concatenatedString = `${boldOrderId}${reservationFromDB.total_price}COP${BOLD_SECRET_KEY}`;
    const integritySignature = await generateIntegritySignature(concatenatedString)

    if (!integritySignature) {
      console.error("[PAGO] Failed to generate integrity signature");
      notFound();
  };

  const reservationItems = await getReservationItemsByReservationId(reservationFromDB.id);

  console.log("[PAGO] Reservation items fetched:", reservationItems);

  const performance = await getPerformanceByReservationId(reservationFromDB.id);

  if (!performance) {
    console.error("[PAGO] No performance found for reservation ID:", reservationFromDB.id);
    notFound();
  }

  console.log("[PAGO] Performance fetched:", performance);

  const eventId = await getEventIdByPerformanceId(reservationFromDB.performance_id);

  if (!eventId) {
    console.error("[PAGO] No event found for performance ID:", reservationFromDB.performance_id);
    notFound();
  };

  console.log("[PAGO] Event fetched:", eventId);

  const showTitle = await getShowTitleByEventId(eventId);

  if (!showTitle) {
    console.error("[PAGO] No show title found for event ID:", eventId);
    notFound();
  };

  console.log("[PAGO] Show title fetched:", showTitle);

  const description = generatePaymentDescription({
    performance: { date: performance.date, time: performance.time! },
    reservationItems: reservationItems.map((item) => ({
      ticket_type: item.ticket_type,
      quantity: item.quantity,
    })),
    showTitle,
  });

  console.log("[PAGO] Description:", description);

  const serverTimeNow = new Date();

  return (
    <>
      <Stepper currentStep="Pago" />
      <ReservationCountdown
        expiresAt={reservationFromDB.expires_at}
        timeNow={serverTimeNow}
      />
      <Pago orderId={boldOrderId} amount={reservationFromDB.total_price} integritySignature={integritySignature} description={description} />
    </>
  );
}
