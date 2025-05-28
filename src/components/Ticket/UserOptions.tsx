"use client";

import React, { useState } from "react";
import { Button } from "../shared/Button";
import { useRouter } from "next/navigation";

export function UserOptions({ reservationId, eventId, performanceId }: { reservationId: string, eventId: string, performanceId: string }) {
  const [selected, setSelected] = useState<"login" | "create" | "guest">(
    "login"
  );
  const [isSubmittingGuest, setIsSubmittingGuest] = useState(false);
  // TODO : Replace with actual slug logic
  const showSlug = "la-secreta";
  const performanceSlug = "07-06-25-6PM";
  const router = useRouter();

  return (
    <div style={{ marginTop: 40, fontFamily: "sans-serif", maxWidth: 500 }}>
      {/* === SELECTED SECTION === */}
      {selected === "login" && (
        <>
          <h2>Inicia sesión</h2>
          <br />
          <br />
          <p>
            Usa tus credenciales si ya tienes una cuenta en el Teatro del
            Embuste.
          </p>
          <form style={{ marginTop: 16 }}>
            <input type="text" placeholder="Usuario" style={inputStyle} />
            <input
              type="password"
              placeholder="Contraseña"
              style={inputStyle}
            />
            <Button onClick={() => alert("Login clicked (no real action yet)")}>
              Ingresar
            </Button>
          </form>
        </>
      )}

      {selected === "create" && (
        <>
          <h2>Crear cuenta</h2>
          <br />
          <br />
          <p style={{ marginBottom: 12 }}>
            🪄 5% de descuento en todas tus compras de boletas durante un año.
            <br />
            (Se aplica sobre el total, incluso si ya hay descuento).
          </p>
          <form style={{ marginTop: 16 }}>
            <input type="text" placeholder="Usuario" style={inputStyle} />
            <input
              type="email"
              placeholder="Correo electrónico"
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Contraseña"
              style={inputStyle}
            />
            <Button
              onClick={() =>
                alert("Create Account clicked (no real action yet)")
              }
            >
              Crear cuenta
            </Button>
          </form>
        </>
      )}

      {selected === "guest" && (
        <>
          <h2>Comprar como invitad@</h2>
          <br />
          <br />
          <p style={{ marginBottom: 12 }}>
            🕊 Tu información personal solo se usará para esta compra. Después de
            la función, será eliminada automáticamente.
          </p>
          <form
            style={{ marginTop: 16 }}
            onSubmit={async (e) => {
              e.preventDefault();

              const formData = new FormData(e.currentTarget);
              const fullName = formData.get("name") as string;
              const email = formData.get("email") as string;
              const repeatEmail = formData.get("repeatEmail") as string;
              const phone = formData.get("phone") as string;

              if (email !== repeatEmail) {
                alert("Los correos no coinciden.");
                return;
              }

              setIsSubmittingGuest(true);

              try {
                const res = await fetch("/api/users", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    fullName,
                    email,
                    phone,
                    isGuest: true,
                    reservationId: reservationId,
                  }),
                });

                const data = await res.json();

                console.log("[UserOptions] Response from user creation:", data);

                if (data.success) {
                  console.log("Will try to update cookie with body:", {
                    eventId,
                    performanceId,
                    reservationId,
                    userId: data.userId,
                  }
                  )
                  // Update cookie
                  const updateRes = await fetch("/api/tickets/reservations", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      eventId, performanceId,
                      userId: data.userId,
                    }),
                  });

                  if (!updateRes.ok) {
                    throw new Error("Failed to update reservation cookie");
                  }
                  console.log("Cookie updated with user ID:", data.userId);
                  console.log("Response from cookie update:", await updateRes.json());
                  console.log("Redirigiendo a la página de pago...");
                  router.push(`/boletas/${showSlug}/${performanceSlug}/revision`)
                  // Optionally redirect to payment or next step
                } else {
                  alert("Algo salió mal al crear el usuario.");
                }
              } catch (err) {
                console.error(err);
                alert(`Error en el servidor: ${err}`);
              } finally {
                setIsSubmittingGuest(false);
              }
            }}
          >
            <input
              type="text"
              name="name"
              required
              placeholder="Nombre completo"
              style={inputStyle}
            />
            <input
              type="email"
              name="email"
              required
              placeholder="Correo electrónico"
              style={inputStyle}
            />
            <input
              type="email"
              name="repeatEmail"
              required
              placeholder="Repetir correo electrónico"
              style={inputStyle}
            />
            <p
              style={{
                marginTop: -8,
                marginBottom: 12,
                fontSize: 14,
                color: "#555",
              }}
            >
              Certifica que tu correo es válido. Las boletas serán enviadas a tu
              correo.
            </p>
            <input
              type="tel"
              name="phone"
              placeholder="Teléfono (opcional)"
              style={inputStyle}
            />
            <p
              style={{
                marginTop: -8,
                marginBottom: 16,
                fontSize: 14,
                color: "#555",
              }}
            >
              No tienes que insertar tu número, pero es recomendable. Podremos
              contactarte con más facilidad, por ejemplo, si la función se
              cancela o algo.
            </p>
            <br />
            <br />
            <Button type="submit" disabled={isSubmittingGuest}>
              {isSubmittingGuest ? "Enviando..." : "Continuar"}
            </Button>
          </form>
        </>
      )}

      {/* === ALTERNATIVE SECTIONS === */}
      {getAlternateOptions(selected, setSelected)}
    </div>
  );
}

// Updated helper with custom order logic
function getAlternateOptions(
  selected: "login" | "create" | "guest",
  setSelected: (value: "login" | "create" | "guest") => void
) {
  const sections = {
    login: {
      label: "Iniciar sesión",
      description:
        "Usa tus credenciales si ya tienes una cuenta en el Teatro del Embuste.",
    },
    create: {
      label: "Registrarme",
      description:
        "🪄 5% de descuento en todas tus compras de boletas durante un año.\n(Se aplica sobre el total, incluso si ya hay descuento).",
    },
    guest: {
      label: "Comprar como invitad@",
      description:
        "🕊 Tu información personal solo se usará para esta compra.\nDespués de la función, será eliminada automáticamente.",
    },
  };

  const alternateOrders: Record<
    typeof selected,
    Array<"login" | "create" | "guest">
  > = {
    login: ["create", "guest"],
    create: ["login", "guest"],
    guest: ["create", "login"],
  };

  return alternateOrders[selected].map((key, index) => (
    <div key={key}>
      <Separator
        text={index === 0 ? "––– o quizás... –––" : "––– también puedes... –––"}
      />
      <Button onClick={() => setSelected(key)}>{sections[key].label}</Button>
      <br />
      <br />
      <p style={{ marginBottom: 12, whiteSpace: "pre-wrap" }}>
        {sections[key].description}
      </p>
    </div>
  ));
}

// Reusable styles and components
const inputStyle = {
  display: "block",
  marginBottom: 12,
  padding: 8,
  width: "100%",
  border: "1px solid #ccc",
  borderRadius: 4,
};

function Separator({ text }: { text: string }) {
  return (
    <div style={{ textAlign: "center", margin: "32px 0", color: "#999" }}>
      {text}
    </div>
  );
}
