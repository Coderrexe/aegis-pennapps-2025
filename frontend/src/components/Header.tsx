import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-5 md:px-10 py-5 flex justify-between items-center backdrop-blur-sm">
      <div className="text-xl md:text-3xl font-light tracking-wider">Aegis</div>
      <nav>
        <ul className="flex gap-4 md:gap-10 list-none">
          <li>
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
              Navigate
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
