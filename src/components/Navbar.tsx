import { useRouter } from "next/router";
import Link from "next/link";
import { useState, useEffect } from "react";
import { slide as BurgerMenu } from "react-burger-menu";
import classNames from 'classnames';

import styles from "../styles/Navbar.module.css";
import Image from "next/image";
import logo from "../app/logo.png";
import { browserDefaultMargin } from "@/utils/constants";

const navLinks = [
  { href: "/programacion", label: "PROGRAMACIÓN" },
  { href: "/boleteria", label: "BOLETERÍA" },
  { href: "/grupo", label: "GRUPO" },
  { href: "/sala", label: "SALA" },
  { href: "/escritos", label: "ESCRITOS" },
];

export default function Navbar() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 960);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const router = useRouter();

  if (!hasMounted) return null;

  const burgerMenuStyles = {
    bmBurgerButton: {
      position: 'fixed',
      width: '30px',
      height: '24px',
      right: 'calc(2 * var(--grid-gutter))',
      top: `calc(var(--space-xl-2xl) / 2)`,
    },
    bmBurgerBars: {
      background: '#000',
    },
    bmCrossButton: {
      position: 'fixed',
      right: 'calc(2 * var(--grid-gutter))',
      top: `calc(var(--space-xl-2xl) / 2)`,
      padding: '10px',
    },
    bmCross: {
      background: '#000',
      height: '8px',
      width: '30px',
      position: 'absolute',
      top: '0px',
      left: '-15px',
    },
    bmMenuWrap: {
      top: '0px',
      height: '100vh',
      width: '100vw',
    },
    bmMenu: {
      background: '#fff',
      height: '100vh',
      overflow: 'hidden',
      paddingTop: browserDefaultMargin
    },
    bmOverlay: {
      background: 'transparent',
      display: 'none'
    },
  };

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
            <Image src={logo} alt="Logo del Teatro del Embuste" className={styles.logoHeight} />
          </Link>
        </div>

        {/* Links */}
        {isSmallScreen ? (
          <BurgerMenu right width={"100%"} styles={burgerMenuStyles}>
            <ul
              className={classNames(styles.links, "fontSecondary", "defaultBrowserMargin")}
              role="menubar"
              aria-label="Main menu"
            >
              {navLinks.map((link) => (
                <li key={link.href} role="none">
                  <Link
                    href={link.href}
                    role="menuitem"
                    className={classNames(styles.link, {
                      [styles.activeLink]:
                        router.pathname === link.href ||
                        (link.href === "/programacion" && router.pathname.startsWith("/show/")),
                    })}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </BurgerMenu>
        ) : (
          <ul className={classNames(styles.links, "fontSecondary")} role="menubar" aria-label="Main menu">
          {navLinks.map((link) => (
            <li key={link.href} role="none">
              <Link
                href={link.href}
                role="menuitem"
                className={classNames(styles.link, {
                  [styles.activeLink]:
                    router.pathname === link.href ||
                    (link.href === "/programacion" && router.pathname.startsWith("/show/")),
                })}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        )}

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
