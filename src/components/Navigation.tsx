import React, { useState, useEffect, useCallback } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/ThemeToggle";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Navigation = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, logout, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Preload page when user hovers over navigation link
  const handleMouseEnter = useCallback((href: string) => {
    if (href.startsWith('/')) {
      // Preload the page component
      import(`../pages${href === '/jumps' ? '/Jumps' : href === '/resources' ? '/Resources' : href === '/pricing' ? '/Pricing' : ''}.tsx`).catch(() => {
        // Silently fail if import doesn't work
      });
    }
  }, []);

  const handleNavClick = useCallback((href: string) => {
    if (href.startsWith('/')) {
      // External page navigation
      navigate(href);
    } else if (window.location.pathname !== '/') {
      // Section navigation from non-home pages
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Section navigation on home page
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsOpen(false);
  }, [navigate]);

  const handleCtaClick = useCallback(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      login();
    }
    setIsOpen(false);
  }, [isAuthenticated, navigate, login]);

  const navItems = [
    { name: "JumpinAI Studio", href: "/jumpinai-studio" },
    { name: "Pricing", href: "/pricing" },
    { name: "Guides", href: "/jumps" },
    { name: "Resources", href: "/resources" },
  ];

  const companyItems = [
    { name: "About Us", href: "/about-us" },
    { name: "Contact Us", href: "/contact-us" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'glass-dark border-b border-white/10 dark:border-white/20 shadow-2xl backdrop-blur-xl bg-white/5 dark:bg-white/10' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group cursor-pointer">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-white/25 dark:bg-white/35 blur-md opacity-0 dark:opacity-60 transition-opacity duration-300"></div>
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300 ring-1 ring-white/10 dark:ring-white/20 shadow-lg">
                <img 
                  src="/lovable-uploads/156b282b-1e93-436c-914a-a886a6a5cdfd.png" 
                  alt="JumpinAI Logo" 
                  width="40"
                  height="40"
                  loading="eager"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <span className="ml-3 text-2xl font-black font-display gradient-text-primary">
              JumpinAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  onMouseEnter={() => handleMouseEnter(item.href)}
                  className="relative text-muted-foreground hover:text-foreground px-4 py-2 text-sm font-medium transition-all duration-300 group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </button>
              ))}
              
              {/* Company dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative text-muted-foreground hover:text-foreground px-4 py-2 text-sm font-medium transition-all duration-300 group flex items-center">
                    Company <ChevronDown className="ml-1 h-3 w-3" />
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[150px] z-50 glass-dark backdrop-blur-xl bg-white/10 dark:bg-white/15 border border-white/20 dark:border-white/30 shadow-2xl rounded-2xl">
                  {companyItems.map((item) => (
                    <DropdownMenuItem key={item.name} onSelect={() => handleNavClick(item.href)}>
                      {item.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Theme Toggle & CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className="modern-button bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 dark:from-white dark:to-gray-300 dark:hover:from-gray-100 dark:hover:to-gray-400 text-white dark:text-black px-6 py-2.5 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    My Account <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[200px] z-50 glass-dark backdrop-blur-xl bg-white/10 dark:bg-white/15 border border-white/20 dark:border-white/30 shadow-2xl rounded-2xl">
                  <DropdownMenuItem onSelect={() => navigate('/dashboard')}>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => logout()}>Log Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={handleCtaClick}
                className="modern-button bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 dark:from-white dark:to-gray-300 dark:hover:from-gray-100 dark:hover:to-gray-400 text-white dark:text-black px-6 py-2.5 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Log In
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted-foreground hover:text-foreground p-2 rounded-lg transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden animate-fade-in-down">
            <div className="px-2 pt-2 pb-3 space-y-1 glass-dark rounded-3xl mt-2 border border-white/20 dark:border-white/30 backdrop-blur-xl bg-white/10 dark:bg-white/15 shadow-2xl">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className="text-muted-foreground hover:text-foreground block w-full text-left px-4 py-3 rounded-2xl text-base font-medium hover:bg-white/10 dark:hover:bg-white/20 transition-all duration-300"
                >
                  {item.name}
                </button>
              ))}
              {companyItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className="text-muted-foreground hover:text-foreground block w-full text-left px-4 py-3 rounded-2xl text-base font-medium hover:bg-white/10 dark:hover:bg-white/20 transition-all duration-300"
                >
                  {item.name}
                </button>
              ))}
              <div className="pt-2 border-t border-white/20 dark:border-white/30 mt-2">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setIsOpen(false);
                      }}
                      className="text-muted-foreground hover:text-foreground block w-full text-left px-4 py-3 rounded-2xl text-base font-medium hover:bg-white/10 dark:hover:bg-white/20 transition-all duration-300"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="text-muted-foreground hover:text-foreground block w-full text-left px-4 py-3 rounded-2xl text-base font-medium hover:bg-white/10 dark:hover:bg-white/20 transition-all duration-300"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <Button 
                    onClick={handleCtaClick}
                    className="w-full modern-button bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 dark:from-white dark:to-gray-300 dark:hover:from-gray-100 dark:hover:to-gray-400 text-white dark:text-black py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl"
                  >
                    Log In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;
