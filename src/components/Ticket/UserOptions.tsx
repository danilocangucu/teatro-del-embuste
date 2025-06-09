"use client";

import React, { useState } from "react";
import { Button } from "../shared/Button";

import { GuestForm } from "./Forms/GuestForm";

// TODO UserOptions showSlug and performanceSlug can come from query params
// TODO user type in UserOptions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UserOptions({ eventId, performanceId, showSlug, performanceSlug, user }: { eventId: string, performanceId: string, showSlug: string, performanceSlug: string, user: any }) {
  const [selected, setSelected] = useState<"login" | "create" | "guest">(
    "guest"
  );  
  console.log("[UserOptions] setSelected:", setSelected);

  return (
    <div style={{ marginTop: 40, marginLeft: 40, fontFamily: "sans-serif", maxWidth: 500 }}>
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
          <GuestForm
            eventId={eventId}
            performanceId={performanceId}
            showSlug={showSlug}
            performanceSlug={performanceSlug}
            user={user}
          />
        </>
      )}

      {/* === ALTERNATIVE SECTIONS === */}
      {/* {getAlternateOptions(selected, setSelected)} */}
    </div>
  );
}

// Updated helper with custom order logic
// function getAlternateOptions(
//   selected: "login" | "create" | "guest",
//   setSelected: (value: "login" | "create" | "guest") => void
// ) {
//   const sections = {
//     login: {
//       label: "Iniciar sesión",
//       description:
//         "Usa tus credenciales si ya tienes una cuenta en el Teatro del Embuste.",
//     },
//     create: {
//       label: "Registrarme",
//       description:
//         "🪄 5% de descuento en todas tus compras de boletas durante un año.\n(Se aplica sobre el total, incluso si ya hay descuento).",
//     },
//     guest: {
//       label: "Comprar como invitad@",
//       description:
//         "🕊 Tu información personal solo se usará para esta compra.\nDespués de la función, será eliminada automáticamente.",
//     },
//   };

//   const alternateOrders: Record<
//     typeof selected,
//     Array<"login" | "create" | "guest">
//   > = {
//     login: ["create", "guest"],
//     create: ["login", "guest"],
//     guest: ["create", "login"],
//   };

//   return alternateOrders[selected].map((key, index) => (
//     <div key={key}>
//       <Separator
//         text={index === 0 ? "––– o quizás... –––" : "––– también puedes... –––"}
//       />
//       <Button onClick={() => setSelected(key)}>{sections[key].label}</Button>
//       <br />
//       <br />
//       <p style={{ marginBottom: 12, whiteSpace: "pre-wrap" }}>
//         {sections[key].description}
//       </p>
//     </div>
//   ));
// }

// Reusable styles and components
const inputStyle = {
  display: "block",
  marginBottom: 12,
  padding: 8,
  width: "100%",
  border: "1px solid #ccc",
  borderRadius: 4,
};

// function Separator({ text }: { text: string }) {
//   return (
//     <div style={{ textAlign: "center", margin: "32px 0", color: "#999" }}>
//       {text}
//     </div>
//   );
// }
