import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export default function CallToAction() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15, delayChildren: 0.1 } 
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 24 } }
  };

  return (
    <section id="cta" className="bg-white relative overflow-hidden font-sans border-t border-black/5">
      
      {/* Dashed Background Grid - 6 equal columns (7 lines) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-full h-full flex justify-between px-[5%] md:px-[7%]">
          <div className="h-full border-l border-dashed border-black/5"></div>
          <div className="h-full border-l border-dashed border-black/5"></div>
          <div className="h-full border-l border-dashed border-black/5"></div>
          <div className="h-full border-l border-dashed border-black/5"></div>
          <div className="h-full border-l border-dashed border-black/5"></div>
          <div className="h-full border-l border-dashed border-black/5"></div>
          <div className="h-full border-l border-dashed border-black/5"></div>
        </div>
      </div>

      <div className="w-full relative z-10 py-16 lg:py-24 px-[5%] md:px-[7%]">
        
        {/* Dark Green Bounded Block (respecting padding) */}
        <motion.div 
          className="w-full bg-[#063c1a] py-20 lg:py-28 px-6 md:px-12 flex flex-col items-center justify-center text-center shadow-lg"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2 
            variants={itemVariants} 
            className="text-[2.8rem] md:text-[3.5rem] lg:text-[4.5rem] font-bold text-white leading-[1.05] tracking-tight mb-6 max-w-212.5"
          >
            Simplifying Payments for <br className="hidden md:block" /> Growing Business
          </motion.h2>
          
          <motion.p 
            variants={itemVariants} 
            className="text-white/70 text-[1.05rem] lg:text-[1.1rem] font-medium mb-10 lg:mb-12 max-w-150 leading-[1.6]"
          >
            Join over 300+ partners and customers already growing with Finto
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4">
            <button className="bg-primary text-[#063c1a] font-bold text-[16px] px-8 py-3.5 rounded-full hover:opacity-90 transition-transform active:scale-95 leading-none w-full sm:w-auto shadow-sm">
              Open an Account
            </button>
            <button className="bg-white text-[#063c1a] font-bold text-[16px] px-8 py-3.5 rounded-full hover:bg-gray-50 transition-transform active:scale-95 leading-none w-full sm:w-auto shadow-sm">
              Contact Sales
            </button>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
