import classNames from "classnames";

import styles from "@/styles/Show/Show.module.css";

import { EventDTO } from "@/types/Event";
import { CategoryDTO } from "@/types/Show";

import Category from "../../shared/Category";

import { formatEventDateRange } from "@/utils/eventUtils";

type ShowInfoProps = {
  category: CategoryDTO;
  eventData: EventDTO | null;
  showHasEvent: boolean;
};

export default function ShowInfo({ category, eventData, showHasEvent }: ShowInfoProps) {
  return (
    <div
      className={classNames(styles.showInfo, {
        [styles.showNotBeingPerformed]: !showHasEvent,
      })}
    >
      <Category
        name={category.name}
        categoryHexColor={category.hexColor}
      />
      {eventData && showHasEvent && (
        <time
          className={classNames(styles.showDates, "colorTertiary")}
          dateTime={eventData.startDate}
        >
          {formatEventDateRange(eventData.startDate, eventData.endDate)}
        </time>
      )}
    </div>
  );
}
