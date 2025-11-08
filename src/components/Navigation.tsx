import React, { useState, useEffect, useCallback } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import ThemeToggle from "@/components/ThemeToggle";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

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
        ? 'glass border-b border-border shadow-2xl backdrop-blur-xl' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group cursor-pointer">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-primary/20 blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300 ring-1 ring-border shadow-lg">
                <img 
                  src={logo}
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
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </button>
              ))}
              
              {/* Company dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative text-muted-foreground hover:text-foreground px-4 py-2 text-sm font-medium transition-all duration-300 group flex items-center">
                    Company <ChevronDown className="ml-1 h-3 w-3" />
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[150px] z-50">
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
                  <button className="relative group">
                    {/* Liquid glass glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                    
                    {/* Button */}
                    <div className="relative flex items-center gap-1.5 px-4 py-2 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      {/* Content */}
                      <span className="relative font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-300 whitespace-nowrap">
                        My Account
                      </span>
                      <ChevronDown className="relative h-3.5 w-3.5 text-primary" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[200px] z-50">
                  <DropdownMenuItem onSelect={() => navigate('/dashboard')}>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => logout()}>Log Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button 
                onClick={handleCtaClick}
                className="relative group"
              >
                {/* Liquid glass glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                
                {/* Button */}
                <div className="relative flex items-center justify-center px-5 py-2 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Content */}
                  <span className="relative font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-300 whitespace-nowrap">
                    Log In
                  </span>
                </div>
              </button>
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
            <div className="px-2 pt-2 pb-3 space-y-1 glass rounded-3xl mt-2 border border-border backdrop-blur-xl shadow-2xl">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className="text-muted-foreground hover:text-foreground block w-full text-left px-4 py-3 rounded-2xl text-base font-medium hover:bg-accent transition-all duration-300"
                >
                  {item.name}
                </button>
              ))}
              
              {/* Company collapsible menu */}
              <Collapsible>
                <CollapsibleTrigger className="text-muted-foreground hover:text-foreground flex items-center justify-between w-full text-left px-4 py-3 rounded-2xl text-base font-medium hover:bg-accent transition-all duration-300">
                  Company <ChevronDown className="ml-1 h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4">
                  {companyItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item.href)}
                      className="text-muted-foreground hover:text-foreground block w-full text-left px-4 py-2 rounded-2xl text-sm font-medium hover:bg-accent transition-all duration-300"
                    >
                      {item.name}
                    </button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
              <div className="pt-2 border-t border-border mt-2">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setIsOpen(false);
                      }}
                      className="text-muted-foreground hover:text-foreground block w-full text-left px-4 py-3 rounded-2xl text-base font-medium hover:bg-accent transition-all duration-300"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="text-muted-foreground hover:text-foreground block w-full text-left px-4 py-3 rounded-2xl text-base font-medium hover:bg-accent transition-all duration-300"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleCtaClick}
                    className="relative group w-full overflow-hidden"
                  >
                    {/* Liquid glass glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2rem] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                    
                    {/* Button */}
                    <div className="relative flex items-center justify-center py-3 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl rounded-[2rem] border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      {/* Content */}
                      <span className="relative font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                        Log In
                      </span>
                    </div>
                  </button>
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
