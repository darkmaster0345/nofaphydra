import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { FursanLogo } from "./FursanLogo";

interface PageTransitionProps {
    children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1] // Native Material easing
                }}
                className="relative min-h-screen flex flex-col"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
