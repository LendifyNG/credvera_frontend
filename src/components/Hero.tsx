import { motion, type Variants } from 'framer-motion';
import bannerImage from '../assets/banner_image.png';

export default function Hero() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15, delayChildren: 0.2 } 
    }
  };
  
  const textVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, x: 50 },
    visible: { opacity: 1, scale: 1, x: 0, transition: { type: 'spring', stiffness: 100, damping: 20, delay: 0.4 } }
  };

  const clientVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', delay: 0.8 } }
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#063c1a] font-sans">
      
      {/* Dashed Background Grid - exactly 6 equal columns (7 lines) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-full h-full flex justify-between px-[5%] md:px-[7%]">
          <div className="h-full border-l border-dashed border-white/5"></div>
          <div className="h-full border-l border-dashed border-white/5"></div>
          <div className="h-full border-l border-dashed border-white/5"></div>
          <div className="h-full border-l border-dashed border-white/5"></div>
          <div className="h-full border-l border-dashed border-white/5"></div>
          <div className="h-full border-l border-dashed border-white/5"></div>
          <div className="h-full border-l border-dashed border-white/5"></div>
        </div>
      </div>

      <div className="relative z-10 w-full px-[5%] md:px-[7%] pt-12 pb-20 lg:pt-20 lg:pb-30 flex flex-col justify-between min-h-[calc(100vh-80px)]">
        
        {/* Main 45/55 Split Content */}
        <div className="flex flex-col lg:flex-row items-center justify-between w-full h-full grow gap-16 lg:gap-10">
          
          {/* Left Side: Typography (45% Width on Desktop) */}
          <motion.div 
            className="w-full lg:w-[45%] flex flex-col items-start pt-10 lg:pt-0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={textVariants} className="text-white text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight mb-6 w-full max-w-[90%]">
              All In One App Finance for Your Business
            </motion.h1>
            
            <motion.p variants={textVariants} className="text-white/80 text-base md:text-lg leading-[1.6] max-w-100 mb-10 font-medium">
              Join millions of businesses trusting Credvera to manage payments and finances across Africa and outside.
            </motion.p>
            
            <motion.div variants={textVariants} className="flex flex-col sm:flex-row items-center w-full sm:w-auto gap-4">
              <button className="w-full sm:w-auto bg-primary text-[#063c1a] font-bold text-[16px] px-8 py-3.5 rounded-full hover:opacity-90 transition-transform active:scale-95 shadow-[0_4px_30px_rgba(127,222,128,0.2)]">
                Start for free
              </button>
              <button className="w-full sm:w-auto group flex items-center justify-center gap-2 text-white font-medium text-[16px] px-8 py-3.5 rounded-full border border-white/20 hover:bg-white/10 transition-colors">
                <div className="w-6 h-6 rounded-full border border-white/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
                Contact Sales
              </button>
            </motion.div>
          </motion.div>

          {/* Right Side: Mockup Image (55% Width on Desktop) */}
          <motion.div 
            className="w-full lg:w-[55%] flex justify-end"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            <img 
              src={bannerImage} 
              alt="Credvera Dashboard Native Flow Mockups" 
              className="w-full h-auto max-w-150 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
              loading="eager"
            />
          </motion.div>
          
        </div>

        {/* Bottom Partner Section */}
        <motion.div 
          className="w-full flex items-center justify-between mt-10 lg:mt-12 border-t border-white/10 pt-8"
          variants={clientVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Text block perfectly matching screenshot (Sentence case) */}
          <div className="hidden md:block w-full md:w-auto md:min-w-62.5 lg:w-[32%] shrink-0 text-white/50 text-[0.85rem] font-medium tracking-wide">
            Trusted by thousand <br/>companies in the world
          </div>
          
          {/* Logos track - African Financial Companies */}
          <div className="flex items-center justify-between w-full lg:w-[68%] opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 overflow-x-auto gap-8 sm:gap-12 overflow-y-hidden hide-scrollbar">
             
             {/* Paystack */}
             <div className="flex items-center gap-2 shrink-0">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M11 7h2v10h-2z"/>
                </svg>
                <span className="text-white font-bold text-[22px] tracking-tight">paystack</span>
             </div>

             {/* Flutterwave */}
             <div className="flex items-center gap-2 shrink-0">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span className="text-white font-bold text-[22px] tracking-tight">flutterwave</span>
             </div>

             {/* Moniepoint */}
             <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
                   <div className="w-2.5 h-2.5 rounded-full bg-[#063c1a]"></div>
                </div>
                <span className="text-white font-bold text-[22px] tracking-tight">moniepoint</span>
             </div>

             {/* Interswitch */}
             <div className="flex items-center gap-2 shrink-0">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v8H8V8z"/>
                </svg>
                <span className="text-white font-bold text-[22px] tracking-tight">Interswitch</span>
             </div>
             
          </div>
        </motion.div>

      </div>
    </section>
  );
}
