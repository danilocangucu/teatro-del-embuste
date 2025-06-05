"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useState } from "react";

type Props = {
  expiresAt: Date;
  timeNow: Date;
};

export default function ReservationCountdown({ expiresAt, timeNow }: Props) {
  const router = useRouter();

  const pathParams = useParams() as {
    showSlug?: string;
    performanceSlug?: string;
  };
  const searchParams = useSearchParams();

  const [effectiveShowSlug, setEffectiveShowSlug] = useState<string | null>(null);
  const [effectivePerformanceSlug, setEffectivePerformanceSlug] = useState<string | null>(null);

  const initialSecondsLeft = Math.floor(
    (expiresAt.getTime() - timeNow.getTime()) / 1000
  );
  const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft);

  useEffect(() => {
    const showSlugFromQuery = searchParams.get("showSlug");
    const performanceSlugFromQuery = searchParams.get("performanceSlug");

    if (showSlugFromQuery && performanceSlugFromQuery) {
      setEffectiveShowSlug(showSlugFromQuery);
      setEffectivePerformanceSlug(performanceSlugFromQuery);
    } else if (pathParams.showSlug && pathParams.performanceSlug) {
      setEffectiveShowSlug(pathParams.showSlug);
      setEffectivePerformanceSlug(pathParams.performanceSlug);
    } else {
      setEffectiveShowSlug(null);
      setEffectivePerformanceSlug(null);
    }
  }, [pathParams, searchParams]);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  if (!effectiveShowSlug || !effectivePerformanceSlug) {
    return <p>Loading timer...</p>;
  }

  const minutesLeft = Math.floor(secondsLeft / 60);

  if (secondsLeft <= 0) {
    return (
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #ccc",
          padding: "1rem",
          borderRadius: "8px",
          position: "fixed",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -30%)",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
          zIndex: 1000,
          textAlign: "center",
        }}
      >
        <p style={{ marginBottom: "1rem", color: "red", fontWeight: "bold" }}>
          La reserva ha expirado.
        </p>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => router.push(`/obra/${effectiveShowSlug}`)}
            style={{ padding: "0.5rem 1rem" }}
          >
            Volver a la obra
          </button>
           { /* TODO remove cookie before pushing */ }
          {/* TODO router.push no funciona si el usuario ya está en /boletas/${effectiveShowSlug}/${effectivePerformanceSlug} */}
          <button
            onClick={() =>
              router.push(`/boletas/${effectiveShowSlug}/${effectivePerformanceSlug}`)
            }
            style={{ padding: "0.5rem 1rem" }}
          >
            Intentar otra vez
          </button>
        </div>
      </div>
    );
  }

  let color = "green";
  if (minutesLeft <= 10) color = "orange";
  if (minutesLeft <= 5) color = "red";

  return (
    <p style={{ color, marginBottom: "1rem" }}>
      {minutesLeft >= 1 ? (
        <>
          Tienes {minutesLeft} minuto{minutesLeft !== 1 ? "s" : ""} para completar tu compra.
        </>
      ) : (
        <>
          Tienes {secondsLeft} segundo{secondsLeft !== 1 ? "s" : ""} para completar tu compra.
        </>
      )}
    </p>
  );
}
