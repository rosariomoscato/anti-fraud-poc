"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { UserProfile } from "@/components/auth/user-profile";
import { ModeToggle } from "./ui/mode-toggle";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Shield, BarChart3, Search, Database, Menu, Info, Settings } from "lucide-react";

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/auth/is-admin');
          const data = await response.json();
          setIsAdminUser(data.isAdmin);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdminUser(false);
        }
      } else {
        setIsAdminUser(false);
      }
    };

    checkAdminStatus();
  }, [session]);

  const navigationItems = [
    {
      href: "/",
      icon: Shield,
      label: "Dashboard",
    },
    {
      href: "/analytics",
      icon: BarChart3,
      label: "Analytics",
    },
    {
      href: "/synthetic-data",
      icon: Database,
      label: "Dati Sintetici",
    },
    {
      href: "/investigations",
      icon: Search,
      label: "Indagini",
    },
    {
      href: "/info",
      icon: Info,
      label: "Info",
    },
    ...(isAdminUser ? [{
      href: "/admin",
      icon: Settings,
      label: "Admin",
    }] : []),
  ];
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo a sinistra */}
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-600">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Anti-Fraud System</h1>
              <p className="text-xs text-gray-600">Sistema di Rilevamento Frodi</p>
            </div>
          </Link>

          {/* Desktop Navigation Centrata */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button e Profilo a destra */}
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {navigationItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link 
                        href={item.href}
                        className="flex items-center space-x-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <UserProfile />
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
