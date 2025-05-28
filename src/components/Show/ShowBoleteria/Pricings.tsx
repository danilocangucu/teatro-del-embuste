import { PricingDTO } from "@/types/Event";

const Pricings = ({ pricings }: { pricings: PricingDTO[] }) => (
  <div>
    <h3 className="fontSecondaryMedium">PRECIOS ESTÁNDAR</h3>
    <ul>
      {pricings.map((pricing) => (
        <li key={pricing.type}>
          <strong>
            {pricing.type === "standard" ? "GENERAL" : "ESTUDIANTE"}
            {":"}
          </strong>{" "}
          {pricing.price.toLocaleString("es-CO", {
            currency: "COP",
            minimumFractionDigits: 0,
          })}
        </li>
      ))}
    </ul>
  </div>
);

export default Pricings;
