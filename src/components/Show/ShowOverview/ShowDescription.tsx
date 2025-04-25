import styles from "@/styles/Show/Show.module.css";
import { formatDescriptionParagraphs } from '@/utils/showUtils';

function ShowDescription({ description }: { description: string }) {
    const formattedDescription = formatDescriptionParagraphs(description);
  
    return <div className={styles.showDescription}>{formattedDescription}</div>;
  }

export default ShowDescription
