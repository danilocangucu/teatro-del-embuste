import { EventDTO } from "@/types/Event";

import styles from "@/styles/Show/Boleteria/BoleteriaAccordion.module.css";

import PerformanceItem from "./PerformanceItem";

import { getPerformanceSlugAndDate } from "@/utils/eventUtils";
import { getTicketStatus } from "@/utils/showUtils";

type PerformanceListProps = {
  performances: EventDTO["performances"];
  eventData: EventDTO;
  showSlug: string;
};

function PerformanceList({
  performances,
  eventData,
  showSlug,
}: PerformanceListProps) {
  const performanceItems = performances.map((performance) => {
    const performanceTime = performance.time || eventData.defaultTime;
    const { formattedDate, performanceSlug } = getPerformanceSlugAndDate(
      performance.date,
      performanceTime
    );
    const ticketStatus = getTicketStatus(
      performance.availableSeats,
      eventData.totalSeats
    );

    return (
      <li key={performance.date + performanceTime}>
        <PerformanceItem
          formattedDate={formattedDate}
          performanceSlug={performanceSlug}
          showSlug={showSlug}
          ticketStatus={ticketStatus}
        />
      </li>
    );
  });

  return (
    <div className={styles.boleteriaFunciones}>
      <h3>ELIGE Y COMPRA TUS BOLETAS</h3>
      <ul>{performanceItems}</ul>
    </div>
  );
}

export default PerformanceList;
