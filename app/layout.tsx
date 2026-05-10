import type { Metadata } from "next";
import { Poppins, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const poppins = Poppins({
  style: 'normal',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});;

export const metadata: Metadata = {
  title: "Neuro Mesh Studio",
  description: "by @RhyanAraujo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      className={cn("h-full", "antialiased", "font-sans", poppins.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
