'use client'
import { AnimatedBackground } from "@/components/background/AnimatedBackground";
import "../(authenticated)/authenticated.scss";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
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
    return (
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

            <div
                className="absolute z-10 pointer-events-none"
                style={{
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '120px',

                    borderRadius: '60px',

                    boxShadow: `
                        0 0 0 9999px rgba(15,20,20,0.85),
                        inset 0 0 90px rgba(0,0,0,0.3)
                    `
                }}
            />

            <aside
                className="absolute left-0 top-0 z-30 h-full w-[5%] flex flex-col items-center justify-center ml-2"
            >
                <Image src={'/image/neuromesh_icon.png'} alt="neuromesh-icon" width={50} height={50} className="mb-20" />
                <Navbar />
                <Separator className="!w-[70px] mt-25 mb-15 right-20" />
                <Avatar className="size-18 mb-13">
                    <AvatarImage
                        src="/image/select-perfil.png"
                        alt="profile-image"
                        className="grayscale"
                    />
                </Avatar>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <FaChevronCircleLeft size={50} />
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
                    paddingTop: '20px',
                    paddingRight: '20px',
                    paddingBottom: '20px',
                    paddingLeft: '120px'
                }}
            >
                <div className={cn("p-10", "h-full", poppins.variable)}>
                    {children}
                </div>
            </div>
        </main>
    );
}