import classNames from 'classnames';

import { ShowDTO } from '@/types/Show';

import styles from "@/styles/Show/Show.module.css";

import ShowDescription from './ShowDescription';
import ShowTagline from './ShowTagline';
import ShowImportantNotice from './ShowImportantNotice';

function ShowOverview({ showData }: { showData: ShowDTO }) {
    return (
      <section
        className={classNames(styles.sectionSeparator, styles.showSection)}
      >
        <ShowTagline tagline={showData.tagline} />
        <ShowDescription description={showData.description} />
        <ShowImportantNotice notice={showData.technicalDetails.importantNotice} />
      </section>
    );
  }

export default ShowOverview
