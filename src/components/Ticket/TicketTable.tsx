"use client";

import { useEffect, useState } from "react";
import { PricingDTO, DiscountRuleDTO } from "@/types/Event";
import { getDiscountedPrice } from "@/utils/sharedUtils";
import { useParams, useRouter } from "next/navigation";
import { Button } from "../shared/Button";

// TODO senior should be gone
type TicketType = "standard" | "student" | "senior"; // Enum-like union type

interface Props {
  pricing: PricingDTO[];
  discountRule?: DiscountRuleDTO;
  discountActive: boolean;
  reservation: {
    id: string;
    items: {
      id: string;
      ticketType: TicketType;
    }[];
  };
  reservationWasCreatedNow: boolean;
  availableSeatsNow: number;
}

export function TicketTable({
  pricing,
  discountRule,
  discountActive,
  reservation,
  reservationWasCreatedNow,
  availableSeatsNow,
}: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reservationItems, setReservationItems] = useState<any[]>(
    reservationWasCreatedNow ? reservation.items : []
  ); // adjust type as needed
  const [quantities, setQuantities] = useState<Record<TicketType, number>>({
    standard: 0,
    student: 0,
    senior: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [initialReservedTickets, setInitialReservedTickets] =
    useState<number>(0);
  const [availableSeats, setAvailableSeats] = useState(availableSeatsNow);

  const router = useRouter();
    const params = useParams();


  const handleButtonClick = async () => {
  const { showSlug, performanceSlug } = await params;

  console.log("////////////////")
  console.log("showSlug/performanceSlug", `${showSlug}/${performanceSlug}`);
    console.log("////////////////")

  try {
    const res = await fetch("/api/tickets/reservations/review", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationId: reservation.id }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Failed to update reservation for review:", errorData);
      return; // exit without navigating
    }

    console.log("Reservation updated successfully");
    router.push(`/boletas/${showSlug}/${performanceSlug}/identidad`);
  } catch (error) {
    console.error("Unexpected error updating reservation:", error);
  }
};

  console.log("reservationWasCreatedNow", reservationWasCreatedNow);
  console.log("reservations.items.length", reservation.items.length);
  useEffect(() => {
    console.log("---------------------");
    console.log("useEffect 1");
    console.log("---------------------");
    if (!reservationWasCreatedNow && reservation.items.length > 0) {
      setIsLoading(true);
      const fetchReservationItems = async () => {
        console.log("Fetching reservation items");
        try {
          const res = await fetch("/api/tickets/reservations/items", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reservationItemIds: reservation.items.map((item) => item.id),
            }),
          });

          if (!res.ok) {
            console.error("Failed to fetch reservation items");
            setIsLoading(false);
            return;
          }

          const data = await res.json();
          setReservationItems(data.reservationItems); // or whatever your API returns

          const totalReserved = data.reservationItems.reduce(
            (acc: number, item: { quantity: number }) => acc + item.quantity,
            0
          );
          setInitialReservedTickets(totalReserved);
        } catch (error) {
          console.error("Error fetching reservation items:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchReservationItems();
    }
  }, [reservationWasCreatedNow, reservation.items]);

  console.log("reservationItems in TicketTable", reservationItems);

  useEffect(() => {
    console.log("---------------------");
    console.log("useEffect 2");
    console.log("---------------------");

    if (reservationItems.length > 0) {
      const standardItem = reservationItems.find(
        (item) => item.ticketType === "standard"
      );
      const studentItem = reservationItems.find(
        (item) => item.ticketType === "student"
      );

      // TODO senior should be gone
      setQuantities({
        standard: standardItem ? standardItem.quantity : 0,
        student: studentItem ? studentItem.quantity : 0,
        senior: 0
      });
    }
  }, [reservationItems]);

  console.log("quantities", quantities);

  const formatCOP = (amount: number) =>
    amount.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });

  const maxSelectableTickets = Math.min(
    availableSeats + initialReservedTickets,
    10
  );

  const totalPrice = pricing.reduce((acc, { type, price }) => {
    const quantity = quantities[type] || 0;
    const isEligible =
      discountActive && discountRule?.criteria.ticketTypes?.includes(type);
    // TODO check if discountRule is always available
    const unitPrice = isEligible
      ? getDiscountedPrice(price, discountRule!.discount)
      : price;
    return acc + unitPrice * quantity;
  }, 0);

  const handleQuantityChange = async (
    type: TicketType,
    newQuantity: number
  ) => {
    console.log("++++++++++++++++");
    console.log("handleQuantityChange", type, newQuantity);
    console.log("reservationItems", reservationItems);
    console.log("+++++++++++++++++");
    const item = reservationItems.find((i) => i.ticketType === type);

    if (!item) {
      console.error("No reservation item found for type:", type);
      return;
    }

    const prevQuantity = quantities[type];

    setIsLoading(true);

    try {
      const res = await fetch("/api/tickets/reservations/items", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservationItemId: item.id,
          newQuantity,
        }),
      });

      if (!res.ok) {
        console.error("Failed to update reservation item");
        return;
      }

      const data = await res.json(); // { reservationItemQuantity, availableSeats }

      // 1. Update quantities
      setQuantities((prev) => ({
        ...prev,
        [type]: data.reservationItemQuantity,
      }));

      setReservationItems((prevItems) =>
        prevItems.map((ri) =>
          ri.id === item.id
            ? { ...ri, quantity: data.reservationItemQuantity }
            : ri
        )
      );
      // 2. Update initialReservedTickets (difference of change)
      setInitialReservedTickets(
        (prev) => prev + (data.reservationItemQuantity - prevQuantity)
      );

      setAvailableSeats(data.availableSeats);
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const hideTable =
    quantities.standard === 0 &&
    quantities.student === 0 &&
    maxSelectableTickets === 0 &&
    availableSeatsNow === 0;

  console.log("reservation.id", reservation.id);

  const isButtonActive = reservationItems.some((item) => item.quantity > 0);

  console.log("isButtonActive", isButtonActive);

  return (
    <>
      {!isLoading &&
        (quantities.standard === 0 &&
        quantities.student === 0 &&
        maxSelectableTickets === 0 ? (
          <p style={{ color: "red", fontWeight: "bold" }}>
            No hay entradas disponibles para esta función.
          </p>
        ) : (
          <p style={{ color: "green", fontWeight: "bold" }}>
            Selecciona tus entradas:
          </p>
        ))}
      <br />
      {quantities.standard === 0 &&
        quantities.student === 0 &&
        maxSelectableTickets === 0 &&
        availableSeatsNow === 0 && (
          <p style={{ color: "red", fontWeight: "bold" }}>
            Table should not appear.
          </p>
        )}
      {!hideTable && (
        <>
          AVAILABLE SEATS NOW: {availableSeats}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Boleta</th>
                <th>Precio</th>
                <th>Descuento</th>
                <th>Cantidad</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {pricing.map(({ type, price }) => {
                const quantity = quantities[type] || 0;
                const isEligible =
                  discountActive &&
                  discountRule?.criteria.ticketTypes?.includes(type);
                // TODO check if discountRule is always available
                const discountedPrice = isEligible
                  ? getDiscountedPrice(price, discountRule!.discount)
                  : price;
                const discountAmount = price - discountedPrice;

                return (
                  <tr key={type}>
                    <td>{type === "standard" ? "General" : "Estudiante"}</td>
                    <td>{formatCOP(price)}</td>
                    <td>
                      {isEligible ? `-${formatCOP(discountAmount)}` : "-"}
                    </td>
                    <td>
                      <select
                        disabled={
                          isLoading || // disable while loading
                          quantities[
                            type === "standard" ? "student" : "standard"
                          ] >= maxSelectableTickets
                        }
                        value={quantity}
                        onChange={(e) => {
                          const newQuantity = Number(e.target.value);
                          handleQuantityChange(type, newQuantity);
                        }}
                      >
                        {Array.from({ length: 11 }, (_, i) => {
                          const otherType: TicketType =
                            type === "standard" ? "student" : "standard";
                          const otherQuantity = quantities[otherType];
                          const maxTotal = maxSelectableTickets;
                          const maxAllowedForThisType =
                            maxTotal - otherQuantity;
                          return i <= maxAllowedForThisType ? (
                            <option key={i} value={i}>
                              {i}
                            </option>
                          ) : null;
                        })}
                      </select>
                    </td>
                    <td>{formatCOP(discountedPrice * quantity)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={3}
                  style={{ textAlign: "right", fontWeight: "bold" }}
                >
                  Total entradas:
                </td>
                <td style={{ fontWeight: "bold" }}>
                  {quantities.standard + quantities.student}
                </td>
                <td style={{ fontWeight: "bold" }}>{formatCOP(totalPrice)}</td>
              </tr>
            </tfoot>
          </table>
          <Button onClick={handleButtonClick} disabled={!isButtonActive}>
            Go to Identidad
          </Button>
        </>
      )}
    </>
  );
}
