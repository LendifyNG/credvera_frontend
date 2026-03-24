import { motion, type Variants } from 'framer-motion';
import paywithImage from '../assets/paywith.png';

export default function Features() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
  };
  
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 20 
      } 
    }
  };

  return (
    <section id="features" className="bg-white relative overflow-hidden font-sans">
      
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

      <div className="w-full px-[5%] md:px-[7%] relative z-10 py-12 lg:py-16">
        
        {/* CSS Grid for Mobile -> Desktop re-ordering */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-16 lg:gap-y-0 lg:gap-x-12">
          
          {/* 1. Solutions Text Block (Mobile: 1st, Desktop: Top-Left) */}
          <motion.div 
            className="lg:col-start-1 lg:row-start-1 flex flex-col items-start pt-6 lg:pt-0"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.span variants={itemVariants} className="text-gray-500 font-medium text-[15px] mb-4">
              Solutions
            </motion.span>
            <motion.h2 variants={itemVariants} className="text-3xl lg:text-4xl font-bold text-[#080808] leading-[1.05] tracking-tight mb-6 w-full lg:max-w-[95%]">
              Open Your Business Account Online
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-500 text-base leading-[1.65] w-full lg:max-w-[85%] font-medium">
              Keep your business account and all your finance needs safely organized under one roof. Manage money quickly, easily & efficiently. Whether you're alone or leading a team.
            </motion.p>
          </motion.div>

          {/* 2. Payment Text Block (Mobile: 2nd, Desktop: Bottom-Right) */}
          <motion.div 
            className="lg:col-start-2 lg:row-start-2 flex flex-col items-start lg:mt-32"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.span variants={itemVariants} className="text-gray-500 font-medium text-[15px] mb-4">
              Payment
            </motion.span>
            <motion.h2 variants={itemVariants} className="text-3xl lg:text-4xl font-bold text-[#080808] leading-[1.05] tracking-tight mb-6 w-full lg:max-w-[95%] text-left">
              Accept and Optimize Payment Globally
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-500 text-base leading-[1.65] w-full lg:max-w-[85%] font-medium mb-10 text-left">
              Keep your business account and all your finance needs safely organized under one roof. Manage money quickly, easily & efficiently. Whether you're alone or leading a team.
            </motion.p>
            <motion.button variants={itemVariants} className="bg-primary text-[#063c1a] font-semibold text-sm px-6 py-2.5 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-transform active:scale-95 leading-none shadow-sm w-fit">
              Learn More 
              <span className="text-base font-bold ml-1 mb-0.5">→</span>
            </motion.button>
          </motion.div>

          {/* 3. Image Block (Mobile: 3rd, Desktop: Bottom-Left) */}
          <motion.div 
            className="lg:col-start-1 lg:row-start-2 flex items-center justify-center lg:justify-start lg:mt-24 w-full"
            initial={{ opacity: 0, x: -50, rotate: -6 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 25, delay: 0.2 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <img 
              src={paywithImage} 
              alt="Payment Options Interface" 
              className="w-full max-w-80 lg:max-w-112.5 h-auto object-contain object-left drop-shadow-[0_25px_35px_rgba(0,0,0,0.1)]"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
