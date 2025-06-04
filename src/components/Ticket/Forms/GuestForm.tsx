"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../shared/Button";
import Link from "next/link";
import { useRouter } from 'nextjs-toploader/app';
import { useTopLoader } from 'nextjs-toploader';


interface GuestFormProps {
  reservationId: string;
  eventId: string;
  performanceId: string;
  showSlug: string;
  performanceSlug: string;
  user?: {
    full_name?: string;
    email?: string;
    phone?: string;
  };
}

export function GuestForm({
  reservationId,
  eventId,
  performanceId,
  showSlug,
  performanceSlug,
  user,
}: GuestFormProps) {
  const router = useRouter();
  const loader = useTopLoader();

  const [isSubmittingGuest, setIsSubmittingGuest] = useState(false);
  const [isGoingBack, setIsGoingBack] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      fullName: user?.full_name || "",
      email: user?.email || "",
      repeatEmail: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const guestEmail = watch("email");

  const onSubmitGuest = async (data: {
    fullName: string;
    email: string;
    repeatEmail: string;
    phone?: string;
  }) => {
    loader.start();
    if (data.email !== data.repeatEmail) {
      alert("Los correos no coinciden.");
      return;
    }

    setIsSubmittingGuest(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          isGuest: true,
          reservationId: reservationId,
        }),
      });

      const json = await res.json();
      if (json.success) {
        const updateRes = await fetch("/api/tickets/reservations", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            performanceId,
            userId: json.userId,
          }),
        });

        if (!updateRes.ok)
          throw new Error("Failed to update reservation cookie");
        router.push(`/boletas/${showSlug}/${performanceSlug}/revision`);
        console.log("..............................");
        console.log("Returning...");
        console.log("..............................");
      } else {
        alert("Algo salió mal al crear el usuario.");
        setIsSubmittingGuest(false);
      }
    } catch (err) {
      console.error(err);
      alert(`Error en el servidor: ${err}`);
            setIsSubmittingGuest(false);
    }
  };

  const onGoBack = () => {
    setIsGoingBack(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmitGuest)} style={{ marginTop: 16 }}>
      <input
        {...register("fullName", {
          required: "Este campo es obligatorio",
          pattern: {
            value: /^[a-zA-ZÀ-ÖØ-öø-ÿ' -]+$/,
            message:
              "Nombre inválido. Solo letras, espacios, apóstrofes y guiones son permitidos.",
          },
        })}
        placeholder="Nombre completo"
        style={inputStyle}
      />
      {errors.fullName && (
        <p style={{ color: "red" }}>{errors.fullName.message}</p>
      )}

      <input
        {...register("email", {
          required: "Este campo es obligatorio",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Correo inválido",
          },
        })}
        placeholder="Correo electrónico"
        type="email"
        style={inputStyle}
      />
      {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}

      <input
        {...register("repeatEmail", {
          required: "Repite tu correo",
          validate: (value) =>
            value === guestEmail || "Los correos no coinciden",
        })}
        placeholder="Repetir correo electrónico"
        type="email"
        style={inputStyle}
      />
      {errors.repeatEmail && (
        <p style={{ color: "red" }}>{errors.repeatEmail.message}</p>
      )}

      <p
        style={{ marginTop: -8, marginBottom: 12, fontSize: 14, color: "#555" }}
      >
        Certifica que tu correo es válido. Las boletas serán enviadas a tu
        correo.
      </p>

      <input
        {...register("phone", {
          pattern: {
            value: /^[+]?[\d\s()-]{7,20}$/,
            message: "Número de teléfono no válido",
          },
        })}
        placeholder="Teléfono (opcional)"
        type="tel"
        style={inputStyle}
      />
      {errors.phone && <p style={{ color: "red" }}>{errors.phone.message}</p>}
      <p
        style={{ marginTop: -8, marginBottom: 16, fontSize: 14, color: "#555" }}
      >
        No tienes que insertar tu número, pero es recomendable.
      </p>

      <br />
      <br />

      <Link href={`/boletas/${showSlug}/${performanceSlug}`}>
        <Button onClick={onGoBack} disabled={isSubmittingGuest || isGoingBack}>
          { isGoingBack ? "Cargando..." : "Volver a boletas"}
        </Button>
      </Link>
      <Button type="submit" disabled={!isValid || isSubmittingGuest || isGoingBack}>
        {isSubmittingGuest ? "Cargando..." : "Revisar Pedido"}
      </Button>
    </form>
  );
}

const inputStyle = {
  display: "block",
  marginBottom: 12,
  padding: 8,
  width: "100%",
  border: "1px solid #ccc",
  borderRadius: 4,
};
