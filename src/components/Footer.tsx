import { motion, type Variants } from 'framer-motion';
import favicon from '../assets/favicon.png';


export default function Footer() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.1 } 
    }
  };
  
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
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
    <footer className="bg-white relative overflow-hidden font-sans border-t border-black/5">
      
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

      <div className="w-full relative z-10 px-[5%] md:px-[7%] pt-20 lg:pt-28 pb-10">
        
        {/* Top Links Grid - Mapped precisely to the 6-column background grid */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-0 gap-y-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          
          {/* Brand Column (Spans 2 logical columns pushing 'Features' to exactly intersect Grid Line 3) */}
          <motion.div variants={itemVariants} className="col-span-2 md:col-span-3 lg:col-span-2 flex flex-col items-start pr-8">
            <a href="/" className="flex items-center gap-2 mb-8">
              <img src={favicon} alt="Credvera" className="h-9 w-auto object-contain" />
              <span className="text-primary font-bold text-[1.5rem] tracking-tight ml-2">credvera</span>
            </a>
          </motion.div>

          {/* Column 3: Features */}
          <motion.div variants={itemVariants} className="col-span-1 flex flex-col gap-5">
            <h4 className="text-[#888888] font-medium text-[15px] mb-3">Features</h4>
            <a href="#" className="text-[#0c0c0c] hover:text-primary font-medium text-[15.5px] transition-colors">Payment Link</a>
            <a href="#" className="text-[#0c0c0c] hover:text-primary font-medium text-[15.5px] transition-colors">Recurring Billing</a>
            <a href="#" className="text-[#0c0c0c] hover:text-primary font-medium text-[15.5px] transition-colors">Invoicing</a>
            <a href="#" className="text-[#0c0c0c] hover:text-primary font-medium text-[15.5px] transition-colors">Checkout</a>
            <a href="#" className="text-[#0c0c0c] hover:text-primary font-medium text-[15.5px] transition-colors">Integrations</a>
            <a href="#" className="text-[#0c0c0c] hover:text-primary font-medium text-[15.5px] transition-colors">Pricing</a>
          </motion.div>

          {/* Column 4: Solutions */}
          <motion.div variants={itemVariants} className="col-span-1 flex flex-col gap-5">
            <h4 className="text-[#888888] font-medium text-[15px] mb-3">Solutions</h4>
            <a href="#" className="text-[#0c0c0c] hover:text-primary font-medium text-[15.5px] transition-colors">eCommerce</a>
            <a href="#" className="text-[#0c0c0c] hover:text-primary font-medium text-[15.5px] transition-colors">Finance Automation</a>
            <a href="#" className="text-[#0c0c0c] hover:text-primary font-medium text-[15.5px] transition-colors">Crypto</a>
            <a href="#" className="text-[#0c0c0c] hover:text-primary font-medium text-[15.5px] transition-colors">Global Business</a>
            <a href="#" className="text-[#0c0c0c] hover:text-primary font-medium text-[15.5px] transition-colors">Marketplaces</a>
          </motion.div>

          {/* Column 5: Resources */}
          <motion.div variants={itemVariants} className="col-span-1 flex flex-col gap-5">
            <h4 className="text-[#888888] font-medium text-[15px] mb-3">Resources</h4>
            <a href="#" className="text-[#0c0c0c] hover:text-primary font-medium text-[15.5px] transition-colors">Tutorials</a>
            <a href="#" className="text-[#0c0c0c] hover:text-primary font-medium text-[15.5px] transition-colors">Blog</a>
            <a href="#" className="text-[#0c0c0c] hover:text-primary font-medium text-[15.5px] transition-colors">Community</a>
            <a href="#" className="text-[#0c0c0c] hover:text-primary font-medium text-[15.5px] transition-colors">Privacy Policy</a>
          </motion.div>

          {/* Column 6: About */}
          <motion.div variants={itemVariants} className="col-span-1 flex flex-col gap-5">
            <h4 className="text-[#888888] font-medium text-[15px] mb-3">About</h4>
            <a href="#" className="text-[#0c0c0c] hover:text-primary font-medium text-[15.5px] transition-colors">Company</a>
            <a href="#" className="text-[#0c0c0c] hover:text-primary font-medium text-[15.5px] transition-colors">Careers</a>
            <a href="#" className="text-[#0c0c0c] hover:text-primary font-medium text-[15.5px] transition-colors">FAQ</a>
            <a href="#" className="text-[#0c0c0c] hover:text-primary font-medium text-[15.5px] transition-colors">Contact Us</a>
          </motion.div>

        </motion.div>

        {/* Bottom Copyright & Socials Bar */}
        <motion.div 
          className="mt-28 flex flex-col md:flex-row items-center justify-between gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-[#888888] font-medium text-[14.5px]">
            © 2023 Finto. All right reserved
          </p>
          <div className="flex items-center gap-6">
            <a href="#" aria-label="LinkedIn" className="text-[#888888] hover:text-[#0c0c0c] transition-colors">
              <svg className="w-5.5 h-5.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a href="#" aria-label="Twitter" className="text-[#888888] hover:text-[#0c0c0c] transition-colors">
              <svg className="w-5.5 h-5.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
            <a href="#" aria-label="Facebook" className="text-[#888888] hover:text-[#0c0c0c] transition-colors">
              <svg className="w-5.5 h-5.5 fill-current" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
            </a>
          </div>
        </motion.div>

      </div>
    </footer>
  );
}
