
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/ThemeToggle";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setIsAuthed(!!session?.user);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setIsAuthed(!!data.session?.user);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleNavClick = (href: string) => {
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
  };

  const handleCtaClick = () => {
    if (isAuthed) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
    setIsOpen(false);
  };

  const navItems = [
    { name: "Jumps in AI", href: "/jumps" },
    { name: "Resources", href: "/resources" },
    { name: "About Us", href: "/about-us" },
    { name: "Contact Us", href: "/contact-us" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'glass border-b border-border shadow-modern' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group cursor-pointer">
            <div className="w-10 h-10 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <img 
                src="/lovable-uploads/74bafbff-f098-4d0a-9180-b4923d3d9616.png" 
                alt="JumpinAI Logo" 
                className="w-full h-full object-cover"
              />
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
                  className="relative text-muted-foreground hover:text-foreground px-4 py-2 text-sm font-medium transition-all duration-300 group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Toggle & CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {isAuthed ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className="modern-button bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 dark:from-white dark:to-gray-300 dark:hover:from-gray-100 dark:hover:to-gray-400 text-white dark:text-black px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                  >
                    My Account <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[200px] z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border border-border shadow-lg rounded-xl">
                  <DropdownMenuItem onSelect={() => navigate('/dashboard')}>Dashboard</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={handleCtaClick}
                className="modern-button bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 dark:from-white dark:to-gray-300 dark:hover:from-gray-100 dark:hover:to-gray-400 text-white dark:text-black px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
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
            <div className="px-2 pt-2 pb-3 space-y-1 glass rounded-2xl mt-2 border border-border">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className="text-muted-foreground hover:text-foreground block w-full text-left px-4 py-3 rounded-xl text-base font-medium hover:bg-accent transition-all duration-300"
                >
                  {item.name}
                </button>
              ))}
              <div className="pt-2">
                <Button 
                  onClick={handleCtaClick}
                  className="w-full modern-button bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 dark:from-white dark:to-gray-300 dark:hover:from-gray-100 dark:hover:to-gray-400 text-white dark:text-black py-3 rounded-xl font-semibold"
                >
                  {isAuthed ? 'My Account' : 'Log In'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
