import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-5 md:px-10 py-5 flex justify-between items-center backdrop-blur-sm">
      <div className="text-xl md:text-3xl font-light tracking-wider">Aegis</div>
      <nav>
        <ul className="flex gap-4 md:gap-10 list-none">
          <li className="text-xs md:text-sm font-normal tracking-wide uppercase cursor-pointer hover:underline">
            About
          </li>
          <li className="text-xs md:text-sm font-normal tracking-wide uppercase cursor-pointer hover:underline">
            Navigate
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
