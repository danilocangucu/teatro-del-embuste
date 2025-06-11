"use client";

import { useState } from "react";
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";

type Props = {
  eventId: string;
  performanceId: string;
  secretKey: string;
};

export default function TicketValidator({
  eventId,
  performanceId,
  secretKey,
}: Props) {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);

  const onScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (paused || loading || detectedCodes.length === 0) return;
    setPaused(true);
    setLoading(true);
    setResult(null);

    try {
      const { rawValue } = detectedCodes[0];
      const url = new URL(rawValue);
      const id = url.searchParams.get("id");
      const type = url.searchParams.get("type");

      if (!id || !type) {
        setResult("❌ QR inválido: falta ID o tipo");
        return;
      }

      const res = await fetch("/api/tickets/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          performanceId,
          ticketId: id,
          type,
          secretKey,
        }),
      });

      const data = await res.json();
      setResult(data.message || "⚠️ Respuesta inesperada");
    } catch (err) {
      console.error("Error validating ticket:", err);
      setResult("❌ Error al validar la boleta");
    } finally {
      setLoading(false);
    }
  };

  const onError = (err: unknown) => {
    console.error("Scanner error:", err);
    setResult("❌ Error al acceder a la cámara");
  };

  const handleReset = () => {
    setResult(null);
    setPaused(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🎫 Escanear Boleta</h1>
      <Scanner
        onScan={onScan}
        onError={onError}
        paused={paused}
        scanDelay={500}
        formats={["qr_code"]}
        allowMultiple={false}
        styles={{
          container: {
            width: "100%",
            height: "100%",
            borderRadius: 8,
            overflow: "hidden",
            marginBottom: 20,
          },
          video: {
            objectFit: "cover",
          },
        }}
      />

      {loading && <p>Validando...</p>}
      {result && (
        <div style={{ marginTop: 20 }}>
          <p>{result}</p>
          <button onClick={handleReset} style={{ padding: 8, marginTop: 8 }}>
            🔄 Escanear otra
          </button>
        </div>
      )}
    </div>
  );
}
