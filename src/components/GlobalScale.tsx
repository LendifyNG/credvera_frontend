import { motion, type Variants } from 'framer-motion';

import worldImage from '../assets/world.png';
import usaImage from '../assets/usa.png';
import uaeImage from '../assets/uae.png';
import paraguayImage from '../assets/paraguay.png';
import indiaImage from '../assets/india.png';

export default function GlobalScale() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15, delayChildren: 0.1 } 
    }
  };
  
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring', 
        stiffness: 200, 
        damping: 24 
      } 
    }
  };

  return (
    <section id="global-scale" className="w-full flex flex-col lg:flex-row font-sans">
      
      {/* Left Panel: Dark Theme */}
      <div className="w-full lg:w-1/2 bg-[#063c1a] px-[5%] lg:pl-[7%] lg:pr-16 py-20 lg:py-28 flex flex-col justify-center">
        <motion.div 
          className="w-full max-w-162.5 mx-auto lg:ml-auto lg:mr-0"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.span variants={itemVariants} className="text-primary font-medium text-[15.5px] mb-4 block">
            Global Scale
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-[2.6rem] lg:text-[3.8rem] font-bold text-white leading-[1.05] tracking-tight mb-6">
            Sell Everywhere In Global Commerce
          </motion.h2>
          <motion.p variants={itemVariants} className="text-white/70 text-[1.1rem] md:text-[1.15rem] leading-[1.65] font-medium mb-16 max-w-[95%]">
            When you sell your software products to global customers, accepting local payment methods is critical in capturing the total market opportunity. Don't let payment friction get in the way of a single sale. Allow customers to pay in their local currency.
          </motion.p>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start gap-10 md:gap-0 mt-8">
            <div className="flex-1 md:pr-6">
              <h4 className="text-primary text-[2.5rem] lg:text-[3rem] font-bold tracking-tight mb-1 leading-none">132+</h4>
              <p className="text-white/60 text-[1.05rem] font-medium w-full max-w-37.5">Currencies supported</p>
            </div>
            <div className="flex-1 md:px-8 md:border-l border-white/10">
              <h4 className="text-primary text-[2.5rem] lg:text-[3rem] font-bold tracking-tight mb-1 leading-none">85.5%</h4>
              <p className="text-white/60 text-[1.05rem] font-medium w-full max-w-37.5">businesses using Finto</p>
            </div>
            <div className="flex-1 md:pl-8 md:border-l border-white/10">
              <h4 className="text-primary text-[2.5rem] lg:text-[3rem] font-bold tracking-tight mb-1 leading-none">150M</h4>
              <p className="text-white/60 text-[1.05rem] font-medium w-full max-w-37.5">API request per day</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Panel: Solid Primary Theme */}
      <div className="w-full lg:w-1/2 bg-primary px-[5%] lg:pr-[7%] lg:pl-16 flex items-center justify-center relative overflow-hidden min-h-150 lg:min-h-auto py-24 lg:py-0">
        <motion.div 
          className="relative w-full max-w-162.5 aspect-square flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Main Globe Mesh */}
          <img 
            src={worldImage} 
            alt="Global Wireframe Reference" 
            className="w-full lg:w-[130%] max-w-none h-auto object-contain translate-y-8 lg:translate-x-12 opacity-80 mix-blend-luminosity" 
          />

          {/* Floating Absolute Cards */}
          <motion.img 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1, y: [15, -10, 15] }}
            transition={{ 
              opacity: { delay: 0.3, duration: 0.5 },
              y: { repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.3 }
            }}
            viewport={{ once: true }}
            src={usaImage} 
            alt="USA scale metric" 
            className="absolute top-[0%] md:top-[10%] left-[0%] md:left-[-5%] w-[65%] md:w-[45%] lg:w-[48%] max-w-75 h-auto object-contain drop-shadow-2xl z-10" 
          />
          <motion.img 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1, y: [15, -10, 15] }}
            transition={{ 
              opacity: { delay: 0.5, duration: 0.5 },
              y: { repeat: Infinity, duration: 4.5, ease: 'easeInOut', delay: 0.4 }
            }}
            viewport={{ once: true }}
            src={uaeImage} 
            alt="UAE scale metric" 
            className="absolute top-[25%] md:top-[32%] right-[-5%] md:right-[-10%] w-[65%] md:w-[45%] lg:w-[48%] max-w-75 h-auto object-contain drop-shadow-2xl z-20" 
          />
          <motion.img 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1, y: [15, -10, 15] }}
            transition={{ 
              opacity: { delay: 0.4, duration: 0.5 },
              y: { repeat: Infinity, duration: 5.5, ease: 'easeInOut', delay: 0.5 }
            }}
            viewport={{ once: true }}
            src={paraguayImage} 
            alt="Paraguay scale metric" 
            className="absolute bottom-[28%] md:bottom-[35%] left-[5%] md:left-[2%] w-[65%] md:w-[45%] lg:w-[48%] max-w-75 h-auto object-contain drop-shadow-2xl z-30" 
          />
          <motion.img 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1, y: [15, -10, 15] }}
            transition={{ 
              opacity: { delay: 0.6, duration: 0.5 },
              y: { repeat: Infinity, duration: 4.8, ease: 'easeInOut', delay: 0.2 }
            }}
            viewport={{ once: true }}
            src={indiaImage} 
            alt="India scale metric" 
            className="absolute bottom-[0%] md:bottom-[5%] right-[5%] md:right-[5%] w-[65%] md:w-[45%] lg:w-[48%] max-w-75 h-auto object-contain drop-shadow-2xl z-40" 
          />
        </motion.div>
      </div>

    </section>
  );
}
