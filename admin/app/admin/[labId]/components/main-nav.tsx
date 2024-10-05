"use client";

import Link from "next/link"
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils"

export function MainNav({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname();
    const params = useParams();

    const routes = [
        {
            href: `/admin/${params.labId}`,
            label: 'Overview',
            active: pathname === `/admin/${params.labId}`,
        },
        {
            href: `/admin/${params.labId}/devices`,
            label: 'Devices',
            active: pathname === `/admin/${params.labId}/devices`,
        },
        {
            href: `/admin/${params.labId}/staff`,
            label: 'Staffs',
            active: pathname === `/admin/${params.labId}/staff`,
        },
        {
            href: `/admin/${params.labId}/settings`,
            label: 'Settings',
            active: pathname === `/admin/${params.labId}/settings`,
        },
    ]

    return (
        <div className="mr-4 hidden md:flex">
            <nav
                className={cn("flex items-center space-x-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800", className)}
                {...props}
            >
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out',
                            route.active
                                ? 'bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-white'
                                : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                        )}
                    >
                        {route.label}
                    </Link>
                ))}
            </nav>
        </div>
    )
};
