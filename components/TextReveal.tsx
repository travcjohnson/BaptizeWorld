"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils"; // Assuming cn is in utils, I might need to create it

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  type?: "word" | "char";
}

export default function TextReveal({
  text,
  className,
  delay = 0,
  duration = 0.5,
  type = "word",
}: TextRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: delay * i },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
        duration: duration,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
        duration: duration,
      },
    },
  };

  const items = type === "word" ? text.split(" ") : text.split("");

  return (
    <motion.span
      ref={ref}
      style={{ display: "inline-block" }}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {items.map((item, index) => (
        <motion.span
          variants={child}
          style={{ display: "inline-block", marginRight: type === "word" ? "0.25em" : "0.05em" }}
          key={index}
        >
          {item}
        </motion.span>
      ))}
    </motion.span>
  );
}

