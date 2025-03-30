"use client";

import Link from "next/link"
import { Cuboid as Cube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname()
  const isLoggedIn = typeof window !== "undefined" && localStorage.getItem("user"); // Vérifie si l'utilisateur est connecté

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Cube className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold">Cubes</span>
        </Link>

        <nav className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Link href="/profile">
                <Button variant="ghost" className={pathname === "/profile" ? "text-primary" : ""}>
                  Profil
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={() => {
                  localStorage.removeItem("user"); // Déconnexion
                  window.location.href = "/"; // Redirect to homepage
                }}
              >
                Déconnexion
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="default">Connexion</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}