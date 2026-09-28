import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://www.lucenabaila.es"),

  title: {
    default: "Escuela de Baile en Lucena | Artes Escénicas Paradise",
    template: "%s | Artes Escénicas Paradise",
  },

  description:
    "Escuela de baile en Lucena. Clases de Bachata, Salsa, Bailes de Salón, Ballet, K-Pop, Baile Urbano, Ladies Style y mucho más para todas las edades y niveles.",

  keywords: [
    "escuela de baile en Lucena",
    "academia de baile en Lucena",
    "clases de baile en Lucena",
    "baile en Lucena",
    "Bachata en Lucena",
    "Salsa en Lucena",
    "Ballet en Lucena",
    "K-Pop en Lucena",
    "Baile Urbano en Lucena",
    "Artes Escénicas Paradise",
  ],

  alternates: {
    canonical: "https://www.lucenabaila.es",
  },

  openGraph: {
    title: "Escuela de Baile en Lucena | Artes Escénicas Paradise",
    description:
      "Descubre nuestras clases de baile en Lucena: Bachata, Salsa, Bailes de Salón, Ballet, K-Pop, Baile Urbano, Ladies Style y mucho más.",
    url: "https://www.lucenabaila.es",
    siteName: "Artes Escénicas Paradise",
    locale: "es_ES",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
