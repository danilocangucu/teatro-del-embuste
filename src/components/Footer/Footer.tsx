import Image from "next/image";
import Link from "next/link";
import classNames from "classnames";

import styles from "../../styles/Footer.module.css";
import { logoFooter } from "@/utils/constants";
import { arrowRightUpWhite } from "@/utils/constants";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <section className="u-container">
        <div className={styles.footerGrid}>
          <div className={styles.footerLogo}>
            <Link href="/" aria-label="Inicio">
              <Image src={logoFooter} alt="Logo del Teatro del Embuste" width={226} height={301}/>
            </Link>
          </div>

          <div>
            <address className={styles.footerItem}>
              <h4 className={classNames("fontSecondaryBold", "colorQuinary")}>
                DIRECCIÓN:
              </h4>
              <p className="fontPrimary">
                Torres del Parque.
                <br />
                Torre A, Interior 5<br />
                Carrera 5 # 26b – 57
                <br />
                Bogotá, Colombia
              </p>
            </address>
          </div>

          <div className={styles.footerItem}>
            <h4 className={classNames("fontSecondaryBold", "colorQuinary")}>
              TELÉFONO:
            </h4>
            <p className={classNames("activeLink", "fontPrimary")}>
              <a href="tel:+573112326206">+57 3112326206</a>
              <small className="arrowRightUp">
                <Image
                  src={arrowRightUpWhite}
                  alt="Ir a la fuente"
                  className="arrowRightUp"
                  width={15}
                  height={15}
                />
              </small>
            </p>
          </div>

          <div className={styles.footerItem}>
            <h4 className={classNames("fontSecondaryBold", "colorQuinary")}>
              CORREO:
            </h4>
            <p className={classNames("activeLink", "fontPrimary")}>
              <a
                href="mailto:elembuste@gmail.com"
                aria-label="Enviar correo a elembuste@gmail.com"
              >
                elembuste@gmail.com
              </a>
              <small className="arrowRightUp">
                <Image
                  src={arrowRightUpWhite}
                  alt="Ir a la fuente"
                  className="arrowRightUp"
                  width={15}
                  height={15}
                />
              </small>
            </p>
          </div>
          <div className={styles.footerItem}>
            <h4 className={classNames("fontSecondaryBold", "colorQuinary")}>
              INSTAGRAM:
            </h4>
            <p className={classNames("activeLink", "fontPrimary")}>
              <a
                href="https://instagram.com/teatrodelembuste"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Teatro del Embuste"
              >
                @teatrodelembuste
              </a>
              <small className="arrowRightUp">
                <Image
                  src={arrowRightUpWhite}
                  alt="Ir a la fuente"
                  className="arrowRightUp"
                  width={15}
                  height={15}
                />
              </small>
            </p>
          </div>
        </div>
      </section>
    </footer>
  );
}
