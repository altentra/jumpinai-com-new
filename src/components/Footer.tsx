
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

const Footer = () => {
  const navigate = useNavigate();

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
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-3" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center mb-6 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="/lovable-uploads/e5569afe-9d72-47bc-8b5c-5641bd1d4de6.png" 
                  alt="JumpinAI Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="ml-3 text-2xl font-black font-display text-foreground">JumpinAI</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-md font-light">
              Empowering professionals and organizations to implement AI strategically with clarity, precision, and measurable results.
            </p>
            
            {/* Social Links - Professional Design */}
            <div className="flex flex-wrap gap-2 max-w-sm">
              <a href="https://www.instagram.com/jumpinai" target="_blank" rel="noopener noreferrer" className="group relative bg-muted/60 hover:bg-muted/80 p-2.5 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-sm flex items-center justify-center border border-transparent hover:border-muted-foreground/20">
                <FaInstagram className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
              </a>
              <a href="https://x.com/jump_in_ai" target="_blank" rel="noopener noreferrer" className="group relative bg-muted/60 hover:bg-muted/80 p-2.5 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-sm flex items-center justify-center border border-transparent hover:border-muted-foreground/20">
                <FaXTwitter className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
              </a>
              <a href="https://facebook.com/jumpinai/" target="_blank" rel="noopener noreferrer" className="group relative bg-muted/60 hover:bg-muted/80 p-2.5 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-sm flex items-center justify-center border border-transparent hover:border-muted-foreground/20">
                <FaFacebookF className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
              </a>
              <a href="https://www.youtube.com/@JumpinAI" target="_blank" rel="noopener noreferrer" className="group relative bg-muted/60 hover:bg-muted/80 p-2.5 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-sm flex items-center justify-center border border-transparent hover:border-muted-foreground/20">
                <FaYoutube className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
              </a>
              <a href="https://www.tiktok.com/@jump_in_ai" target="_blank" rel="noopener noreferrer" className="group relative bg-muted/60 hover:bg-muted/80 p-2.5 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-sm flex items-center justify-center border border-transparent hover:border-muted-foreground/20">
                <FaTiktok className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
              </a>
              <a href="https://www.threads.com/@jumpinai" target="_blank" rel="noopener noreferrer" className="group relative bg-muted/60 hover:bg-muted/80 p-2.5 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-sm flex items-center justify-center border border-transparent hover:border-muted-foreground/20">
                <SiThreads className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
              </a>
              <a href="https://www.linkedin.com/company/jumpinai/" target="_blank" rel="noopener noreferrer" className="group relative bg-muted/60 hover:bg-muted/80 p-2.5 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-sm flex items-center justify-center border border-transparent hover:border-muted-foreground/20">
                <FaLinkedinIn className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
              </a>
              <a href="https://www.pinterest.com/jumpinai/" target="_blank" rel="noopener noreferrer" className="group relative bg-muted/60 hover:bg-muted/80 p-2.5 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-sm flex items-center justify-center border border-transparent hover:border-muted-foreground/20">
                <FaPinterestP className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
              </a>
              <a href="https://whop.com/jumpinai/" target="_blank" rel="noopener noreferrer" className="group relative bg-muted/60 hover:bg-muted/80 p-2.5 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-sm flex items-center justify-center border border-transparent hover:border-muted-foreground/20">
                <svg className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7L12 12L22 7L12 2M2 17L12 22L22 17M2 12L12 17L22 12"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-foreground font-display">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about-us" className="group flex items-center text-muted-foreground hover:text-foreground transition-colors duration-300">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="group flex items-center text-muted-foreground hover:text-foreground transition-colors duration-300">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="group flex items-center text-muted-foreground hover:text-foreground transition-colors duration-300">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Contact Us
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
    </footer>
  );
};

export default Footer;
