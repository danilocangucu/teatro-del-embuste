import classNames from "classnames";
import { browserDefaultMargin } from "./constants";
import styles from "../../src/styles/Navbar.module.css";
import Link from "next/link";

export const burgerMenuStyles = {
  bmBurgerButton: {
    position: "absolute",
    width: "30px",
    height: "24px",
    right: "calc(1.3 * var(--grid-gutter))",
    top: `calc(var(--space-xl-2xl) / 2)`,
  },
  bmBurgerBars: {
    background: "var(--color-secondary)",
  },
  bmCrossButton: {
    position: "fixed",
    right: "calc(1.6 * var(--grid-gutter))",
    top: `calc(var(--space-xl-2xl) / 2)`,
    padding: "10px",
  },
  bmCross: {
    background: "var(--color-secondary)",
    height: "5px",
    width: "30px",
    position: "absolute",
    top: "0px",
    left: "-15px",
  },
  bmMenuWrap: {
    top: "0px",
    height: "100vh",
    width: "100%",
  },
  bmMenu: {
    background: "var(--color-tertiary)",
    height: "100%",
    overflow: "hidden",
    paddingTop: browserDefaultMargin,
  },
  bmOverlay: {
    display: "none",
  },
};

export const menuScrollDisableDelay = 350;

type NavLink = {
  href: string;
  label: string;
};

export const navLinks: NavLink[] = [
  { href: "/programacion", label: "PROGRAMACIÓN" },
  { href: "/boleteria", label: "BOLETERÍA" },
  { href: "/grupo", label: "GRUPO" },
  { href: "/sala", label: "SALA" },
  { href: "/escritos", label: "ESCRITOS" },
];

export const isActiveLink = (pathname: string, href: string) => {
  if (href === "/programacion")
    return (
      pathname.startsWith("/programacion") || pathname.startsWith("/obra/")
    );
  return (pathname === href || pathname.startsWith(href));
};

export const renderNavLinks = (
  linkStyle: "burger" | "desktop",
  pathname: string,
) => {
  const isSmallScreen = linkStyle === "burger";

  return (
  <ul
  className={classNames(
    styles.links,
    "fontSecondaryMedium",
    linkStyle === "desktop" && styles.textAlignRight,
    linkStyle === "burger" && [
      styles.linksBurgerMenu,
      "defaultBrowserMargin"
    ]
  )}
    role="menubar"
    aria-label="Main menu"
  >
    {navLinks.map((link) => {
      const active = isActiveLink(pathname, link.href);
      return (
        <li key={link.href} role="none">
          <Link
            href={link.href}
            role="menuitem"
            aria-current={active ? "page" : undefined}
            className={classNames(
              styles.link,
              linkStyle === "burger"
                ? styles.linkBurgerMenu
                : (styles.linkDesktop),
              {
                colorTertiary: !isSmallScreen && active,
                colorQuinary: isSmallScreen && active,
                [styles.activeLink]: active,
              }
            )}
          >
            {link.label}
          </Link>
        </li>
      );
    })}
  </ul>
)};
