import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

import { easeOutExpo } from "@/lib/motion";

const VIEWPORT = { once: true, margin: "0px 0px -10% 0px" } as const;

interface RevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
}

/** Fade-up progressivo al primo ingresso nel viewport. */
export function Reveal({ delay = 0, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.9, ease: easeOutExpo, delay }}
      {...props}
    />
  );
}

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOutExpo } },
};

/** Lista con ingresso scaglionato degli elementi figli (`StaggerItem`). */
export function StaggerList(props: HTMLMotionProps<"ul">) {
  return (
    <motion.ul
      variants={listVariants}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      {...props}
    />
  );
}

export function StaggerItem(props: HTMLMotionProps<"li">) {
  return <motion.li variants={itemVariants} {...props} />;
}
