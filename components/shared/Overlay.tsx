import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface OverlayProps {
  isOpen: boolean; // Controls the visibility of the overlay
  onClose?: () => void; // Callback for closing the overlay
  children: React.ReactNode; // Content to display within the overlay
  className?: string; // Custom class names for the backdrop
  contentClassName?: string; // Custom class names for the content container
  variant?:
    | "fade"
    | "slideLeft"
    | "slideRight"
    | "slideUp"
    | "slideDown"
    | "rotate"
    | "zoomIn"
    | "flip"
    | "bounce"
    | "fadeInUp"
    | "expand"
    | "wobble"; // Additional creative animation variants
}

const animationVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideLeft: {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  slideRight: {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
  slideUp: {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  slideDown: {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "-100%", opacity: 0 },
  },
  zoomIn: {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  rotate: {
    initial: { rotate: -90, opacity: 0 },
    animate: { rotate: 0, opacity: 1 },
    exit: { rotate: 90, opacity: 0 },
  },
  flip: {
    initial: { rotateY: 180, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    duration: 0.9,
    exit: { rotateY: -180, opacity: 0 },
  },
  bounce: {
    initial: { y: "-30px", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "-30px", opacity: 0 },
  },
  fadeInUp: {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  expand: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
  },
  wobble: {
    initial: { x: "-10%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "10%", opacity: 0 },
  },
};

const Overlay: React.FC<OverlayProps> = ({
  isOpen,
  onClose,
  children,
  className,
  contentClassName,
  variant = "fade", // Default to fade if no variant is provided
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const currentVariant = animationVariants[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            "fixed inset-0 cursor-default backdrop-blur-xs bg-black bg-opacity-90 z-50 flex items-center justify-center",
            className
          )}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className={cn(
              "bg-white rounded-lg p-8 shadow-lg max-h-[90vh]  overflow-y-auto pointer-events-auto",
              contentClassName
            )}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            initial={currentVariant.initial}
            animate={currentVariant.animate}
            exit={currentVariant.exit}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Overlay;
