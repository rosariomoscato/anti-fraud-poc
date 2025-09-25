import Link from "next/link";
import { UserProfile } from "@/components/auth/user-profile";
import { ModeToggle } from "./ui/mode-toggle";
import { Shield, BarChart3, Search, Database } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
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
            
            <nav className="hidden md:flex items-center space-x-6 ml-10">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">Dashboard</span>
              </Link>
              <Link
                href="/analytics"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">Analytics</span>
              </Link>
              <Link
                href="/synthetic-data"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Database className="h-4 w-4" />
                <span className="text-sm font-medium">Dati Sintetici</span>
              </Link>
              <Link
                href="/investigations"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Search className="h-4 w-4" />
                <span className="text-sm font-medium">Indagini</span>
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <UserProfile />
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
