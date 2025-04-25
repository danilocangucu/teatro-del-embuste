/* eslint-disable @next/next/no-page-custom-font */

import type { Metadata } from "next";
import "../styles/globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

export const metadata: Metadata = {
  title: "Teatro del Embuste",
  description: "Teatro en la Macarena, Bogotá, Colombia",
  metadataBase: new URL("https://teatrodelembuste.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* TODO use next/font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Serif:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
