// app/pago/page.tsx
"use client";

import { useEffect } from "react";

export default function Pago({
  orderId,
  amount,
  integritySignature,
  description,
}: {
  orderId: string;
  amount: number;
  integritySignature: string;
  description: string;
}) {
  useEffect(() => {
    const script = document.createElement("script");
    script.setAttribute("data-bold-button", "dark-M");
    script.setAttribute(
      "data-api-key",
      "0MqG7laTM4C9_jnAqgWFGKa91w4bB1E8Jb7RcPvnuS4"
    );
    script.setAttribute("data-order-id", orderId);
    script.setAttribute("data-amount", amount.toString());
    script.setAttribute("data-integrity-signature", integritySignature);
    script.setAttribute("data-description", description);
    script.setAttribute("data-currency", "COP");
    script.setAttribute(
      "data-redirect-url",
      "https://www.teatrodelembuste.com/boletas/verificacion"
    );
    script.setAttribute("data-tax", "vat-19");
    // Add any other attributes as needed
    script.async = true;
    document.getElementById("bold-button-container")?.appendChild(script);
  }, [amount, description, integritySignature, orderId]);

  return (
    <div style={{ marginTop: 40, marginLeft: 40, fontFamily: "sans-serif", maxWidth: 500 }}>
    <main>
      <h1>Pago</h1>
      <br />
      <br />
      <br />
      <p>
        El Teatro del Embuste realiza sus pagos electrónicos a través de esta
        página web y en su sede física utilizando Bold.
      </p>
      <br />
      <br />
      <p>
        Para completar tu pago de forma exitosa, haz clic en el botón que
        aparece abajo. Recuerda no cerrar esta ventana durante el proceso.
      </p>
      <br />
      <br />
      <p>
        Una vez tu transacción haya sido aprobada, regresarás automáticamente a
        la página del Teatro del Embuste después de un minuto. Si prefieres,
        también puedes volver antes haciendo clic en el botón{" "}
        <strong>REGRESAR A LA TIENDA</strong>.
      </p>
      <br />
      <br />
      <div id="bold-button-container"></div>
    </main>
    </div>
  );
}
