import "../globals.css";
import { cn } from "@/lib/utils";
import { Poppins} from "next/font/google";

const poppins = Poppins({
  style: 'normal',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});;

export default function PublicLayout({
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