import { motion } from 'framer-motion';

export default function MotionButton({ className = '', ...props }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 280, damping: 20 }}
      className={className}
      {...props}
    />
  );
}
