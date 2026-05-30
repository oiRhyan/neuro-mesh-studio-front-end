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
    <main
      lang="pt-br"
      className={cn("h-full", "antialiased", "font-sans", poppins.variable)}
    >
      {children}
    </main>
  );
}