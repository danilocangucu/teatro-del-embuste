"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { slide as BurgerMenu } from "react-burger-menu";

import styles from "@/styles/Navbar.module.css";
import { logo } from "@/utils/constants";
import {
  burgerMenuStyles,
  menuScrollDisableDelay,
  renderNavLinks,
} from "@/utils/navbarUtils";

export default function Navbar() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 975);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      setTimeout(() => {
        document.body.style.overflow = "hidden";
      }, menuScrollDisableDelay);
    } else {
      document.body.style.overflow = "";
    }
  }, [isMenuOpen]);

  const pathname = usePathname() ?? "";

  if (!hasMounted) return null;

  return (
    <header role="banner" className="u-container">
      <nav
        role="navigation"
        aria-label="Main Navigation"
        className={styles.nav}
      >
        {/* Logo */}
        <div className={styles.logo}>
          <Link href="/">
            <Image
              priority
              src={logo}
              alt="Logo del Teatro del Embuste"
              className={styles.logoHeight}
              width={548}
              height={172}
            />
          </Link>
        </div>

        {/* Links */}
        {isSmallScreen ? (
          <BurgerMenu
            right
            styles={burgerMenuStyles}
            isOpen={isMenuOpen}
            onStateChange={({ isOpen }) => setIsMenuOpen(isOpen)}
          >
            {renderNavLinks("burger", pathname)}
          </BurgerMenu>
        ) : (
          renderNavLinks("desktop", pathname)
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
