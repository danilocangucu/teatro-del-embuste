import classNames from 'classnames';

import styles from "@/styles/Show/Show.module.css";

function ShowImportantNotice({ notice }: { notice: string | null}) {
    if (!notice) return null;
    
    return (
      <div
        className={classNames(styles.showImportantNotice, "fontPrimaryBold")}
      >
        <p>{notice}</p>
      </div>
    );
  }

export default ShowImportantNotice
