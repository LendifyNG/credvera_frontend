import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`h-24 flex items-center justify-between px-[5%] md:px-[7%] sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#063c1a]/85 backdrop-blur-md border-b border-white/10 shadow-lg' 
          : 'bg-[#063c1a] border-b border-dashed border-white/10'
      }`}
    >
      
      {/* Left: Logo */}
      <div className="flex items-center gap-28">
        <a href="/" className="flex items-center cursor-pointer">
          <img src={logo} alt="Credvera" className="h-8 md:h-9 w-auto" />
        </a>
        
        {/* Center: Navigation Links */}
        <div className="hidden lg:flex items-center gap-12 ml-4">
          <a href="#features" className="text-sm font-normal text-white hover:text-white/70 transition-colors tracking-wide">Features</a>
          <a href="#about" className="text-sm font-normal text-white hover:text-white/70 transition-colors tracking-wide">About</a>
          <a href="#contact" className="text-sm font-normal text-white hover:text-white/70 transition-colors tracking-wide">Contact</a>
          <a href="#pricing" className="text-sm font-normal text-white hover:text-white/70 transition-colors tracking-wide">Pricing</a>
        </div>
      </div>

      {/* Right: Buttons */}
      <div className="hidden md:flex items-center gap-5">
        <button className="text-white font-medium text-sm px-6 py-2 rounded-full border border-white hover:bg-white/10 transition-colors">
          Sign In
        </button>
        <button className="bg-primary text-[#063c1a] font-semibold text-sm px-7 py-2 rounded-full hover:opacity-90 transition-opacity">
          Open an Account
        </button>
      </div>

      <button 
        className="md:hidden flex flex-col gap-1.5 justify-center ml-auto"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
      </button>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 top-24 bg-[#063c1a]/98 backdrop-blur-xl z-40 transition-all duration-300 md:hidden flex flex-col px-[5%] py-8 border-t border-white/5 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col gap-6 items-center w-full">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-[18px] font-medium text-white/90 hover:text-white transition-colors">Features</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-[18px] font-medium text-white/90 hover:text-white transition-colors">About</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-[18px] font-medium text-white/90 hover:text-white transition-colors">Contact</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-[18px] font-medium text-white/90 hover:text-white transition-colors">Pricing</a>
          
          <div className="w-full h-px bg-white/10 my-4"></div>
          
          <button className="w-full text-white font-medium text-[16px] px-6 py-3 rounded-full border border-white hover:bg-white/10 transition-colors">
            Sign In
          </button>
          <button className="w-full bg-primary text-[#063c1a] font-semibold text-[16px] px-6 py-3 rounded-full hover:opacity-90 transition-opacity">
            Open an Account
          </button>
        </div>
      </div>
    </nav>
  );
}
