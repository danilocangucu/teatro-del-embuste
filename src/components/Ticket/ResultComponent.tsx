"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ResultComponent({ reservation }: { reservation: any }) {
  return (
    <div>
      <h1>Confirmación de Reserva</h1><br/><br/><br/>
      <p>Reserva ID: {reservation.id}</p><br/>
      <p>Estado: {reservation.status}</p><br/>
      {/* Add more reservation details as needed */}
    </div>
  );
}