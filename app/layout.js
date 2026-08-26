import "./globals.css";

export const metadata = {
  title: "Lucena Baila | Escuela de baile",
  description: "Escuela de baile en Lucena. Descubre nuestras clases, horarios y actividades.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
