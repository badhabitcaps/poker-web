"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Feed" },
  { href: "/create", label: "Create" },
  { href: "/profile", label: "Profile" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-50 border-t bg-white">
      <div className="mx-auto max-w-3xl px-4">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-3 text-sm font-medium ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
} 