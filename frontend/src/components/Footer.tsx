import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="px-6 md:px-10 py-8 border-t border-[var(--neutral)]/10">
      <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
        <div className="text-xs opacity-50 mb-2 sm:mb-0">
          © https://aeg1s.vercel.app/
        </div>
        <a href="#" className="text-xs hover:underline cursor-pointer">
          Devpost
        </a>
      </div>
    </footer>
  );
};

export default Footer;
