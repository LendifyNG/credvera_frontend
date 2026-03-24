import { motion, type Variants } from 'framer-motion';
import business1 from '../assets/business1.png';
import business2 from '../assets/business2.png';
import business3 from '../assets/business3.png';

export default function BuiltForGrowth() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15, delayChildren: 0.1 } 
    }
  };
  
  const itemVariants: Variants = {
    hidden: { opacity: 0, rotateX: 60, y: 50, transformPerspective: 1000 },
    visible: { 
      opacity: 1, 
      rotateX: 0, 
      y: 0, 
      transition: { 
        type: 'spring', 
        stiffness: 120, 
        damping: 15 
      } 
    }
  };

  return (
    <section id="built-for-growth" className="bg-[#fcfcfc] relative overflow-hidden font-sans border-t border-black/5">
      
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

      <div className="w-full px-[5%] md:px-[7%] relative z-10 py-12 lg:py-16 flex flex-col items-start">
        
        {/* Top Header Block */}
        <motion.div 
          className="flex flex-col mb-16 lg:mb-24 w-full lg:max-w-175"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.span variants={itemVariants} className="text-gray-500 font-medium text-[15.5px] mb-4">
            Built for Growth
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-3xl lg:text-4xl font-bold text-[#080808] leading-[1.05] tracking-tight mb-6">
            Take Your Business Faster
          </motion.h2>
          <motion.p variants={itemVariants} className="text-gray-500 text-base leading-[1.65] font-medium w-full">
            Amet lacus ipsum morbi nisl ac. Vel morbi turpis vitae nulla lobortis integer purus consectetur. Parturient ut tempor massa mi
          </motion.p>
        </motion.div>

        {/* 3-Column Features Grid */}
        <motion.div 
          className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          
          {/* Card 1 */}
          <motion.div variants={itemVariants} className="flex flex-col w-full group">
            <div className="w-full relative mb-8 flex items-center justify-center overflow-hidden rounded-md transition-transform duration-500 group-hover:-translate-y-2">
              <img src={business1} alt="Sell to Businesses" className="w-full h-auto object-cover" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-[#080808] tracking-tight mb-3 transition-colors">
              Sell to Businesses
            </h3>
            <p className="text-gray-500 text-sm md:text-base leading-[1.6] font-medium pr-4">
              Launch a B2B business and collect one-time or recurring payments from customers.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} className="flex flex-col w-full group">
            <div className="w-full relative mb-8 flex items-center justify-center overflow-hidden rounded-md transition-transform duration-500 group-hover:-translate-y-2">
              <img src={business2} alt="Validate Your Idea" className="w-full h-auto object-cover" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-[#080808] tracking-tight mb-3 transition-colors">
              Validate Your Idea
            </h3>
            <p className="text-gray-500 text-sm md:text-base leading-[1.6] font-medium pr-4">
              Test your product idea by launching payments with little to no code.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={itemVariants} className="flex flex-col w-full group">
            <div className="w-full relative mb-8 flex items-center justify-center overflow-hidden rounded-md transition-transform duration-500 group-hover:-translate-y-2">
              <img src={business3} alt="Sell to Consumer" className="w-full h-auto object-cover" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-[#080808] tracking-tight mb-3 transition-colors">
              Sell to Consumer
            </h3>
            <p className="text-gray-500 text-sm md:text-base leading-[1.6] font-medium pr-4">
              Launch a B2C business with a prebuilt payment page that's optimized for conversion.
            </p>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}
