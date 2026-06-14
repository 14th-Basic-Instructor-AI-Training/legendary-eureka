import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const lato = localFont({
  src: [
    { path: "../assets/font/Lato-Thin.ttf",        weight: "100", style: "normal" },
    { path: "../assets/font/Lato-ThinItalic.ttf",   weight: "100", style: "italic" },
    { path: "../assets/font/Lato-Light.ttf",        weight: "300", style: "normal" },
    { path: "../assets/font/Lato-LightItalic.ttf",  weight: "300", style: "italic" },
    { path: "../assets/font/Lato-Regular.ttf",      weight: "400", style: "normal" },
    { path: "../assets/font/Lato-Italic.ttf",       weight: "400", style: "italic" },
    { path: "../assets/font/Lato-Bold.ttf",         weight: "700", style: "normal" },
    { path: "../assets/font/Lato-BoldItalic.ttf",   weight: "700", style: "italic" },
    { path: "../assets/font/Lato-Black.ttf",        weight: "900", style: "normal" },
    { path: "../assets/font/Lato-BlackItalic.ttf",  weight: "900", style: "italic" },
  ],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Destination",
  description: "Travel platform connecting travelers with tour agencies across Cambodia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lato.variable} ${lato.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
