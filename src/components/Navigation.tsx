
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { Link, useNavigate } from "react-router-dom";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const handleWhopClick = () => {
    window.open('https://whop.com/jumpinai/', '_blank');
    setIsOpen(false);
  };

  const navItems = [
    { name: "Jumps", href: "/jumps" },
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
                src="/lovable-uploads/e5569afe-9d72-47bc-8b5c-5641bd1d4de6.png" 
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
            <Button 
              onClick={handleWhopClick}
              className="modern-button bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 dark:from-white dark:to-gray-300 dark:hover:from-gray-100 dark:hover:to-gray-400 text-white dark:text-black px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              Join our Whop
            </Button>
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
                  onClick={handleWhopClick}
                  className="w-full modern-button bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 dark:from-white dark:to-gray-300 dark:hover:from-gray-100 dark:hover:to-gray-400 text-white dark:text-black py-3 rounded-xl font-semibold"
                >
                  Join our Whop
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
