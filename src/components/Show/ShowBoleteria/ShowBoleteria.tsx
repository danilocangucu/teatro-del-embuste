"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import classNames from "classnames";

import styles from "../../../styles/Show/Boleteria/BoleteriaAccordion.module.css";

import { EventDTO } from "@/types/Event";

import Discounts from "./Discounts";
import Pricings from "./Pricings";
import PerformanceList from "./PerformanceList";

function ShowBoleteria({ eventData, showSlug }: { eventData: EventDTO, showSlug: string }) {
  const [open, setOpen] = useState(true);

  const areDiscountsAvailable =
    eventData.discountRules && eventData.discountRules.length > 0;

  return (
    <Accordion.Root
      type="single"
      collapsible
      value={open ? "item-1" : ""}
      onValueChange={(val) => setOpen(val === "item-1")}
      className={styles.boleteriaAccordionRoot}
    >
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger
            className={classNames(
              styles.boleteriaAccordionTrigger,
              styles.boleteriaAccordionBlock,
              "fontSecondaryMedium"
            )}
          >
            BOLETERÍA
            <ChevronDownIcon
              className={styles.boleteriaChevronIcon}
              style={{
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
              }}
              aria-hidden
            />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content
          className={classNames(
            styles.boleteriaAccordionContent,
            styles.boleteriaAccordionBlock,
            "fontSecondaryMedium"
          )}
        >
          {/* TODO check if discountRules will ALWAYS be available */}
          {/* TODO check with Matías and Angélica if there's a possibility of having more than 1 discountRule at a time */}
          <div
            className={classNames(styles.boleteriaPricings, {
              [styles.boleteriaPricingsGrid]: areDiscountsAvailable,
            })}
          >
            {areDiscountsAvailable && (
              <Discounts
                discountRules={eventData.discountRules!}
                pricings={eventData.pricings}
                eventStartDate={eventData.startDate}
              />
            )}
            <Pricings pricings={eventData.pricings} />
          </div>
          <PerformanceList
            performances={eventData.performances}
            eventData={eventData}
            showSlug={showSlug}
          />
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

export default ShowBoleteria;
