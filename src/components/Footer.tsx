
import { ArrowRight, Heart, Facebook, Youtube, Twitter, Instagram, Linkedin } from "lucide-react";
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
            
            {/* Social Links - Enhanced Design */}
            <div className="flex flex-wrap gap-3 max-w-sm">
              <a href="https://www.instagram.com/jumpinai" target="_blank" rel="noopener noreferrer" className="group relative bg-gradient-to-br from-muted to-muted/70 hover:from-pink-500 hover:to-orange-500 p-3.5 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/25 dark:hover:shadow-pink-400/20 flex items-center justify-center">
                <Instagram className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors duration-300" />
              </a>
              <a href="https://x.com/jump_in_ai" target="_blank" rel="noopener noreferrer" className="group relative bg-gradient-to-br from-muted to-muted/70 hover:from-blue-500 hover:to-blue-600 p-3.5 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25 dark:hover:shadow-blue-400/20 flex items-center justify-center">
                <Twitter className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors duration-300" />
              </a>
              <a href="https://facebook.com/jumpinai/" target="_blank" rel="noopener noreferrer" className="group relative bg-gradient-to-br from-muted to-muted/70 hover:from-blue-600 hover:to-blue-700 p-3.5 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-600/25 dark:hover:shadow-blue-500/20 flex items-center justify-center">
                <Facebook className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors duration-300" />
              </a>
              <a href="https://www.youtube.com/@JumpinAI" target="_blank" rel="noopener noreferrer" className="group relative bg-gradient-to-br from-muted to-muted/70 hover:from-red-500 hover:to-red-600 p-3.5 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/25 dark:hover:shadow-red-400/20 flex items-center justify-center">
                <Youtube className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors duration-300" />
              </a>
              <a href="https://www.tiktok.com/@jump_in_ai" target="_blank" rel="noopener noreferrer" className="group relative bg-gradient-to-br from-muted to-muted/70 hover:from-gray-800 hover:to-black p-3.5 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-gray-800/25 dark:hover:shadow-white/20 flex items-center justify-center">
                <svg className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
              <a href="https://www.threads.com/@jumpinai" target="_blank" rel="noopener noreferrer" className="group relative bg-gradient-to-br from-muted to-muted/70 hover:from-purple-600 hover:to-purple-700 p-3.5 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-600/25 dark:hover:shadow-purple-500/20 flex items-center justify-center">
                <svg className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.186 24h-.007c-5.947-.002-10.794-4.85-10.794-10.798S6.232 2.404 12.179 2.404s10.794 4.85 10.794 10.798S18.133 23.998 12.186 24zM12.179 4.404c-4.844 0-8.794 3.95-8.794 8.798s3.95 8.798 8.794 8.798 8.794-3.95 8.794-8.798-3.95-8.798-8.794-8.798z"/>
                  <path d="M16.935 8.75c-.439-.832-1.255-1.297-2.301-1.31-.48-.006-.958.13-1.348.384-.221.144-.407.341-.54.572-.133-.231-.319-.428-.54-.572-.39-.254-.868-.39-1.348-.384-1.046.013-1.862.478-2.301 1.31-.6 1.138-.359 2.534.645 3.729l4.484 5.342 4.484-5.342c1.004-1.195 1.245-2.591.645-3.729zm-4.756 7.185l-3.395-4.042c-.699-.832-.837-1.747-.386-2.579.305-.563.831-.847 1.481-.8.425.031.791.194 1.031.459.359.396.359 1.033 0 1.429l-.539.642.539.642c.359.396.359 1.033 0 1.429-.24.265-.606.428-1.031.459-.65.047-1.176-.237-1.481-.8-.451-.832-.313-1.747.386-2.579l.395-.471-.395-.471c.012-.014.026-.029.041-.043.254-.233.581-.362.925-.362s.671.129.925.362c.015.014.029.029.041.043l-.395.471.395.471z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/jumpinai/" target="_blank" rel="noopener noreferrer" className="group relative bg-gradient-to-br from-muted to-muted/70 hover:from-blue-700 hover:to-blue-800 p-3.5 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-700/25 dark:hover:shadow-blue-600/20 flex items-center justify-center">
                <Linkedin className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors duration-300" />
              </a>
              <a href="https://www.pinterest.com/jumpinai/" target="_blank" rel="noopener noreferrer" className="group relative bg-gradient-to-br from-muted to-muted/70 hover:from-red-600 hover:to-red-700 p-3.5 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-600/25 dark:hover:shadow-red-500/20 flex items-center justify-center">
                <svg className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.374 0 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 19c-.721 0-1.418-.109-2.073-.312.286-.458.701-1.191.923-1.772.118-.31.611-2.364.611-2.364.32.609 1.252 1.143 2.243 1.143 2.952 0 4.963-2.693 4.963-6.293 0-2.72-2.301-5.264-5.795-5.264-4.349 0-6.545 3.123-6.545 5.729 0 1.576.599 2.973 1.879 3.495.209.085.321.047.371-.13.036-.131.225-.896.308-1.242.113-.472.069-.636-.247-.949-.684-.674-1.121-1.532-1.121-2.757 0-3.551 2.655-6.734 6.918-6.734 3.774 0 5.847 2.304 5.847 5.386 0 4.049-1.789 7.467-4.45 7.467-1.462 0-2.556-1.207-2.206-2.688.419-1.765 1.232-3.669 1.232-4.947 0-1.14-.611-2.091-1.879-2.091-1.49 0-2.688 1.54-2.688 3.604 0 1.314.445 2.204.445 2.204s-1.532 6.491-1.801 7.63c-.534 2.267-.08 5.048-.042 5.33.022.165.234.204.33.08.138-.177 1.916-2.383 2.506-4.583.167-.623.956-3.724.956-3.724.473.901 1.855 1.695 3.322 1.695 4.37 0 7.336-3.982 7.336-9.312C23.75 4.5 18.75 0 12 0z"/>
                </svg>
              </a>
              <a href="https://whop.com/jumpinai/" target="_blank" rel="noopener noreferrer" className="group relative bg-gradient-to-br from-muted to-muted/70 hover:from-green-500 hover:to-green-600 p-3.5 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-green-500/25 dark:hover:shadow-green-400/20 flex items-center justify-center">
                <svg className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
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
