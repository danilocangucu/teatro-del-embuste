import Image from "next/image";

import { ReviewDTO } from "@/types/Show";

import styles from "@/styles/Show/Show.module.css";
import { arrowRightUp } from "@/utils/constants";

function ReviewItem({ review }: { review: ReviewDTO }) {
  return (
    <div className={styles.showReview}>
      <figure>
        <blockquote className="fontPrimaryItalic">
          <p>“{review.excerpt}”</p>
        </blockquote>
        <figcaption className="fontPrimary">
          — {review.author},{" "}
          <a
            href={review.url}
            target="_blank"
            rel="noopener noreferrer"
            className="activeLink"
          >
            {review.publication}
            <small className="arrowRightUp">
              <Image
                src={arrowRightUp}
                alt="Ir a la fuente"
                className="arrowRightUp"
                width={15}
                height={15}
              />
            </small>
          </a>
        </figcaption>
      </figure>
    </div>
  );
}

export default ReviewItem;
