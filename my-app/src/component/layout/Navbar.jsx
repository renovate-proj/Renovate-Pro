"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Ruler, Menu, X, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Link from 'next/link';


export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'Surveyor': return '/surveyor';
      case 'Planner': return '/planner';
      case 'Customer': return '/customer';
      default: return '/';
    }
  };

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center cursor-pointer" onClick={() => router.push("/")}>
            <Ruler className="w-8 h-8 text-[var(--color-primary)]" />
            <span className="ml-2 text-xl font-serif font-bold text-gray-900">
              Renovate<span className="text-[var(--color-secondary)]">Pro</span>
            </span>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-gray-700 hover:text-[var(--color-primary)] transition">Features</Link>
            <Link href="/#how-it-works" className="text-gray-700 hover:text-[var(--color-primary)] transition">How It Works</Link>

            {!user ? (
              <>
                <button onClick={() => router.push("/login")} className="text-gray-700 hover:text-[var(--color-primary)] font-medium">
                  Login
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition shadow-md"
                >
                  Book a Survey
                </button>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-[var(--color-primary)] focus:outline-none"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-[var(--color-primary)]">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{user.fullName}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        router.push(getDashboardLink());
                        setProfileOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Dashboard
                    </button>

                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3 flex flex-col">
            <Link href="/#features" onClick={() => setMobileMenuOpen(false)}>Features</Link>
            <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
            <Link href="/#contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            <button onClick={() => router.push("/login")}>
              Login
            </button>
            <button
              onClick={() => router.push(user ? "/bookingsurvey" : "/login")}
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              Book a Survey
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
