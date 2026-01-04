"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

const navItems = [
  {
    name: "Destiny",
    href: "/",
    icon: (active: boolean) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        className={cn(active && "holographic")}
      >
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </svg>
    ),
  },
  // Stone - 暂时隐藏
  // {
  //   name: "Stone",
  //   href: "/stone",
  //   icon: (active: boolean) => (
  //     <svg
  //       width="24"
  //       height="24"
  //       viewBox="0 0 24 24"
  //       fill="none"
  //       stroke="currentColor"
  //       strokeWidth="0.5"
  //       className={cn(active && "holographic")}
  //     >
  //       <circle cx="12" cy="12" r="8" />
  //       <circle cx="12" cy="12" r="3" fill={active ? "url(#holographic)" : "none"} />
  //     </svg>
  //   ),
  // },
  {
    name: "Echo",
    href: "/echo",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" fill={active ? "url(#holographic)" : "none"} />
        <circle cx="18" cy="16" r="3" fill={active ? "url(#holographic)" : "none"} />
      </svg>
    ),
  },
  {
    name: "Oracle",
    href: "/oracle",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  // Connect - 暂时隐藏
  // {
  //   name: "Connect",
  //   href: "/connect",
  //   icon: (active: boolean) => (
  //     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
  //       <path d="M2 12 L6 8 L10 14 L14 6 L18 10 L22 6" />
  //       <path d="M2 18 L6 14 L10 20 L14 12 L18 16 L22 12" />
  //     </svg>
  //   ),
  // },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t hairline border-foreground z-50">
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="holographic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0C3FC" />
            <stop offset="25%" stopColor="#8EC5FC" />
            <stop offset="50%" stopColor="#E0C3FC" />
            <stop offset="75%" stopColor="#D4FC79" />
            <stop offset="100%" stopColor="#96E6A1" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex items-center justify-around h-16 px-2 max-w-screen-sm mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[60px] transition-opacity",
                isActive ? "opacity-100" : "opacity-40 hover:opacity-70",
              )}
            >
              <div className={cn(isActive && "scale-110 transition-transform")}>{item.icon(isActive)}</div>
              <span className="text-[10px] tracking-wider ">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
