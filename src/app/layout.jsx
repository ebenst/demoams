import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Huta Asset Management - Enterprise",
  description: "Sistem Pemantauan, Audit, & Optimalisasi Aset Real-time",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}