import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import customCardImage from '../assets/paymentcard.png';

export default function CustomCard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 24 } }
  };

  return (
    <section id="custom-card" className="bg-white relative overflow-hidden font-sans">
      
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

      <div className="w-full px-[5%] md:px-[7%] relative z-10 py-16 lg:py-20 flex flex-col-reverse lg:flex-row items-center justify-between gap-16 lg:gap-12">
        
        {/* Left Column: Text Content */}
        <motion.div 
          className="w-full lg:w-[45%] shrink-0 flex flex-col items-start text-left"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.span variants={itemVariants} className="text-gray-500 font-medium text-[15.5px] mb-4">
            Custom Card
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-[2.6rem] lg:text-[3.8rem] font-bold text-[#080808] leading-[1.05] tracking-tight mb-6 w-full lg:max-w-[95%]">
            Build a Fintech with Banking as a Service
          </motion.h2>
          <motion.p variants={itemVariants} className="text-gray-500 text-[1.1rem] md:text-[1.15rem] leading-[1.65] font-medium w-full lg:max-w-[90%] mb-10">
            Keep your business account and all your finance needs safely organized under one roof. Manage money quickly, easily & efficiently. Whether you're alone or leading a team.
          </motion.p>

          <motion.button variants={itemVariants} className="bg-primary text-[#063c1a] font-semibold text-[16px] px-8 py-3.5 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-transform active:scale-95 leading-none shadow-sm w-fit">
            Learn More 
            <span className="text-lg font-bold ml-1 mb-0.5">→</span>
          </motion.button>
        </motion.div>

        {/* Right Column: Image Content */}
        <motion.div 
          className="w-full lg:w-[50%] flex justify-center lg:justify-end items-center relative"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 30, delay: 0.2 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.div 
             className="relative w-full max-w-162.5 flex items-center justify-center rounded-4xl overflow-visible"
             animate={{ y: [0, -15, 0] }}
             transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          >
            {/* The extremely faint light-gray container box if needed, often baked into the PNG, but added safely behind */}
            <div className="absolute inset-0 bg-[#f9f9fa] rounded-4xl -z-10 transform scale-95 opacity-80"></div>
            <img 
              src={customCardImage} 
              alt="Custom Fintech Cards Visualization" 
              className="w-full h-auto object-contain object-right drop-shadow-2xl z-10"
            />
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
