import React from 'react';
import { motion } from 'motion/react';
import { Leaf } from 'lucide-react';

const LeafItem = ({ delay, x, rotate }: { delay: number; x: string; rotate: number; key?: React.Key }) => (
  <motion.div
    initial={{ y: 20, opacity: 0, rotate: rotate }}
    animate={{ 
      y: [0, -20, 0],
      x: [0, 10, -10, 0],
      opacity: [0.1, 0.3, 0.1],
      rotate: [rotate - 10, rotate + 10, rotate - 10]
    }}
    transition={{
      duration: 6,
      delay: delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute bottom-0 text-brand-secondary/10"
    style={{ left: x }}
  >
    <Leaf size={48} strokeWidth={1} />
  </motion.div>
);

export default function FloatingLeaves() {
  const leaves = [
    { delay: 0, x: '5%', rotate: 15 },
    { delay: 1, x: '15%', rotate: -10 },
    { delay: 2, x: '25%', rotate: 45 },
    { delay: 0.5, x: '35%', rotate: -20 },
    { delay: 1.5, x: '45%', rotate: 30 },
    { delay: 3, x: '55%', rotate: -15 },
    { delay: 0.8, x: '65%', rotate: 25 },
    { delay: 2.2, x: '75%', rotate: -35 },
    { delay: 1.2, x: '85%', rotate: 40 },
    { delay: 2.5, x: '95%', rotate: -5 },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full h-32 pointer-events-none overflow-hidden z-0">
      {leaves.map((leaf, i) => (
        <LeafItem key={i} delay={leaf.delay} x={leaf.x} rotate={leaf.rotate} />
      ))}
    </div>
  );
}
