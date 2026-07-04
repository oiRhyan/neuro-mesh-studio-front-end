'use client'
import { AnimatedBackground } from "@/components/background/AnimatedBackground";
import "../(authenticated)/authenticated.scss";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import Cookies from "js-cookie";
import Image from 'next/image';
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { FaChevronCircleLeft } from "react-icons/fa";
import { Navbar } from "@/components/Navbar/Navbar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from 'next/navigation';
import QueryProvider from "../providers/QuerClientProvider";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
    style: 'normal',
    subsets: ['latin'],
    weight: ['200', '300', '400', '500', '600', '700'],
    variable: '--font-poppins',
});

export default function AutheticatedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const navigation = useRouter();
    const userReference = Cookies.get("user");
    const user = userReference ? JSON.parse(userReference) : "";

    return (
        <QueryProvider>
            <main
                lang="pt-br"
                className={cn(
                    "relative w-screen h-screen overflow-hidden",
                    "antialiased font-sans text-white",
                    poppins.variable
                )}
            >
                <div className="absolute inset-0 z-0">
                    <AnimatedBackground />
                </div>

                {/* Margens de vidro reduzidas para não espremer o painel */}
                <div
                    className="absolute z-10 pointer-events-none"
                    style={{
                        top: '16px',
                        right: '16px',
                        bottom: '16px',
                        left: '85px', 

                        borderRadius: '40px',

                        boxShadow: `
                        0 0 0 9999px rgba(15,20,20,0.85),
                        inset 0 0 90px rgba(0,0,0,0.3)
                    `
                    }}
                />

                <aside
                    className="absolute left-0 top-0 z-30 h-full w-[5%] min-w-[70px] flex flex-col items-center justify-center ml-2"
                >
                    <Image src={'/image/neuromesh_icon.png'} alt="neuromesh-icon" width={38} height={38} className="mb-10" />
                    <Navbar />
                    <Separator className="!w-[45px] mt-12 mb-8 right-20" />
                    <Avatar className="size-12 mb-8">
                        <AvatarImage
                            src={user?.imageProfile}
                            alt="profile-image"
                        />
                    </Avatar>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <FaChevronCircleLeft size={35} className="cursor-pointer" />
                        </AlertDialogTrigger>
                        <AlertDialogContent size="sm" className="modal">
                            <AlertDialogHeader className="text-white">
                                <AlertDialogTitle className="text-white">Gostaria de sair?</AlertDialogTitle>
                                <AlertDialogDescription className="text-white">
                                    Confirme que deseje sair da sessão, lembre-se que os modelos não salvos serão descartados.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="modal-buttons">
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction className="bg-purple-800 hover:bg-purple-900" onClick={
                                    () => navigation.replace('/')
                                }>Continuar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </aside>

                <div
                    className="relative z-20 h-full overflow-y-auto"
                    style={{
                        paddingTop: '16px',
                        paddingRight: '16px',
                        paddingBottom: '16px',
                        paddingLeft: '85px'
                    }}
                >
                    <div className={cn("p-6", "h-full", poppins.variable)}>
                        {children}
                        <Toaster />
                    </div>
                </div>
            </main>
        </QueryProvider>
    );
}