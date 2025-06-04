"use client";

import { useEffect, useState } from "react";
import { PricingDTO, DiscountRuleDTO } from "@/types/Event";
import { getDiscountedPrice } from "@/utils/sharedUtils";
import { useParams } from "next/navigation";
import { useRouter } from 'nextjs-toploader/app';
import { useTopLoader } from 'nextjs-toploader';


import { Button } from "../shared/Button";
import { reservation_status } from "@prisma/client";
import Link from "next/link";

type TicketType = "standard" | "student" | "senior";

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
    status: reservation_status | null;
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
    senior: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [initialReservedTickets, setInitialReservedTickets] =
    useState<number>(0);
  const [availableSeats, setAvailableSeats] = useState(availableSeatsNow);
  const [showSlug, setShowSlug] = useState<string>("");
  const [performanceSlug, setPerformanceSlug] = useState<string>("");
  const [onRevisarClicked, setOnRevisarClicked] = useState(false);
  const [onIdentidadClicked, setOnIdentidadClicked] = useState(false);

  const router = useRouter();
  const params = useParams();
  const loader = useTopLoader();


  const handleButtonClick = async () => {
    loader.start();
    setOnIdentidadClicked(true);
    setIsLoading(true);
    try {
      const res = await fetch("/api/tickets/reservations/review", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId: reservation.id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to update reservation for review:", errorData);
        setIsLoading(false);
        setOnIdentidadClicked(false);
        return; // exit without navigating
      }

      console.log("Reservation updated successfully");
      router.push(`/boletas/${showSlug}/${performanceSlug}/identidad`);
    } catch (error) {
      console.error("Unexpected error updating reservation:", error);
      setIsLoading(false);
      setOnIdentidadClicked(false);
    }
  };

  const handleRevisarClick = () => {
    setOnRevisarClicked(true);
  }

  useEffect(() => {
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
          setReservationItems(data.reservationItems);

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

  useEffect(() => {
    if (reservationItems.length > 0) {
      const standardItem = reservationItems.find(
        (item) => item.ticketType === "standard"
      );
      const studentItem = reservationItems.find(
        (item) => item.ticketType === "student"
      );

      setQuantities({
        standard: standardItem ? standardItem.quantity : 0,
        student: studentItem ? studentItem.quantity : 0,
        senior: 0,
      });
    }
  }, [reservationItems]);

  useEffect(() => {
    if (params.showSlug) {
      setShowSlug(params.showSlug as string);
    }
    if (params.performanceSlug) {
      setPerformanceSlug(params.performanceSlug as string);
    }
  }, [params.showSlug, params.performanceSlug]);

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

      const data = await res.json();

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

  const isButtonActive = reservationItems.some((item) => item.quantity > 0);

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
                          isLoading ||
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
          <Button onClick={handleButtonClick} disabled={!isButtonActive || isLoading || onRevisarClicked || onIdentidadClicked}>
            {onIdentidadClicked
              ? "Cargando..."
              : reservation.status === reservation_status.reviewing
                ? "Editar Identidad"
                : "Continuar a Identidad"}
          </Button>
          {isButtonActive && reservation.status === reservation_status.reviewing && (
            <Link href={`/boletas/${showSlug}/${performanceSlug}/revision`}>
              <Button disabled={isLoading || onRevisarClicked || onIdentidadClicked} onClick={handleRevisarClick}>
                {onRevisarClicked
                  ? "Cargando..."
                  : "Revisar Pedido"
                }
              </Button>
            </Link>
          )
          }
        </>
      )}
    </>
  );
}
