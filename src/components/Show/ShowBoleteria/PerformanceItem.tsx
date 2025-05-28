import Link from "next/link";
import classNames from "classnames";
import styles from "../../../styles/Show/Boleteria/BoleteriaAccordion.module.css";
import { ticketsPath } from "@/utils/constants";

type Props = {
  formattedDate: string;
  performanceSlug: string;
  showSlug: string;
  ticketStatus: string;
};

export default function PerformanceItem({
  formattedDate,
  performanceSlug,
  showSlug,
  ticketStatus,
}: Props) {
  const isSoldOut = ticketStatus === "AGOTADA";
  const isLastTickets = ticketStatus === "ÚLTIMAS BOLETAS";

  return (
    <>
      <div
        className={classNames(
          [{ activeLink: !isSoldOut }],
          styles.boleteriaFuncionesLinks
        )}
      >
        {isSoldOut ? (
          <>{formattedDate}</>
        ) : (
            <Link href={`${ticketsPath}/${showSlug}/${performanceSlug}`}>
            {formattedDate}
          </Link>
        )}
      </div>

      {ticketStatus && (
        <div
          className={classNames(
            styles.boleteriaFuncionesStatus,
            isSoldOut
              ? styles.boleteriaFuncionesAgotada
              : isLastTickets
              ? styles.boleteriaFuncionesUltimas
              : ""
          )}
        >
          {ticketStatus}
        </div>
      )}
    </>
  );
}
