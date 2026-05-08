import React from 'react';
import { motion } from 'motion/react';
import { Stethoscope, ChevronRight } from 'lucide-react';
import { useAuth } from './AuthProvider';

export default function LandingPage() {
  const { enterAsGuestDoctor } = useAuth();
  
  return (
    <div className="min-h-screen bg-brand-surface text-brand-primary selection:bg-brand-secondary selection:text-white overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-accent/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-secondary/10 blur-[120px]" />
      </div>

      <nav className="relative z-10 flex justify-between items-center px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
            <Stethoscope className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-serif font-bold tracking-tight text-brand-primary">DocPortal</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="flex flex-col items-center text-center space-y-12 py-24">
          <div className="space-y-10 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-7xl lg:text-9xl font-serif font-medium leading-none tracking-tight text-brand-primary">
                Welcome <br />
                <span className="text-brand-secondary italic">Dr. Aryan Kumar</span>
              </h1>
              <p className="mt-8 text-xl text-brand-secondary/60 max-w-xl mx-auto font-medium">Your clinical workspace is ready. Access your patient records and secure communication channels.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <button
                onClick={enterAsGuestDoctor}
                className="group px-10 py-5 bg-brand-primary hover:bg-brand-secondary text-white rounded-full font-bold flex items-center gap-3 transition-all shadow-xl shadow-brand-primary/20"
              >
                Access Medical Workspace
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>


        </div>
      </main>

      {/* Footer removed per user request */}
    </div>
  );
}
