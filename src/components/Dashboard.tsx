import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  ClipboardList,
  Bell,
  Settings,
  LogOut,
  Search,
  Plus,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  User
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { languagesList, useLanguage } from './LanguageProvider';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Appointment, LabResult, Message } from '../types';

// Sub-components
import Overview from './Dashboard/Overview';
import PatientManagement from './Dashboard/PatientManagement';
import SecureMessaging from './Dashboard/SecureMessaging';
import DoctorProfile from './Dashboard/DoctorProfile';

export default function Dashboard() {
  const { profile, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'messages' | 'profile'>('patients');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t('goodMorning'));
    else if (hour < 18) setGreeting(t('goodAfternoon'));
    else setGreeting(t('goodEvening'));
  }, [t]);

  const navItems = [
    { id: 'overview', label: t('overview'), icon: LayoutDashboard },
    { id: 'patients', label: t('patients'), icon: Users },
    { id: 'messages', label: t('messages'), icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen bg-brand-surface text-brand-primary font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-brand-accent/10 flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <Activity className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-serif font-bold tracking-tight text-brand-primary">DocPortal</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/10'
                    : 'text-zinc-400 hover:bg-brand-surface hover:text-brand-primary'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-zinc-300 group-hover:text-brand-primary'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-brand-accent/10">
          <div 
            onClick={() => setActiveTab('profile')}
            className="group cursor-pointer bg-brand-surface rounded-2xl p-4 mb-4 border border-brand-accent/5 hover:border-brand-accent/20 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-secondary font-bold uppercase overflow-hidden">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile?.displayName?.[0] || 'D'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate group-hover:text-brand-secondary transition-colors">{t('dr')} {profile?.displayName}</p>
                <p className="text-[10px] uppercase font-bold text-brand-secondary tracking-widest truncate">{profile?.role}</p>
              </div>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-50 rounded-2xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-brand-accent/10 px-8 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => setActiveTab('profile')}
          >
            <h2 className="text-2xl font-serif font-bold text-brand-primary">
              {greeting}, <span className="text-brand-secondary italic group-hover:text-brand-accent transition-colors">{t('dr')} {profile?.displayName}</span>
            </h2>
            <div className="h-6 w-px bg-brand-accent/20" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              {new Date().toLocaleDateString(
                language === 'en' ? 'en-US' : 
                language === 'hi' ? 'hi-IN' : 
                language === 'bn' ? 'bn-IN' : 
                language === 'te' ? 'te-IN' : 
                language === 'mr' ? 'mr-IN' : 
                language === 'ta' ? 'ta-IN' : 
                language === 'gu' ? 'gu-IN' : 
                language === 'kn' ? 'kn-IN' : 
                language === 'ml' ? 'ml-IN' : 
                language === 'pa' ? 'pa-IN' : 'en-US', 
                { weekday: 'long', month: 'long', day: 'numeric' }
              )}
            </span>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="relative group/lang">
              <button className="flex items-center gap-2 px-4 py-2 bg-brand-surface border border-brand-accent/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:bg-brand-accent/5 transition-colors shadow-sm">
                <span className="w-5 h-5 flex items-center justify-center bg-brand-primary text-white rounded-full text-[8px]">
                  {language.toUpperCase()}
                </span>
                <span className="hidden md:inline">{languagesList.find(l => l.id === language)?.label}</span>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-brand-accent/10 rounded-2xl shadow-xl opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all z-50 p-2 max-h-64 overflow-y-auto custom-scrollbar shadow-brand-primary/5">
                {languagesList.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id as any)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                      language === lang.id 
                        ? 'bg-brand-primary text-white' 
                        : 'text-zinc-500 hover:bg-brand-surface hover:text-brand-primary'
                    }`}
                  >
                    {lang.label}
                    {language === lang.id && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
              <input
                type="text"
                placeholder={t('searchPatients')}
                className="pl-10 pr-4 py-2 bg-brand-surface border border-brand-accent/10 rounded-full text-sm w-48 focus:w-64 focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
              />
            </div>
            <button className="relative w-10 h-10 bg-brand-surface border border-brand-accent/10 rounded-full flex items-center justify-center hover:bg-brand-accent/5 transition-colors">
              <Bell className="w-5 h-5 text-zinc-400" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="p-8 max-w-[1600px] mx-auto w-full">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Overview />
                </motion.div>
              )}
              {activeTab === 'patients' && (
                <motion.div
                  key="patients"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <PatientManagement />
                </motion.div>
              )}
              {activeTab === 'messages' && (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <SecureMessaging />
                </motion.div>
              )}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <DoctorProfile />
                </motion.div>
              )}
            </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
