import { motion, type Variants } from "framer-motion";

export default function Testimonials() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 24 },
    },
  };

  const testimonialText =
    "“When I signed up with Lendwise it was a no-brainer. It's been one of the best decisions I've made to ensure my finances are on point”.";

  // Base cards mapping to the distinct faces in the dual-track screenshot
  const baseCardsRow1 = [
    {
      id: 1,
      name: "Alex Bergwijn",
      role: "Accounting at Mailchimp",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704b",
    }, // Black man
    {
      id: 2,
      name: "Alex Bergwijn",
      role: "Accounting at Mailchimp",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704c",
    }, // White man
    {
      id: 3,
      name: "Alex Bergwijn",
      role: "Accounting at Mailchimp",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    }, // White woman red hair
    {
      id: 4,
      name: "Alex Bergwijn",
      role: "Accounting at Mailchimp",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704e",
    }, // Extra
    {
      id: 5,
      name: "Alex Bergwijn",
      role: "Accounting at Mailchimp",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704f",
    }, // Extra
  ];

  const baseCardsRow2 = [
    {
      id: 6,
      name: "Alex Bergwijn",
      role: "Accounting at Mailchimp",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    },
    {
      id: 7,
      name: "Alex Bergwijn",
      role: "Accounting at Mailchimp",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704b",
    },
    {
      id: 8,
      name: "Alex Bergwijn",
      role: "Accounting at Mailchimp",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704c",
    },
    {
      id: 9,
      name: "Alex Bergwijn",
      role: "Accounting at Mailchimp",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704e",
    },
    {
      id: 10,
      name: "Alex Bergwijn",
      role: "Accounting at Mailchimp",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704f",
    },
  ];

  // Duplicated for the seamless infinite scroll (10 items total per row natively)
  const infiniteCardsRow1 = [...baseCardsRow1, ...baseCardsRow1];
  const infiniteCardsRow2 = [...baseCardsRow2, ...baseCardsRow2];

  // Using strict standard CSS bounds (w-95 + mr-8 = Total Stride 412px)
  // Mask is strictly bound to 15% fading
  return (
    <section
      id="testimonials"
      className="bg-white relative overflow-hidden font-sans border-t border-black/5"
    >
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

      <div className="w-full relative z-10 py-12 lg:py-16 flex flex-col items-start overflow-hidden">
        {/* Header Block */}
        <motion.div
          className="flex flex-col mb-12 lg:mb-16 w-full px-[5%] md:px-[7%]"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.span
            variants={itemVariants}
            className="text-gray-400 font-semibold text-[15px] mb-4"
          >
            Testimonial
          </motion.span>
          <motion.h2
            variants={itemVariants}
            className="text-3xl lg:text-4xl font-bold text-[#0c0c0c] leading-[1.05] tracking-tight whitespace-nowrap"
          >
            What Customer Says
          </motion.h2>
        </motion.div>

        {/* Desktop Dual-Track Infinite Marquee (Masked Edges) */}
        <div
          className="w-full relative hidden lg:block overflow-hidden pb-10 pt-4"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          }}
        >
          {/* Top Row */}
          <motion.div
            className="flex w-max mb-8"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 35, repeat: Infinity }}
          >
            {infiniteCardsRow1.map((card, index) => (
              <div
                key={`top-${card.id}-${index}`}
                className="w-95 shrink-0 mr-8 bg-white border border-black/5 p-8 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-65"
              >
                <p className="text-gray-400 text-sm md:text-base leading-[1.65] font-medium mb-10 w-full">
                  {testimonialText}
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={card.avatar}
                      alt={card.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#0c0c0c] text-sm tracking-tight">
                      {card.name}
                    </span>
                    <span className="text-gray-400 text-xs font-medium">
                      {card.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Bottom Row - Staggered via negative margin-left and animated leftward or rightward. Leftward matches smooth parallax. */}
          <motion.div
            className="flex w-max -ml-51.5"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 35, repeat: Infinity }}
          >
            {infiniteCardsRow2.map((card, index) => (
              <div
                key={`bottom-${card.id}-${index}`}
                className="w-95 shrink-0 mr-8 bg-white border border-black/5 p-8 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-65"
              >
                <p className="text-gray-400 text-sm md:text-base leading-[1.65] font-medium mb-10 w-full">
                  {testimonialText}
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={card.avatar}
                      alt={card.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#0c0c0c] text-sm tracking-tight">
                      {card.name}
                    </span>
                    <span className="text-gray-400 text-xs font-medium">
                      {card.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Mobile/Tablet Static Stack (No Masking) */}
        <div className="w-full px-[5%] md:px-[7%] lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {baseCardsRow1.slice(0, 3).map((card) => (
            <div
              key={card.id}
              className="w-full bg-white border border-black/5 p-8 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between"
            >
              <p className="text-gray-400 text-sm md:text-base leading-[1.65] font-medium mb-10">
                {testimonialText}
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={card.avatar}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[#0c0c0c] text-sm tracking-tight">
                    {card.name}
                  </span>
                  <span className="text-gray-400 text-xs font-medium">
                    {card.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
