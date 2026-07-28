'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MiniCart from './MiniCart';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { useCMS } from '@/context/CMSContext';
import AnnouncementBar from './AnnouncementBar';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  const { cartCount, isCartOpen, setIsCartOpen } = useCart();
  const { getSetting } = useCMS();

  const siteName = getSetting('site_name') || 'TOUCHEEGLOW';
  const headerLogo = getSetting('site_logo') || '/touchee-logo.png';

  useEffect(() => {
    // Wishlist logic
    const updateWishlistCount = () => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(wishlist.length);
    };

    updateWishlistCount();
    window.addEventListener('wishlistUpdated', updateWishlistCount);

    // Auth logic
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener('wishlistUpdated', updateWishlistCount);
      subscription.unsubscribe();
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <AnnouncementBar />

      <header className="bg-white sticky top-0 z-50 border-b border-gray-100 transition-all duration-300">
        <div className="safe-area-top" />
        <nav aria-label="Main navigation" className="relative">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-20 flex items-center justify-between gap-4">

              {/* Left: Mobile Menu Trigger (Mobile) & Logo */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <button
                  className="lg:hidden p-2 -ml-2 text-gray-900 hover:text-gray-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <i className="ri-menu-line text-2xl"></i>
                </button>
                <Link
                  href="/"
                  className="flex items-center select-none"
                  aria-label="Go to homepage"
                >
                  <img src={headerLogo} alt={siteName} className="h-10 md:h-12 w-auto object-contain" />
                </Link>
              </div>

              {/* Center: Navigation Links (Desktop) */}
              <div className="hidden lg:flex items-center space-x-8">
                {[
                  { label: 'Shop', href: '/shop' },
                  { label: 'Categories', href: '/categories' },
                  { label: 'Payments', href: '/faqs#payments' },
                  { label: 'About', href: '/about' },
                  { label: 'Contact', href: '/contact' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-[15px] font-semibold text-gray-700 hover:text-blue-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Right: Search & Icons */}
              <div className="flex items-center gap-4 sm:gap-6 flex-1 lg:flex-none justify-end">
                {/* Desktop Inline Search Box */}
                <form onSubmit={handleSearch} className="hidden md:block relative w-64 lg:w-72">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 transition-all placeholder:text-gray-400"
                  />
                  <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base"></i>
                </form>

                {/* Mobile Search Icon Trigger */}
                <button
                  className="md:hidden p-2 text-gray-900 hover:text-gray-600 transition-transform hover:scale-105"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Search"
                >
                  <i className="ri-search-line text-xl"></i>
                </button>

                {/* Wishlist Icon */}
                <Link
                  href="/wishlist"
                  className="p-2 text-gray-900 hover:text-blue-700 transition-colors relative"
                  aria-label="Wishlist"
                >
                  <i className="ri-heart-line text-xl"></i>
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-700 text-[10px] font-bold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart Icon */}
                <div className="relative">
                  <button
                    className="p-2 text-gray-900 hover:text-blue-700 transition-colors relative"
                    onClick={() => setIsCartOpen(!isCartOpen)}
                    aria-label="Cart"
                  >
                    <i className="ri-shopping-cart-line text-xl"></i>
                    {cartCount > 0 && (
                      <span className="absolute top-1 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-700 text-[10px] font-bold text-white">
                        {cartCount}
                      </span>
                    )}
                  </button>
                  <MiniCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
                </div>

                {/* User/Account Icon */}
                {user ? (
                  <Link
                    href="/account"
                    className="p-2 text-gray-900 hover:text-blue-700 transition-colors"
                    aria-label="Account"
                  >
                    <i className="ri-user-line text-xl"></i>
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    className="p-2 text-gray-900 hover:text-blue-700 transition-colors"
                    aria-label="Login"
                  >
                    <i className="ri-user-line text-xl"></i>
                  </Link>
                )}
              </div>

            </div>
          </div>
        </nav>
      </header>

      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-24">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Search Products</h3>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-blue-700 hover:text-blue-900"
                  >
                    <i className="ri-search-line text-xl"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )
      }

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-0 left-0 bottom-0 w-4/5 max-w-xs bg-white shadow-xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <img src={headerLogo} alt={siteName} className="h-14 w-auto object-contain" />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 -mr-2 text-gray-500 hover:text-gray-900"
                aria-label="Close menu"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {[
                { label: 'Home', href: '/' },
                { label: 'Shop', href: '/shop' },
                { label: 'Categories', href: '/categories' },
                { label: 'About', href: '/about' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-gray-100 my-2"></div>
              {[
                { label: 'Track Order', href: '/order-tracking' },
                { label: 'Wishlist', href: '/wishlist' },
                { label: 'My Account', href: '/account' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                &copy; {new Date().getFullYear()} {siteName}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}