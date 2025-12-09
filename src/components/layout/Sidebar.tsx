"use client";
import { Home, CalendarDays, Link as LinkIcon, Settings } from "lucide-react";
import Button from "../ui/Btn";
import Avatar from "../ui/Avatar";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const Sidebar = () => {
    const pathname = usePathname() || '/';

    const isActive = (path: string) => {
        if (!pathname) return false;
        // exact match or startsWith for nested routes
        return pathname === path || pathname.startsWith(path + '/');
    }


    return (
        <div className="w-20 border-r border-gray-800/50 bg-[#0B0C0F] flex flex-col items-center py-6 gap-8">
            <Avatar />

            <div className="flex flex-col gap-6 w-full px-4">
                <Link href="/dashboard" className="w-full">
                    <Button variant="ghost" className={`!p-3 w-full flex items-center justify-center ${isActive('/dashboard') ? 'bg-white/10 text-white' : 'text-[#888888]'}`} aria-current={isActive('/dashboard') ? 'page' : undefined}>
                        <Home size={22} className={isActive('/dashboard') ? 'text-white' : 'text-[#888888]'} />
                    </Button>
                </Link>

                <div className="relative">
                    <Link href="/calendar" className="w-full">
                        <Button variant="ghost" className={`!p-3 w-full flex items-center justify-center ${isActive('/calendar') ? 'bg-white/10 text-white' : 'text-[#888888]'}`} aria-current={isActive('/calendar') ? 'page' : undefined}>
                            <CalendarDays size={22} className={isActive('/calendar') ? 'text-white' : 'text-[#888888]'} />
                        </Button>
                    </Link>
                    {isActive('/calendar') && (
                        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-l-full"></div>
                    )}
                </div>

                <Link href="/links" className="w-full">
                    <Button variant="ghost" className={`!p-3 w-full flex items-center justify-center ${isActive('/links') ? 'bg-white/10 text-white' : 'text-[#888888]'}`} aria-current={isActive('/links') ? 'page' : undefined}>
                        <LinkIcon size={22} className={isActive('/links') ? 'text-white' : 'text-[#888888]'} />
                    </Button>
                </Link>

                <Link href="/settings" className="w-full">
                    <Button variant="ghost" className={`!p-3 w-full flex items-center justify-center ${isActive('/settings') ? 'bg-white/10 text-white' : 'text-[#888888]'}`} aria-current={isActive('/settings') ? 'page' : undefined}>
                        <Settings size={22} className={isActive('/settings') ? 'text-white' : 'text-[#888888]'} />
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
