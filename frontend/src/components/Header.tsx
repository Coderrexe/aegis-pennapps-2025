import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-5 md:px-10 py-5 flex justify-between items-center backdrop-blur-sm">
      <Link to="/" className="text-xl md:text-3xl font-light tracking-wider hover:opacity-80 transition-opacity">
        Aegis
      </Link>
      <nav>
        <ul className="flex gap-4 md:gap-10 list-none">
          <li>
<<<<<<< HEAD
            <Link 
              to="/about" 
              className="text-xs md:text-sm font-normal tracking-wide uppercase cursor-pointer hover:underline transition-all"
            >
              About
            </Link>
          </li>
          <li>
            <Link 
              to="/navigate" 
              className="text-xs md:text-sm font-normal tracking-wide uppercase cursor-pointer hover:underline transition-all"
            >
=======
            <a 
              href="https://devpost.com/software/aegis-lxtqi3" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs md:text-sm font-normal tracking-wide uppercase cursor-pointer hover:underline"
            >
              About
            </a>
          </li>
          <li>
            <Link to="/navigate" className="text-xs md:text-sm font-normal tracking-wide uppercase cursor-pointer hover:underline">
>>>>>>> f7f9cec2e6db0034ba4c4f7d9022afa8ec0f3845
              Navigate
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
