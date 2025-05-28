import React from "react";
import { format, subDays } from "date-fns";

import { DiscountRuleDTO, PricingDTO } from "@/types/Event";
import { getDiscountedPrice } from "@/utils/eventUtils";

interface DiscountsProps {
  discountRules: DiscountRuleDTO[];
  pricings: PricingDTO[];
  eventStartDate: string;
}

const Discounts: React.FC<DiscountsProps> = ({
  discountRules,
  pricings,
  eventStartDate,
}) => {
  return (
    <>
      {discountRules.map((rule, index) => {
        // TODO discountRules code has to handle other types of discounts
        if (rule.type !== "time_based") return null;

        const hasDeadline =
          rule.criteria.daysBeforeEvent !== undefined &&
          rule.criteria.daysBeforeEvent !== null;

        const untilDate = hasDeadline
          ? format(
            subDays(new Date(eventStartDate), rule.criteria.daysBeforeEvent!),
            "dd/MM"
          )
          : null;

        return (
          <div key={index}>
            <h3 className="fontSecondaryMedium">PREVENTA</h3>
            {hasDeadline && <p>HASTA {untilDate}</p>}
            <ul>
              {pricings.map((pricing) => {
                const discountedPrice = getDiscountedPrice(
                  pricing.price,
                  rule.discount
                );
                return (
                  <li key={pricing.type}>
                    <strong>
                      {pricing.type === "standard" ? "GENERAL" : "ESTUDIANTE"}
                      {":"}
                    </strong>{" "}
                    {discountedPrice.toLocaleString("es-CO", {
                      currency: "COP",
                      minimumFractionDigits: 0,
                    })}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </>
  );
};

export default Discounts;
