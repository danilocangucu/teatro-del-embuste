import classNames from "classnames";
import styles from "@/styles/Show/Show.module.css";

import { ReviewDTO } from "@/types/Show";
import ShowReviewItem from "./ShowReviewItem";

function ShowReviews({ reviews }: { reviews: ReviewDTO[] | undefined }) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section
      className={classNames(styles.sectionSeparator, styles.showSection)}
    >
      <div className={styles.showReviews}>
        <h3 className="visuallyHidden">Reseñas</h3>
        {reviews.map((review) => (
          <ShowReviewItem key={review.author} review={review} />
        ))}
      </div>
    </section>
  );
}

export default ShowReviews;
