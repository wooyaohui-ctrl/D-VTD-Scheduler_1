import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "D-VTD Scheduler",
  description: "Myeloma Regimen (NICE TA763)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
