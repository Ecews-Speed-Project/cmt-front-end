'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { FaBars, FaTimes } from 'react-icons/fa';
import { signOut, useSession } from 'next-auth/react';

const menuItems = [
  { path: '/cma/dashboard', label: 'Dashboard', roles: ['Super Admin', 'State', 'case_manager'], icon: 'fa-solid fa-dashboard' },
  { path: '/cma/case-management-teams', label: 'CMTs', roles: ['Super Admin', 'State'], icon: 'fa-solid fa-users' },
  { path: '/cma/case-managers', label: 'Case Managers', roles: ['Super Admin', 'State'], icon: 'fa-solid fa-user' },
  { path: '/cma/performance', label: 'Performance', roles: ['Super Admin', 'State', 'case_manager'], icon: 'fa-solid fa-chart-line' },
  { path: '/cma/reports', label: 'Reports', roles: ['Super Admin', 'State'], icon: 'fa-solid fa-file-lines' },
];

export default function Navbar() {
  const { data: session} = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    signOut()
  };

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="lg:w-[13%] w-[30%]">
            <Link href='/cma/dashboard'>
              <Image 
                src="/images/ecews-logo2.png" 
                alt="logo" 
                width={2046} 
                height={661} 
                className=''
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex w-[74%] items-center justify-center">
            {menuItems.map((item) => {
              if (!user.roles || !user.roles.some(role => item.roles.includes(role))) return null;


              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-sm font-semibold block px-4 py-2 rounded transition-colors ${
                    pathname === item.path
                      ? 'bg-[#096D49] text-white'
                      : 'text-gray-200 hover:bg-gray-700'
                  }`}
                >
                  <i className={item.icon}></i> {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Info and Mobile Menu Button */}
          <div className="w-[13%] flex items-center float-right">
            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                {isMobileMenuOpen ? (
                  <FaTimes className="block h-6 w-6" />
                ) : (
                  <FaBars className="block h-6 w-6" />
                )}
              </button>
            </div>

            {/* Desktop User Info */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <p className="text-gray-400">{user?.name}</p>
                  {/* <p className="text-gray-500 text-xs">{user.email}</p> */}
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-5 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {menuItems.map((item) => {
              if (!user.roles || !user.roles.some(role => item.roles.includes(role))) return null;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`block px-4 py-2 text-sm font-semibold ${
                    pathname === item.path
                      ? 'bg-[#096D49] text-white'
                      : 'text-gray-200 hover:bg-gray-700'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className={item.icon}></i> {item.label}
                </Link>
              );
            })}
            <div className="px-4 py-2 border-t border-gray-700">
              <div className="text-sm">
                <p className="text-gray-200">{user.name}</p>
                <p className="text-gray-400 text-xs">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
            >
              <i className="fa-solid fa-right-from-bracket"></i> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
} 