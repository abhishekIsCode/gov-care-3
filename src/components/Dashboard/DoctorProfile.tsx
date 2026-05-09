import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  Award, 
  BookOpen, 
  Stethoscope, 
  Building2, 
  ShieldCheck,
  Calendar,
  Clock,
  Camera,
  Users,
  TrendingUp,
  Activity,
  Heart
} from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { useLanguage, translateName } from '../LanguageProvider';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function DoctorProfile() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [patientCount, setPatientCount] = useState(128); // Placeholder base
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!profile) return;
      if (profile.uid === 'guest_doctor_aryan') {
        setPatientCount(142);
        setLoading(false);
        return;
      }
      // Real fetch if not guest
      try {
        const q = query(collection(db, 'medicalRecords'), where('doctorId', '==', profile.uid));
        const snap = await getDocs(q);
        // Simple heuristic: unique patients in records
        const uniquePatients = new Set(snap.docs.map(d => d.data().patientId));
        if (uniquePatients.size > 0) setPatientCount(uniquePatients.size);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [profile]);

  const doctorData = {
    speciality: 'Senior Cardiologist',
    credentials: 'MD, FACC, PhD',
    license: 'MED-7742-991',
    hospital: 'St. Mary\'s Clinical Center',
    address: '42 Medical Plaza, Innovation District, SF',
    bio: 'Specializing in interventional cardiology and advanced hemodynamic monitoring. Over 15 years of experience in managing high-risk cardiovascular patients and clinical research.',
    education: [
      { degree: 'Doctor of Medicine', school: 'Johns Hopkins School of Medicine' },
      { degree: 'Fellowship in Cardiology', school: 'Mayo Clinic' }
    ],
    experience: '15+ Years',
    phone: '+1 (555) 012-3456'
  };

  return (
    <div className="p-8 space-y-12 pb-20">
      {/* Header section with Stats Overlay */}
      <div className="relative">
        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[2.5rem] bg-brand-surface border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-brand-accent/20" />
              )}
            </div>
            <button className="absolute bottom-2 right-2 p-3 bg-brand-primary text-white rounded-2xl shadow-lg hover:bg-brand-secondary transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 pt-4">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-4xl font-serif font-extrabold text-brand-primary leading-tight">
                {t('dr')} {translateName(profile?.displayName, t) || 'Physician'}
              </h1>
              <span className="px-3 py-1 bg-brand-accent/10 text-brand-secondary rounded-full text-[10px] font-bold uppercase tracking-widest border border-brand-accent/10">
                {doctorData.license}
              </span>
            </div>
            <p className="text-lg text-brand-secondary/80 font-medium mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-accent" />
              {doctorData.speciality} • {doctorData.credentials}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-zinc-500 bg-white/50 p-4 rounded-2xl border border-brand-accent/5 backdrop-blur-sm">
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-medium">{doctorData.hospital}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-500 bg-white/50 p-4 rounded-2xl border border-brand-accent/5 backdrop-blur-sm">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">{profile?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workload Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[2.5rem] border border-brand-accent/10 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-20 h-20" />
          </div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">{t('totalActivePatients')}</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-4xl font-serif font-bold text-brand-primary">{patientCount}</h4>
            <span className="text-emerald-500 text-xs font-bold font-sans flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12%
            </span>
          </div>
          <p className="text-[10px] font-medium text-zinc-400 mt-2">{t('activeCasesUnderCare')}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-[2.5rem] border border-brand-accent/10 shadow-sm relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Calendar className="w-20 h-20" />
          </div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">{t('avgConsultations')}</p>
          <h4 className="text-4xl font-serif font-bold text-brand-primary">420</h4>
          <p className="text-[10px] font-medium text-zinc-400 mt-2">Consistent high-volume care</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-8 rounded-[2.5rem] border border-brand-accent/10 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="w-20 h-20" />
          </div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">{t('diagnosticAccuracy')}</p>
          <h4 className="text-4xl font-serif font-bold text-brand-primary">98.4%</h4>
          <p className="text-[10px] font-medium text-emerald-500 mt-2">Clinical Excellence Award</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-8 rounded-[2.5rem] border border-brand-accent/10 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Heart className="w-20 h-20" />
          </div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">{t('patientSatisfaction')}</p>
          <h4 className="text-4xl font-serif font-bold text-brand-primary">4.9<span className="text-lg">/5</span></h4>
          <p className="text-[10px] font-medium text-zinc-400 mt-2">Based on 1.2k regular reviews</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Bio & Info + Growth & Maintenance */}
        <div className="lg:col-span-2 space-y-8">
          {/* Growth & Maintenance / Performance Section */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-brand-accent/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-bl-[100%] z-0" />
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="p-3 bg-brand-surface rounded-2xl text-brand-primary">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-serif font-bold text-brand-primary">Growth, Maintenance & Logs</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {/* Logins and System Access */}
              <div className="bg-brand-surface p-6 rounded-3xl border border-brand-accent/5 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-white rounded-xl text-brand-primary shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-sans font-bold text-brand-primary">System Access</h4>
                </div>
                
                <div className="space-y-4 mt-auto">
                  <div className="flex justify-between items-center border-b border-white/50 pb-3">
                    <span className="text-sm font-medium text-zinc-500">Today's Logins</span>
                    <span className="text-sm font-bold text-brand-primary">4</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/50 pb-3">
                    <span className="text-sm font-medium text-zinc-500">Last Login Time</span>
                    <span className="text-sm font-bold text-emerald-600">08:30 AM</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/50 pb-3">
                    <span className="text-sm font-medium text-zinc-500">Last Logout Time</span>
                    <span className="text-sm font-bold text-rose-500">06:15 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-zinc-500">Total Hours (Week)</span>
                    <span className="text-sm font-bold text-brand-primary">42.5 hrs</span>
                  </div>
                </div>
              </div>

              {/* Maintenance & Quality */}
              <div className="bg-brand-surface p-6 rounded-3xl border border-brand-accent/5 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-white rounded-xl text-brand-primary shadow-sm">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h4 className="font-sans font-bold text-brand-primary">Performance</h4>
                </div>
                
                <div className="space-y-4 mt-auto">
                  <div className="flex justify-between items-center border-b border-white/50 pb-3">
                    <span className="text-sm font-medium text-zinc-500">Patient Retention</span>
                    <span className="text-sm font-bold text-emerald-600">94%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/50 pb-3">
                    <span className="text-sm font-medium text-zinc-500">Monthly Growth</span>
                    <span className="text-sm font-bold text-emerald-600">+8.2%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/50 pb-3">
                    <span className="text-sm font-medium text-zinc-500">Avg. Response Time</span>
                    <span className="text-sm font-bold text-brand-primary">12 mins</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-zinc-500">Profile Completion</span>
                    <div className="flex items-center gap-2">
                       <div className="w-16 h-2 bg-white rounded-full overflow-hidden">
                         <div className="w-full h-full bg-emerald-400 rounded-full" />
                       </div>
                       <span className="text-[10px] font-bold text-brand-primary">100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Workplace Info */}
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-brand-accent/10 shadow-sm">
            <h3 className="text-xl font-serif font-bold text-brand-primary mb-8">{t('workplaceInfo')}</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <MapPin className="w-5 h-5 text-brand-accent shrink-0" />
                <div>
                  <p className="text-sm font-bold text-brand-primary">Mailing Address</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{doctorData.address}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Phone className="w-5 h-5 text-brand-accent shrink-0" />
                <div>
                  <p className="text-sm font-bold text-brand-primary">Clinic Phone</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{doctorData.phone}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Clock className="w-5 h-5 text-brand-accent shrink-0" />
                <div>
                  <p className="text-sm font-bold text-brand-primary">Office Hours</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">Mon - Fri • 08:00 - 17:00</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-primary text-white p-8 rounded-[2.5rem] border border-brand-accent/10 shadow-lg shadow-brand-primary/10">
             <h4 className="font-serif font-bold mb-4">{t('weeklyPatientVolume')}</h4>
             <p className="text-xs text-brand-accent mb-6 leading-relaxed">Growth and maintenance review over the past 7 days across all consults.</p>
             <div className="h-40 flex items-end justify-between gap-1 mt-4">
                {[45, 60, 55, 75, 80, 20, 10].map((v, i) => (
                  <div key={i} className="flex-1 group relative flex flex-col justify-end h-full">
                    <div 
                      className="bg-white/20 group-hover:bg-brand-accent transition-all rounded-t-lg relative w-full" 
                      style={{ height: `${(v/80)*100}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-brand-primary text-[10px] font-bold py-1 px-2 rounded-md shadow-lg pointer-events-none transition-opacity">
                        {v} pts
                      </div>
                    </div>
                    <span className="text-center mt-3 text-[10px] font-bold opacity-50 block w-full">
                      {['M','T','W','T','F','S','S'][i]}
                    </span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
