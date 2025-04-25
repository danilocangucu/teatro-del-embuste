import Image from "next/image";
import classNames from "classnames";
import styles from "@/styles/Show/Show.module.css";
import { useState } from "react";

type ShowImageProps = {
  mainImage: {
    url: string;
    artist?: string | null;
  };
};

export default function ShowImage({ mainImage }: ShowImageProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError || !mainImage.url) {
    return null;
  }

  return (
    <figure>
      <div className={styles.showImage}>
        <Image
          src={mainImage.url}
          alt="Logo del Teatro del Embuste"
          priority
          fill
          onError={handleImageError}
        />
      </div>
      {mainImage.artist && (
        <div
          className={classNames(
            styles.showFigcaption,
            "fontSecondaryMedium"
          )}
        >
          <figcaption>FOTOGRAFÍA: {mainImage.artist.toUpperCase()}</figcaption>
        </div>
      )}
    </figure>
  );
}
