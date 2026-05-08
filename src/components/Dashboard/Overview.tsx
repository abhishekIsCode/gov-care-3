import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Search,
  Plus,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  MoreVertical,
  FlaskConical,
  Flame
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, limit, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../AuthProvider';
import { useLanguage } from '../LanguageProvider';
import { Appointment, LabResult, AppointmentSeverity } from '../../types';

export default function Overview() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, pending: 0 });

  useEffect(() => {
// ...
    if (!profile) return;

    if (profile.uid === 'guest_doctor_aryan') {
      const mockAppts: Appointment[] = [
        { id: 'a1', patientId: 'p1', patientName: 'Elena Gilbert', doctorId: profile.uid, date: Date.now() + 1800000, status: 'pending', severity: 'Emergency', reason: 'Post-surgical acute pain management' },
        { id: 'a2', patientId: 'p2', patientName: 'Stefan Salvatore', doctorId: profile.uid, date: Date.now() + 7200000, status: 'confirmed', severity: 'Critical', reason: 'Dialysis monitoring required' },
        { id: 'a3', patientId: 'p3', patientName: 'Damon Salvatore', doctorId: profile.uid, date: Date.now() + 14400000, status: 'confirmed', severity: 'Normal', reason: 'Routine orthopedic checkup' },
      ];
      setAppointments(mockAppts);
      setStats({
        total: 3,
        critical: 2,
        pending: 1
      });
      
      return;
    }

    // Real-time Priority Queue
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', profile.uid),
      where('status', 'in', ['pending', 'confirmed']),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      // Sort by Severity manually as firestore limits complex sorts without indexes
      const severityMap = { Emergency: 0, Critical: 1, Normal: 2 };
      const sorted = [...data].sort((a, b) => severityMap[a.severity] - severityMap[b.severity]);
      setAppointments(sorted);

      setStats({
        total: data.length,
        critical: data.filter(a => a.severity === 'Critical' || a.severity === 'Emergency').length,
        pending: data.filter(a => a.status === 'pending').length
      });
    });

    return () => {
      unsubscribe();
    }
  }, [profile]);

  const severityColors = {
    Emergency: 'bg-red-50 text-red-700 border-red-100',
    Critical: 'bg-orange-50 text-orange-700 border-orange-100',
    Normal: 'bg-brand-accent/20 text-brand-secondary border-brand-accent/30'
  };

  const handleAddMockAppt = async (severity: AppointmentSeverity) => {
    if (!profile) return;
    
    if (profile.uid === 'guest_doctor_aryan') {
      const newAppt: Appointment = {
        id: 'a' + Date.now(),
        patientId: 'demo-patient',
        patientName: 'Jane Doe',
        doctorId: profile.uid,
        date: Date.now() + 3600000,
        status: 'pending',
        severity,
        reason: severity === 'Emergency' ? 'acute respiratory distress' : 'routine follow up'
      };
      setAppointments([newAppt, ...appointments]);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        critical: (severity === 'Emergency' || severity === 'Critical') ? prev.critical + 1 : prev.critical,
        pending: prev.pending + 1
      }));
      return;
    }

    try {
      await addDoc(collection(db, 'appointments'), {
        patientId: 'demo-patient',
        patientName: 'Jane Doe',
        doctorId: profile.uid,
        date: Date.now() + 3600000,
        status: 'pending',
        severity,
        reason: severity === 'Emergency' ? 'acute respiratory distress' : 'routine follow up'
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-12">
      {/* Welcome Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-brand-primary rounded-[3rem] p-12 text-white shadow-2xl shadow-brand-primary/20"
      >
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-5xl font-serif font-medium mb-4 leading-tight">
            {t('welcomeBack')}, <br />
            <span className="italic text-brand-accent">{t('dr')} {profile?.displayName}</span>
          </h1>
          <p className="text-brand-accent/80 text-lg font-medium leading-relaxed">
            {t('scheduledForToday').replace('today', stats.total.toString())} {stats.critical > 0 ? `${stats.critical} ${t('casesRequireAttention')}` : t('allSystemsNormal')}
          </p>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl transition-transform hover:scale-110 duration-1000" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-secondary/20 rounded-full translate-y-1/2 blur-2xl" />
      </motion.div>

      {/* Demo Controls */}
      <div className="flex gap-4 mb-4">
        <button onClick={() => handleAddMockAppt('Emergency')} className="px-4 py-1.5 bg-red-400 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 transition-colors">{t('simulateEmergency')}</button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t('todayAppointments'), val: stats.total, sub: t('scheduled'), icon: Calendar, color: 'text-brand-primary', bg: 'bg-brand-accent/20' },
          { label: t('criticalCases'), val: stats.critical, sub: t('actionRequired'), icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: t('pendingReviews'), val: stats.pending, sub: t('inPipeline'), icon: Clock, color: 'text-zinc-600', bg: 'bg-zinc-100' },
          { label: t('patientSatisfaction'), val: '98%', sub: '+2.4% vs last mo', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-brand-accent/10 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <MoreVertical className="w-5 h-5 text-zinc-300" />
            </div>
            <p className="text-3xl font-serif font-bold mb-1 tracking-tight">{stat.val}</p>
            <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">{stat.label}</p>
            <div className="mt-4 pt-4 border-t border-brand-accent/5 flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
               <span className="text-[10px] uppercase tracking-wider font-bold text-brand-secondary/60">{stat.sub}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Priority-Sorted Queue */}
        <div className="bg-white rounded-[2.5rem] border border-brand-accent/10 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-brand-accent/5 flex items-center justify-between bg-zinc-50/30">
            <div>
              <h3 className="text-lg font-serif font-bold text-brand-primary">{t('priorityQueue')}</h3>
              <p className="text-[10px] uppercase font-bold text-brand-secondary tracking-widest">{t('automatedSorting')}</p>
            </div>
            <button className="px-6 py-2 bg-brand-primary text-white rounded-full text-xs font-bold flex items-center gap-2 hover:bg-brand-secondary transition-colors">
              <Plus className="w-4 h-4" /> {t('newAdmission')}
            </button>
          </div>

          <div className="divide-y divide-brand-accent/5">
            {appointments.length === 0 ? (
              <div className="p-12 text-center text-zinc-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-10" />
                {t('noPendingCases')}
              </div>
            ) : (
              appointments.map((appt, i) => (
                <div key={appt.id} className="px-8 py-6 hover:bg-brand-surface transition-colors flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center font-bold text-brand-secondary text-lg uppercase transition-all group-hover:bg-white group-hover:shadow-md">
                    {appt.patientName ? appt.patientName[0] : 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-brand-primary group-hover:text-brand-secondary transition-colors">{appt.patientName || 'Unknown Patient'}</h4>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${severityColors[appt.severity]}`}>
                        {appt.severity}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 italic leading-relaxed">{appt.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-primary">
                        {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[10px] font-bold uppercase text-zinc-300">Scheduled</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
