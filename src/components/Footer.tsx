
import { ArrowRight } from "lucide-react";
import { 
  FaInstagram, 
  FaFacebookF, 
  FaYoutube, 
  FaTiktok, 
  FaLinkedinIn, 
  FaPinterestP
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiThreads } from "react-icons/si";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { PrivacyChoices } from "./PrivacyChoices";

const Footer = () => {
  const navigate = useNavigate();
  const [isPrivacyChoicesOpen, setIsPrivacyChoicesOpen] = useState(false);

  const handleNavClick = (href: string) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer id="footer" className="relative bg-background text-foreground overflow-hidden border-t border-border">
      {/* Premium Background - Light mode friendly */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/20"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.005] via-transparent to-primary/[0.005]"></div>
      
      {/* Glass morphism overlay - Subtle for light mode */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-radial from-primary/8 via-primary/4 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-gradient-radial from-secondary/6 via-secondary/3 to-transparent rounded-full blur-2xl"></div>
      </div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-3" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center mb-6 group">
              <div className="relative">
                <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-white/25 dark:bg-white/35 blur-md opacity-0 dark:opacity-60 transition-opacity duration-300"></div>
                <div className="relative w-10 h-10 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300 ring-1 ring-white/10 dark:ring-white/20">
                  <img 
                    src="/lovable-uploads/156b282b-1e93-436c-914a-a886a6a5cdfd.png" 
                    alt="JumpinAI Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <span className="ml-3 text-2xl font-black font-display text-foreground">JumpinAI</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-md font-light">
              Empowering the bold to leap beyond limits. Transforming how you work, create, and thrive in the AI revolution.
            </p>
            
            {/* Social Links - Professional Design */}
            <div className="flex flex-wrap gap-2 max-w-sm">
              <a href="https://www.instagram.com/jumpinai" target="_blank" rel="noopener noreferrer" className="group relative bg-muted/80 hover:bg-muted p-2.5 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-sm flex items-center justify-center border border-transparent hover:border-muted-foreground/20 backdrop-blur-sm">
                <FaInstagram className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
              </a>
              <a href="https://x.com/jump_in_ai" target="_blank" rel="noopener noreferrer" className="group relative bg-muted/80 hover:bg-muted p-2.5 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-sm flex items-center justify-center border border-transparent hover:border-muted-foreground/20 backdrop-blur-sm">
                <FaXTwitter className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
              </a>
              <a href="https://facebook.com/jumpinai/" target="_blank" rel="noopener noreferrer" className="group relative bg-muted/80 hover:bg-muted p-2.5 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-sm flex items-center justify-center border border-transparent hover:border-muted-foreground/20 backdrop-blur-sm">
                <FaFacebookF className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
              </a>
              <a href="https://www.youtube.com/@JumpinAI" target="_blank" rel="noopener noreferrer" className="group relative bg-muted/80 hover:bg-muted p-2.5 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-sm flex items-center justify-center border border-transparent hover:border-muted-foreground/20 backdrop-blur-sm">
                <FaYoutube className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
              </a>
              <a href="https://www.tiktok.com/@jump_in_ai" target="_blank" rel="noopener noreferrer" className="group relative bg-muted/80 hover:bg-muted p-2.5 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-sm flex items-center justify-center border border-transparent hover:border-muted-foreground/20 backdrop-blur-sm">
                <FaTiktok className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
              </a>
              <a href="https://www.threads.com/@jumpinai" target="_blank" rel="noopener noreferrer" className="group relative bg-muted/80 hover:bg-muted p-2.5 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-sm flex items-center justify-center border border-transparent hover:border-muted-foreground/20 backdrop-blur-sm">
                <SiThreads className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
              </a>
              <a href="https://www.linkedin.com/company/jumpinai/" target="_blank" rel="noopener noreferrer" className="group relative bg-muted/80 hover:bg-muted p-2.5 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-sm flex items-center justify-center border border-transparent hover:border-muted-foreground/20 backdrop-blur-sm">
                <FaLinkedinIn className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
              </a>
              <a href="https://www.pinterest.com/jumpinai/" target="_blank" rel="noopener noreferrer" className="group relative bg-muted/80 hover:bg-muted p-2.5 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-sm flex items-center justify-center border border-transparent hover:border-muted-foreground/20 backdrop-blur-sm">
                <FaPinterestP className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-foreground font-display">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/jumps" className="group flex items-center text-muted-foreground hover:text-foreground transition-colors duration-300">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Jumps in AI
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="group flex items-center text-muted-foreground hover:text-foreground transition-colors duration-300">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="group flex items-center text-muted-foreground hover:text-foreground transition-colors duration-300">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/for-investors" className="group flex items-center text-muted-foreground hover:text-foreground transition-colors duration-300">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  For Investors
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-foreground font-display">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy-policy" className="group flex items-center text-muted-foreground hover:text-foreground transition-colors duration-300">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-use" className="group flex items-center text-muted-foreground hover:text-foreground transition-colors duration-300">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Terms of Use
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => setIsPrivacyChoicesOpen(true)}
                  className="group flex items-center text-muted-foreground hover:text-foreground transition-colors duration-300 text-left"
                >
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Your Privacy Choices
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-6">
          <div className="text-center">
            <p className="text-muted-foreground font-light">
              © 2025 JumpinAI, LLC. All rights reserved.
            </p>
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50"></div>
      
      {/* Privacy Choices Modal */}
      <PrivacyChoices 
        isOpen={isPrivacyChoicesOpen} 
        onClose={() => setIsPrivacyChoicesOpen(false)} 
      />
    </footer>
  );
};

export default Footer;
