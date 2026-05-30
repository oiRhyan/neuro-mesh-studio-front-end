'use client'
import { BiSolidHomeAlt2 } from "react-icons/bi";
import { BiHomeAlt2 } from "react-icons/bi";
import { TbHexagon3D } from "react-icons/tb";
import { SiOpen3D } from "react-icons/si";
import { IoBook } from "react-icons/io5";
import { IoBookOutline } from "react-icons/io5";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { JSX } from "react/jsx-runtime";

const routes = [
    {
        icon: BiHomeAlt2,
        iconSelected: BiSolidHomeAlt2,
        route: '/home'
    },
    {
        icon: TbHexagon3D,
        iconSelected: SiOpen3D,
        route: '/studio'
    },
    {
        icon: IoBookOutline,
        iconSelected: IoBook,
        route: '/about'
    }
]

export function Navbar(): JSX.Element {

    const path = usePathname();

    return (
        <div className="flex flex-col gap-10">
            {
                routes.map(route => {
                    const isActive = path === route.route;
                    const Icon = isActive ? route.iconSelected : route.icon;

                    return <Link
                        key={route.route}
                        href={route.route}
                        className="text-white"
                    >
                        <Icon size={45} />
                    </Link>
                })
            }
        </div>
    )
}