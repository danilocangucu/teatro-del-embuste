import { ShowDTO } from "@/types/Show";
import styles from '../styles/Show.module.css';

interface ShowProps {
  showData: ShowDTO;
}

const Show = ({ showData }: ShowProps) => {
  return (
    <main className={styles.show}>
      <section className="show-header show">
        <h1 className="show-title">{showData.title}</h1>
        <p className="show-tagline">{showData.tagline}</p>
        <p className="show-description">{showData.description}</p>
      </section>
    </main>
  );
};

export default Show;
