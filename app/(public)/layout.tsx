'use client'
import "../globals.css";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import QueryProvider from "../providers/QuerClientProvider";
import { Toaster } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";

type JwtPayload = {
    exp: number;
}

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
  const navigation = useRouter();
  const userReference = Cookies.get("user");

  useEffect(() => {
    const userToken = Cookies.get("access-token");
    if (!userToken) {
      navigation.replace("/");
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(userToken);

      if (decoded.exp < Date.now() / 1000) {
        Cookies.remove("access-token");
        Cookies.remove("user");
        navigation.replace("/login");
      } else {
        navigation.replace("/home");
      }
    } catch (error) {
      console.warn(error);
      Cookies.remove("access-token");
      Cookies.remove("user");
      navigation.replace("/login");
    }
  }, [navigation]);

  return (
    <main
      lang="pt-br"
      className={cn("h-full", "antialiased", "font-sans", poppins.variable)}
    >
      <QueryProvider>
        {children}
        <Toaster />
      </QueryProvider>
    </main>
  );
}