"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "../shared/Button";
import { PerformanceFromDB } from "@/types/Event";

export function Review({
  showTitle,
  performance,
  reservation,
  reservationItems,
  user,
  showSlug,
  performanceSlug,
}: {
  showTitle: string;
  performance: PerformanceFromDB;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reservation: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reservationItems: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  showSlug: string;
  performanceSlug: string;
}) {
  const router = useRouter();

  return (
    <div style={styles.container}>
      {/* Show and performance details */}
      <section style={styles.section}>
        <h2 style={styles.heading}>{showTitle}</h2>
        <br />
        <br />
        <br />
        <p>
          Fecha: {performance.date.toISOString()} – Hora:{" "}
          {performance.time!.toISOString()}
        </p>
        <br />
      </section>

      {/* Ticket summary */}
      <br />
      <br />
      <section style={styles.section}>
        <h3 style={styles.subheading}>Resumen de Boletas</h3>
        <br />
        <br />
        <div style={styles.itemList}>
          {reservationItems.map((item, idx) => (
            <div key={item.id ?? idx} style={styles.itemBox}>
              <p>
                <strong>Tipo:</strong> {item.ticket_type}
              </p>
              <br />
              <p>
                <strong>Cantidad:</strong> {item.quantity}
              </p>
              <br />
              <p>
                <strong>Precio unitario:</strong> $
                {item.unit_price.toLocaleString("es-CO")}
              </p>
              <br />
              {item.discount ? (
                <>
                  <p>
                    <strong>Descuento:</strong> {item.discount.description} (
                    {item.discount.type === "flat" ? "-" : "%"}
                    {item.discount.value})
                  </p>
                  <br />
                </>
              ) : (
                <>
                  <p>Sin descuento</p>
                  <br />
                </>
              )}
              <p>
                <strong>Total:</strong> $
                {item.total_price.toLocaleString("es-CO")}
              </p>
              <br />
              <br />
            </div>
          ))}
        </div>
        <p style={styles.totalPrice}>
          Total a pagar: ${reservation.total_price.toLocaleString("es-CO")}
        </p>
        <br />
        <br />
        <Button
          onClick={() => router.push(`/boletas/${showSlug}/${performanceSlug}`)}
        >
          Editar boletas
        </Button>
      </section>
      <br />
      <br />
      <br />
      <br />

      {/* User information */}
      <section style={styles.section}>
        <h3 style={styles.subheading}>Identificación</h3>
        <br />
        <br />
        <p>
          <strong>Nombre:</strong> {user.full_name}
        </p>
        <br />
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <br />
        <p>
          <strong>Teléfono:</strong> {user.phone}
        </p>
        <br />
        <br />
        <Button
          onClick={() =>
            router.push(`/boletas/${showSlug}/${performanceSlug}/identidad`)
          }
        >
          Editar identificación
        </Button>
      </section>
      <br />
      <br />

      <Button
        onClick={() => {
          window.location.href = `/boletas/pago?reserva=${reservation.id}`;
        }}
      >
        Continuar a Pago
      </Button>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    fontFamily: "sans-serif",
  },
  section: {
    marginBottom: "32px",
  },
  heading: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  subheading: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "6px",
  },
  itemList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    marginBottom: "16px",
  },
  itemBox: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  totalPrice: {
    fontWeight: "bold",
    marginBottom: "12px",
  },
};
