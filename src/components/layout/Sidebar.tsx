"use client";
import { Home, CalendarDays, Link as LinkIcon, Settings,Paperclip } from "lucide-react";
import { motion } from "framer-motion";
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


    const menuItems = [
        { href: "/home", icon: Home, label: "Home" },
        { href: "/dashboard", icon: CalendarDays, label: "Dashboard" },
        { href: "/makeScript", icon: Paperclip, label: "Scripts" },
        { href: "/links", icon: LinkIcon, label: "Links" },
        { href: "/settings", icon: Settings, label: "Settings" },
    ];

    return (
        <motion.div
            className="w-20 border-r border-gray-800/50 bg-[#0B0C0F] flex flex-col items-center py-6 gap-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
            >
                <Avatar />
            </motion.div>

            <div className="flex flex-col gap-6 w-full px-4">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.05, duration: 0.3 }}
                        >
                            <div className="relative">
                                <Link href={item.href} className="w-full">
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Button
                                            variant="ghost"
                                            className={`!p-3 w-full flex items-center justify-center ${active ? 'bg-white/10 text-white' : 'text-[#888888]'}`}
                                            aria-current={active ? 'page' : undefined}
                                        >
                                            <Icon size={22} className={active ? 'text-white' : 'text-[#888888]'} />
                                        </Button>
                                    </motion.div>
                                </Link>
                                {active && (
                                    <motion.div
                                        className="absolute -right-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-l-full"
                                        initial={{ scaleY: 0 }}
                                        animate={{ scaleY: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default Sidebar;
