import React from 'react';
import { Link } from 'react-router-dom';

const MiniFooter: React.FC = () => {
  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-muted-foreground">
          <p>© 2025 JumpinAI, LLC. All rights reserved.</p>
          <div className="flex gap-4">
            <Link 
              to="/terms-of-use" 
              className="hover:text-primary transition-colors"
            >
              Terms of Use
            </Link>
            <Link 
              to="/privacy-policy" 
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MiniFooter;