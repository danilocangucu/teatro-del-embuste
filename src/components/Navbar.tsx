import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../styles/Navbar.module.css";
import Image from "next/image";
import logo from "../app/logo.png";

const navLinks = [
  { href: "/programacion", label: "PROGRAMACIÓN" },
  { href: "/boleteria", label: "BOLETERÍA" },
  { href: "/grupo", label: "GRUPO" },
  { href: "/sala", label: "SALA" },
  { href: "/escritos", label: "ESCRITOS" },
];

export default function Navbar() {
  const router = useRouter();

  return (
    <header role="banner">
      <nav
        role="navigation"
        aria-label="Main Navigation"
        className={styles.nav}
      >
        {/* Logo */}
        <div className={styles.logo}>
          <Link href="/">
            <Image src={logo} alt="Logo del Teatro del Embuste" height={70} />
          </Link>
        </div>

        {/* Links */}
        <ul className={styles.links} role="menubar" aria-label="Main menu">
          {navLinks.map((link) => (
            <li key={link.href} role="none">
              <Link
                href={link.href}
                role="menuitem"
                className={`${styles.link} ${
                  router.pathname === link.href ||
                  (link.href === "/programacion" &&
                    router.pathname.startsWith("/show/"))
                    ? styles.activeLink
                    : ""
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* User icon */}
        {/* <div
          className={styles.userIcon}
          role="button"
          aria-label="Iniciar sesión"
          tabIndex={0}
        >
          👤
        </div> */}
      </nav>
    </header>
  );
}
