import { DiscountRuleDTO, EventDTO, PerformanceDTO, TicketType } from "@/types/Event";
import { Stepper } from "../shared/Stepper";
import { SetReservationCookieClient } from "./SetReservationCookieClient";
import { TicketTable } from "./TicketTable";

type TicketSelectionPageProps = {
  showTitle: string;
  performanceInEvent: PerformanceDTO | null;
  mappedEvent: EventDTO;
  discountRule?: DiscountRuleDTO;
  discountActive?: boolean;
  ticketStatus?: "" | "AGOTADA" | "ÚLTIMAS BOLETAS" | undefined;
  reservation?: {
    id: string;
    timeNow: Date;
    expiresAt: Date;
    items: Array<{ id: string; ticketType: TicketType }>;
  };
  reservationWasCreatedNow: boolean;
};
// TODO add types for params in TicketSelectionPage
export async function TicketSelectionPage({
  showTitle,
  performanceInEvent,
  mappedEvent,
  discountRule,
  discountActive,
  ticketStatus,
  reservation,
  reservationWasCreatedNow,
}: TicketSelectionPageProps) {
  if (!performanceInEvent) {
    if (mappedEvent?.performances.length !== 0) {
      return (
        <div style={{ padding: "2rem" }}>
          <h2>Esta función no existe.</h2>
          <p>Puedes escoger otra función disponible para este espectáculo.</p>
        </div>
      );
    }

    return (
      <div style={{ padding: "2rem" }}>
        <h2>No hay funciones disponibles.</h2>
        <p>Tal vez quieras revisar nuestra programación actual.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
      {/* Step indicator */}
      <Stepper currentStep="Boletas"/>

      <header style={{ marginBottom: "2rem" }}>
        <h1>{showTitle}</h1>
        <br />
        <br />
        <h2 style={{ marginTop: "1rem" }}>Detalles de la función</h2>
        <br />
        <p>
          <strong>Fecha:</strong> {performanceInEvent.date}
        </p>
        <br />
        <p>
          <strong>Hora:</strong> {performanceInEvent.time}
        </p>
        <br />
        {mappedEvent.performances.length > 1 && (
          <p
            style={{
              textDecoration: "underline",
              cursor: "pointer",
              marginTop: "0.5rem",
            }}
          >
            Ir a todas las funciones disponibles
          </p>
        )}
      </header>

      {/* Discount info */}
      {discountActive && discountRule && (
        <>
          <p style={{ color: "green", marginBottom: "1rem" }}>
            {discountRule.discount.description}! – Ahorra{" "}
            {discountRule.discount.value} COP en entradas seleccionadas
          </p>
          <br />
          <br />
        </>
      )}

      {/* Ticket countdown timer */}
      {reservation && (
        <p style={{ color: "orange", marginBottom: "1rem" }}>
          Tienes {Math.floor((reservation.expiresAt.getTime() - reservation.timeNow.getTime()) / 1000)} segundos para completar tu compra.
        </p>
      )}
      {/* Ticket countdown expiresAt and timeNow */}
      {reservation && (
        <><br /><br />
          <p style={{ color: "orange", marginBottom: "1rem" }}>
            Expira el: {reservation.expiresAt.toLocaleString()}
          </p><br />
          <p style={{ color: "orange", marginBottom: "1rem" }}>
            Hora actual: {reservation.timeNow.toLocaleString()}
          </p>
          <br /><br />
        </>
      )}


      {/* Ticket status */}

      {/* Ticket status errors */}
      {ticketStatus && ticketStatus !== "AGOTADA" && (
        <>
          <p style={{ color: "red", marginBottom: "1rem" }}>{ticketStatus}</p>
          <br />
          <br />
        </>
      )}

      {/* Main ticketing content */}
        <>
          {reservationWasCreatedNow && mappedEvent.id && reservation && (
            <SetReservationCookieClient
              eventId={mappedEvent.id}
              expiresAt={reservation.expiresAt}
              performanceId={performanceInEvent.id}
              reservationId={reservation.id}
              reservationItems={reservation.items}
            />
          )}
          {mappedEvent.id && reservation && (
          <TicketTable
            pricing={mappedEvent.pricings}
            discountRule={discountRule}
            discountActive={!!discountActive}
            reservation={reservation}
            reservationWasCreatedNow={reservationWasCreatedNow}
            availableSeatsNow={performanceInEvent.availableSeats}
          />)
          }
        </>
    </div>
  );
}
