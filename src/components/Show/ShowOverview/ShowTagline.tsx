import classNames from "classnames";

import styles from "@/styles/Show/Show.module.css";

function ShowTagline({ tagline }: { tagline: string }) {
    return (
      <div className={classNames(styles.showTagline, "fontPrimaryBold")}>
        <h2>{tagline}</h2>
      </div>
    );
  }

export default ShowTagline
