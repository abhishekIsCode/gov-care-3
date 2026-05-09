import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  User,
  Plus,
  ArrowLeft,
  Calendar,
  FileText,
  Activity,
  Phone,
  UserPlus,
  Mail,
  History,
  Pill,
  ChevronRight,
  Save,
  Clock,
  FlaskConical,
  AlertCircle,
  MessageSquare,
  Wand2
} from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../AuthProvider';
import { useLanguage, translateName } from '../LanguageProvider';
import { UserProfile, MedicalRecord, Prescription, Appointment, LabResult } from '../../types';
import { AppointmentSeverity } from '../../types';

import SecureMessaging from './SecureMessaging';

export default function PatientManagement() {
  const { profile } = useAuth();
  const { t, language, locale } = useLanguage();
  const [patients, setPatients] = useState<UserProfile[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'list' | 'profile'>('list');

  useEffect(() => {
    if (!profile) return;
    
    if (profile.uid === 'guest_doctor_aryan') {
      // Mock patients for demo doctor
      const mockPatients: UserProfile[] = [
        { uid: 'p1', displayName: 'Elena Gilbert', email: 'elena@example.com', role: 'patient', currentSeverity: 'Emergency', createdAt: Date.now() },
        { uid: 'p2', displayName: 'Stefan Salvatore', email: 'stefan@example.com', role: 'patient', currentSeverity: 'Critical', createdAt: Date.now() },
        { uid: 'p3', displayName: 'Damon Salvatore', email: 'damon@example.com', role: 'patient', currentSeverity: 'normal', createdAt: Date.now() },
        { uid: 'p4', displayName: 'Bonnie Bennett', email: 'bonnie@example.com', role: 'patient', currentSeverity: 'normal', createdAt: Date.now() },
      ];
      setPatients(mockPatients);
      return;
    }

    // Listen for patients assigned to this doctor
    const q = query(
      collection(db, 'users'), 
      where('role', '==', 'patient'),
      where('assignedDoctorId', '==', profile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile));
      const severityMap = { Emergency: 0, Critical: 1, Normal: 2 };
      const sorted = [...data].sort((a, b) => {
        const sA = a.currentSeverity ? severityMap[a.currentSeverity] : 3;
        const sB = b.currentSeverity ? severityMap[b.currentSeverity] : 3;
        return sA - sB;
      });
      setPatients(sorted);
    });
    return () => unsubscribe();
  }, [profile]);

  const handleClaimPatients = async () => {
    if (!profile) return;
    
    if (profile.uid === 'guest_doctor_aryan') {
      // For guest demo, just "sync" by showing a success state or doing nothing
      console.log("Demographic synchronization complete. Assigned subjects are up to date.");
      return;
    }

    const q = query(collection(db, 'users'), where('role', '==', 'patient'), limit(20));
    const snap = await getDocs(q);
    const severities: AppointmentSeverity[] = ['Emergency', 'Critical', 'normal'];
    for (let i = 0; i < snap.docs.length; i++) {
      const d = snap.docs[i];
      await updateDoc(doc(db, 'users', d.id), {
        assignedDoctorId: profile.uid,
        currentSeverity: severities[i % 3]
      });
    }
  };

  const severityStyles = {
    Emergency: 'bg-red-50 text-red-700 border-red-100',
    Critical: 'bg-orange-50 text-orange-700 border-orange-100',
    Normal: 'bg-brand-accent/20 text-brand-secondary border-brand-accent/30'
  };

  const filteredPatients = patients.filter(p =>
    p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full">
      <AnimatePresence mode="wait">
        {activeView === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-brand-accent/10 shadow-sm">
               <div>
                  <h3 className="text-xl font-serif font-bold text-brand-primary">{t('patientDirectory')}</h3>
                  <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">{t('registryOf')} {patients.length} {t('assignedSubjects')}</p>
               </div>
               <div className="flex items-center gap-4">
                  <button 
                    onClick={handleClaimPatients}
                    className="px-6 py-2.5 bg-brand-surface text-brand-secondary rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-brand-accent/20 transition-all border border-brand-accent/10 flex items-center gap-2"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> {t('syncAdminAssignments')}
                  </button>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                    <input
                      type="text"
                      placeholder={t('searchPatients')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-brand-surface border border-brand-accent/10 rounded-full text-sm focus:outline-none focus:ring-4 focus:ring-brand-primary/5"
                    />
                  </div>
               </div>
            </div>

            <div className="space-y-12">
              {(['Emergency', 'Critical', 'normal'] as const).map((severity) => {
                const groupPatients = filteredPatients.filter(p => p.currentSeverity === severity);
                if (groupPatients.length === 0) return null;

                return (
                  <div key={severity} className="space-y-4">
                    <div className="flex items-center gap-3 px-4">
                      <div className={`w-2 h-2 rounded-full ${
                        severity === 'Emergency' ? 'bg-red-500 animate-pulse' : 
                        severity === 'Critical' ? 'bg-orange-500' : 'bg-emerald-500'
                      }`} />
                      <h4 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">
                        {t(`${severity.toLowerCase()}Cases`)} <span className="ml-2 text-zinc-300 font-bold">({groupPatients.length})</span>
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {groupPatients.map((patient, i) => (
                        <motion.div
                          key={patient.uid}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => {
                            setSelectedPatient(patient);
                            setActiveView('profile');
                          }}
                          className="bg-white p-8 rounded-[2rem] border border-brand-accent/10 shadow-sm hover:shadow-xl hover:shadow-brand-primary/5 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-[1.25rem] bg-brand-surface border border-brand-accent/5 flex items-center justify-center text-xl font-bold text-brand-secondary uppercase group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                              {translateName(patient.displayName, t)[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-brand-primary truncate">{translateName(patient.displayName, t)}</h4>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${severityStyles[severity]}`}>
                                  {t(severity.toLowerCase())}
                                </span>
                              </div>
                              <p className="text-[10px] uppercase font-bold text-zinc-300 truncate tracking-tight">{patient.email}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-zinc-200 group-hover:text-brand-secondary group-hover:translate-x-1 transition-all" />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-brand-surface/50 p-4 rounded-2xl border border-brand-accent/5">
                              <p className="text-[10px] uppercase font-bold text-zinc-300 mb-1">{t('bloodType')}</p>
                              <p className="text-sm font-bold text-brand-primary">{t('mockBloodType')}</p>
                            </div>
                            <div className="bg-brand-surface/50 p-4 rounded-2xl border border-brand-accent/5">
                              <p className="text-[10px] uppercase font-bold text-zinc-300 mb-1">{t('lastVisit')}</p>
                              <p className="text-sm font-bold text-brand-primary">
                                {new Date(2023, 9, 12).toLocaleDateString(locale, { year: '2-digit', month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {filteredPatients.length === 0 && (
                <div className="bg-white rounded-[2.5rem] border border-brand-accent/10 p-20 text-center">
                  <User className="w-16 h-16 mx-auto mb-6 text-zinc-100" />
                  <h3 className="text-xl font-serif font-bold text-brand-primary mb-2">{t('noPatientsAssigned')}</h3>
                  <p className="text-sm text-zinc-400 max-w-xs mx-auto italic font-medium">{t('noSubjectsAssigned')}</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="pb-20"
          >
           <PatientProfile patient={selectedPatient!} onBack={() => setActiveView('list')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PatientProfile({ patient, onBack }: { patient: UserProfile; onBack: () => void }) {
  const { profile } = useAuth();
  const { t, locale } = useLanguage();
  const [activeTab, setActiveTab ] = useState<'records' | 'prescribe' | 'labs' | 'appointments' | 'consult'>('records');
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isAddingPrescription, setIsAddingPrescription] = useState(false);
  const [isOrderingLab, setIsOrderingLab] = useState(false);

  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newNotes, setNewNotes] = useState('');
  
  const [newMed, setNewMed] = useState('');
  const [newDose, setNewDose] = useState('');
  const [newDuration, setNewDuration] = useState('');

  const [newTest, setNewTest] = useState('');
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);

  const generateSOAPNote = async () => {
    if (!newNotes.trim()) return;
    setIsGeneratingNote(true);
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Expand the following clinical shorthand into a fully-structured, professional SOAP (Subjective, Objective, Assessment, and Plan) note. Use proper medical terminology and format it clearly:\n\nShorthand: ${newNotes}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      if (response.text) {
        setNewNotes(response.text);
      }
    } catch (error) {
      console.error('Failed to generate SOAP note:', error);
    } finally {
      setIsGeneratingNote(false);
    }
  };

  useEffect(() => {
    if (!patient) return;

    if (profile?.uid === 'guest_doctor_aryan') {
      // Mock data for guest patient profile
      setRecords([
        { id: 'r1', patientId: patient.uid, doctorId: profile.uid, diagnosis: 'hypertensionStage1', notes: 'hypertensionNotes', date: Date.now() - 86400000 },
        { id: 'r2', patientId: patient.uid, doctorId: profile.uid, diagnosis: 'seasonalAllergies', notes: 'allergiesNotes', date: Date.now() - 604800000 }
      ]);
      setPrescriptions([
        { id: 'pr1', patientId: patient.uid, doctorId: profile.uid, medication: 'lisinopril', dosage: '10mg', duration: 'thirtyDays', date: Date.now() - 86400000 },
        { id: 'pr2', patientId: patient.uid, doctorId: profile.uid, medication: 'loratadine', dosage: '10mg', duration: 'asNeeded', date: Date.now() - 604800000 }
      ]);
      setLabOrders([
        { id: 'lo1', patientId: patient.uid, doctorId: profile.uid, testName: 'lipidPanel', status: 'completedStatus', date: Date.now() - 172800000 },
        { id: 'lo2', patientId: patient.uid, doctorId: profile.uid, testName: 'metabolicScreening', status: 'orderedStatus', date: Date.now() }
      ]);
      setLabResults([
        { id: 'lr1', patientId: patient.uid, testName: 'totalCholesterol', resultValue: '210', unit: 'mg/dL', status: 'abnormalStatus', date: Date.now() - 172800000 },
        { id: 'lr2', patientId: patient.uid, testName: 'HDL', resultValue: '45', unit: 'mg/dL', status: 'normal', date: Date.now() - 172800000 },
        { id: 'lr3', patientId: patient.uid, testName: 'LDL', resultValue: '142', unit: 'mg/dL', status: 'abnormalStatus', date: Date.now() - 172800000 }
      ]);
      setAppointments([
        { id: 'ap1', patientId: patient.uid, doctorId: profile.uid, date: Date.now() + 259200000, status: 'confirmed', severity: 'normal', reason: 'followUpConsultation' }
      ]);
      return;
    }

    const unsubRecords = onSnapshot(
      query(collection(db, 'medicalRecords'), where('patientId', '==', patient.uid), orderBy('date', 'desc')),
      (snap) => setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() } as MedicalRecord)))
    );

    const unsubPrescriptions = onSnapshot(
      query(collection(db, 'prescriptions'), where('patientId', '==', patient.uid), orderBy('date', 'desc')),
      (snap) => setPrescriptions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Prescription)))
    );

    const unsubLabs = onSnapshot(
      query(collection(db, 'labOrders'), where('patientId', '==', patient.uid), orderBy('date', 'desc')),
      (snap) => setLabOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const unsubLabResults = onSnapshot(
      query(collection(db, 'labResults'), where('patientId', '==', patient.uid), orderBy('date', 'desc')),
      (snap) => setLabResults(snap.docs.map(d => ({ id: d.id, ...d.data() } as LabResult)))
    );

    const unsubAppts = onSnapshot(
      query(collection(db, 'appointments'), where('patientId', '==', patient.uid), orderBy('date', 'asc')),
      (snap) => setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)))
    );

    return () => {
      unsubRecords();
      unsubPrescriptions();
      unsubLabs();
      unsubLabResults();
      unsubAppts();
    };
  }, [patient]);

  const handleAddRecord = async () => {
    if (!profile || !newDiagnosis) return;
    
    if (profile.uid === 'guest_doctor_aryan') {
      const newRec: MedicalRecord = {
        id: 'r' + Date.now(),
        patientId: patient.uid,
        doctorId: profile.uid,
        diagnosis: newDiagnosis,
        notes: newNotes,
        date: Date.now()
      };
      setRecords([newRec, ...records]);
      setNewDiagnosis('');
      setNewNotes('');
      setIsAddingRecord(false);
      return;
    }

    await addDoc(collection(db, 'medicalRecords'), {
      patientId: patient.uid,
      doctorId: profile.uid,
      diagnosis: newDiagnosis,
      notes: newNotes,
      date: Date.now()
    });
    setNewDiagnosis('');
    setNewNotes('');
    setIsAddingRecord(false);
  };

  const handleAddPrescription = async () => {
    if (!profile || !newMed) return;

    if (profile.uid === 'guest_doctor_aryan') {
       const newP: Prescription = {
         id: 'pr' + Date.now(),
         patientId: patient.uid,
         doctorId: profile.uid,
         medication: newMed,
         dosage: newDose,
         duration: newDuration,
         date: Date.now()
       };
       setPrescriptions([newP, ...prescriptions]);
       setNewMed('');
       setNewDose('');
       setNewDuration('');
       setIsAddingPrescription(false);
       return;
    }

    await addDoc(collection(db, 'prescriptions'), {
      patientId: patient.uid,
      doctorId: profile.uid,
      medication: newMed,
      dosage: newDose,
      duration: newDuration,
      date: Date.now()
    });
    setNewMed('');
    setNewDose('');
    setNewDuration('');
    setIsAddingPrescription(false);
  };

  const handleOrderLab = async () => {
    if (!profile || !newTest) return;

    if (profile.uid === 'guest_doctor_aryan') {
      const newL = {
        id: 'lo' + Date.now(),
        patientId: patient.uid,
        doctorId: profile.uid,
        testName: newTest,
        status: 'orderedStatus',
        date: Date.now()
      };
      setLabOrders([newL, ...labOrders]);
      setNewTest('');
      setIsOrderingLab(false);
      return;
    }

    await addDoc(collection(db, 'labOrders'), {
      patientId: patient.uid,
      doctorId: profile.uid,
      testName: newTest,
      status: 'orderedStatus',
      date: Date.now()
    });
    setNewTest('');
    setIsOrderingLab(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-brand-accent/10 shadow-sm">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center hover:bg-brand-surface rounded-full transition-all border border-brand-accent/10">
          <ArrowLeft className="w-5 h-5 text-brand-primary" />
        </button>
        <div className="w-14 h-14 rounded-2xl bg-brand-accent/20 flex items-center justify-center text-brand-primary font-bold text-xl uppercase">
          {translateName(patient.displayName, t)[0]}
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-brand-primary">{translateName(patient.displayName, t)}</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t('electronicHealthRecord')} • ID: #{patient.uid.slice(-6)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.8fr] gap-8 items-start">
        {/* Left Col: Patient Info */}
        <div className="space-y-6 sticky top-24">
          <div className="bg-white p-8 rounded-[2.5rem] border border-brand-accent/10 space-y-8 shadow-sm">
            <div>
              <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-300 mb-6 border-b border-brand-accent/5 pb-2">{t('demographics')}</h4>
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-brand-secondary" />
                    <span className="text-sm font-bold text-brand-primary">{patient.email}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-brand-secondary" />
                    <span className="text-sm font-bold text-brand-primary">{patient.phone || '+1 (555) 001-2042'}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-bold text-red-500">{t('contactLabel')} {patient.emergencyContact || t('familyGuardian')}</span>
                 </div>
              </div>
            </div>

            <div className="pt-2">
               <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-300 mb-6 border-b border-brand-accent/5 pb-2">{t('biometrics')}</h4>
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-brand-surface p-4 rounded-2xl border border-brand-accent/5">
                    <span className="block text-[8px] font-black text-zinc-400 uppercase mb-1">{t('heartRate')}</span>
                    <span className="text-lg font-serif font-bold text-brand-primary">72<span className="text-[10px] ml-1 font-sans text-brand-secondary">BPM</span></span>
                 </div>
                 <div className="bg-brand-surface p-4 rounded-2xl border border-brand-accent/5">
                    <span className="block text-[8px] font-black text-zinc-400 uppercase mb-1">{t('bloodPressure')}</span>
                    <span className="text-lg font-serif font-bold text-brand-primary">120/80</span>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Col: Management View */}
        <div className="bg-white rounded-[3rem] border border-brand-accent/10 overflow-hidden shadow-sm">
          <div className="border-b border-brand-accent/5 flex p-3 gap-1 bg-zinc-50/50">
            {[
              { id: 'records', label: t('clinicalNotes'), icon: History },
              { id: 'prescribe', label: t('pharmacy'), icon: Pill },
              { id: 'labs', label: t('diagnosticReports'), icon: FlaskConical },
              { id: 'appointments', label: t('scheduling'), icon: Calendar },
              { id: 'consult', label: t('secureConsult'), icon: MessageSquare },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-[1.5rem] text-xs font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/10' 
                    : 'text-zinc-400 hover:text-brand-primary hover:bg-brand-surface'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-10">
            <AnimatePresence mode="wait">
              {activeTab === 'records' && (
                <motion.div key="records" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="flex justify-between items-center bg-brand-surface/50 p-6 rounded-3xl border border-brand-accent/5">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-brand-primary">{t('clinicalProgressNotes')}</h3>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('formalMedicalRecords')}</p>
                    </div>
                    <button
                      onClick={() => setIsAddingRecord(!isAddingRecord)}
                      className="px-6 py-2.5 bg-brand-primary text-white rounded-full text-xs font-bold hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/10"
                    >
                      {isAddingRecord ? t('collapse') : t('addDiagnosis')}
                    </button>
                  </div>

                  {isAddingRecord && (
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 bg-brand-surface rounded-[2rem] border border-brand-accent/10 space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                         <div>
                            <label className="block text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">{t('primaryImpression')}</label>
                            <input
                              type="text"
                              value={newDiagnosis}
                              onChange={(e) => setNewDiagnosis(e.target.value)}
                              className="w-full px-6 py-3 rounded-2xl border border-brand-accent/10 bg-white focus:outline-none focus:ring-4 focus:ring-brand-primary/5 font-bold text-brand-primary placeholder:text-zinc-200"
                              placeholder="e.g. Acute Respiratory Distress"
                            />
                         </div>
                         <div>
                            <div className="flex items-center justify-between mb-2">
                               <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-widest">{t('clinicalObservationDetails')}</label>
                               <button
                                 onClick={generateSOAPNote}
                                 disabled={isGeneratingNote || !newNotes.trim()}
                                 className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                               >
                                  <Wand2 className={`w-3.5 h-3.5 ${isGeneratingNote ? 'animate-spin' : ''}`} />
                                  {isGeneratingNote ? t('generating') : t('automateNote')}
                               </button>
                            </div>
                            <textarea
                              value={newNotes}
                              onChange={(e) => setNewNotes(e.target.value)}
                              className="w-full px-6 py-4 rounded-[2rem] border border-brand-accent/10 bg-white h-40 focus:outline-none focus:ring-4 focus:ring-brand-primary/5 font-medium text-brand-primary leading-relaxed placeholder:text-zinc-200"
                              placeholder="Detailed clinical findings..."
                            />
                         </div>
                         <button
                          onClick={handleAddRecord}
                          className="w-full bg-brand-primary text-white py-4 rounded-full font-bold flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20 hover:bg-brand-secondary transition-all"
                         >
                            <Save className="w-5 h-5" /> Commit to Data Registry
                         </button>
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-8">
                    {records.map((record, i) => (
                      <div key={record.id} className="relative pl-10 before:absolute before:left-0 before:top-4 before:bottom-0 before:w-px before:bg-brand-accent/10">
                        <div className="absolute left-[-5px] top-4 w-2.5 h-2.5 rounded-full bg-brand-primary ring-8 ring-brand-surface" />
                        <div className="bg-brand-surface p-8 rounded-[2rem] border border-brand-accent/5 shadow-sm group hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-6">
                             <div>
                               <h4 className="text-xl font-serif font-bold text-brand-primary mb-1">{t(record.diagnosis)}</h4>
                               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('assessmentRecord')}</p>
                             </div>
                             <span className="text-[10px] bg-white px-3 py-1.5 rounded-full border border-brand-accent/10 text-brand-secondary font-black uppercase tracking-widest shadow-sm">
                                {new Date(record.date).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                             </span>
                          </div>
                          <p className="text-sm text-brand-primary/70 leading-relaxed font-medium italic">{t(record.notes)}</p>
                          <div className="mt-8 pt-6 border-t border-brand-accent/5 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-[10px] font-black text-white">{t('dr').replace('.', '')}</div>
                                <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">{t('verifiedByMedicalStaff')}</span>
                             </div>
                             <button className="text-[10px] font-black uppercase text-brand-secondary/40 hover:text-brand-secondary transition-colors">{t('exportRecord')}</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {records.length === 0 && !isAddingRecord && (
                      <div className="text-center py-20 bg-brand-surface rounded-[3rem] border border-dashed border-brand-accent/20">
                        <FileText className="w-16 h-16 mx-auto mb-6 text-brand-accent/30" />
                        <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest italic">{t('noFormalRecords')}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'prescribe' && (
                <motion.div key="prescribe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="flex justify-between items-center bg-brand-surface/50 p-6 rounded-3xl border border-brand-accent/5">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-brand-primary">{t('activePrescriptions')}</h3>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('currentMedicationRegimen')}</p>
                    </div>
                    <button 
                      onClick={() => setIsAddingPrescription(!isAddingPrescription)}
                      className="px-6 py-2.5 bg-brand-primary text-white rounded-full text-xs font-bold shadow-lg shadow-brand-primary/10 hover:bg-brand-secondary transition-all"
                    >
                      {isAddingPrescription ? 'Cancel' : t('newPrescription')}
                    </button>
                  </div>

                  {isAddingPrescription && (
                    <motion.div className="p-8 bg-brand-surface rounded-[2rem] border border-brand-accent/10 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">{t('medication')}</label>
                          <input
                            type="text"
                            value={newMed}
                            onChange={(e) => setNewMed(e.target.value)}
                            className="w-full px-6 py-3 rounded-2xl border border-brand-accent/10 focus:ring-4 focus:ring-brand-primary/5 outline-none font-bold text-brand-primary"
                            placeholder="e.g. Amoxicillin"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">{t('dosage')}</label>
                          <input
                            type="text"
                            value={newDose}
                            onChange={(e) => setNewDose(e.target.value)}
                            className="w-full px-6 py-3 rounded-2xl border border-brand-accent/10 focus:ring-4 focus:ring-brand-primary/5 outline-none font-bold text-brand-primary"
                            placeholder="e.g. 500mg"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">{t('duration')}</label>
                          <input
                            type="text"
                            value={newDuration}
                            onChange={(e) => setNewDuration(e.target.value)}
                            className="w-full px-6 py-3 rounded-2xl border border-brand-accent/10 focus:ring-4 focus:ring-brand-primary/5 outline-none font-bold text-brand-primary"
                            placeholder="e.g. 7 Days"
                          />
                        </div>
                        <button 
                          onClick={handleAddPrescription}
                          className="md:col-span-2 w-full py-4 bg-brand-primary text-white rounded-full font-bold shadow-xl shadow-brand-primary/10 hover:bg-brand-secondary transition-all"
                        >
                          {t('issuePrescription')}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {prescriptions.map((p, i) => (
                      <div key={p.id} className="p-8 bg-brand-surface border border-brand-accent/5 rounded-[2.5rem] flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                        <div>
                           <div className="flex justify-between items-start mb-4">
                             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-secondary border border-brand-accent/10">
                               <Pill className="w-6 h-6" />
                             </div>
                             <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Authorized</span>
                           </div>
                           <h4 className="text-xl font-serif font-bold text-brand-primary mb-1">{t(p.medication)}</h4>
                           <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-6">{p.dosage} • {t(p.duration)}</p>
                        </div>
                        <div className="pt-6 border-t border-brand-accent/5 flex justify-between items-center">
                           <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Ref: #{p.id.slice(-4).toUpperCase()}</span>
                           <span className="text-[9px] font-bold text-brand-secondary uppercase">{new Date(p.date).toLocaleDateString(locale)}</span>
                        </div>
                      </div>
                    ))}
                    {prescriptions.length === 0 && !isAddingPrescription && (
                      <div className="md:col-span-2 text-center py-20 bg-zinc-50/50 rounded-[3rem] border border-dashed border-zinc-200">
                        <Pill className="w-16 h-16 mx-auto mb-6 text-zinc-200" />
                        <p className="text-sm font-bold text-zinc-300 uppercase tracking-widest italic">{t('noActivePrescriptions')}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'labs' && (
                <motion.div key="labs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="flex justify-between items-center bg-brand-surface/50 p-6 rounded-3xl border border-brand-accent/5">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-brand-primary">{t('laboratoryResults')}</h3>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('recentDiagnosticMetrics')}</p>
                    </div>
                    <button 
                      onClick={() => setIsOrderingLab(!isOrderingLab)}
                      className="px-6 py-2.5 bg-brand-primary text-white rounded-full text-xs font-bold shadow-lg shadow-brand-primary/10 hover:bg-brand-secondary transition-all"
                    >
                      {isOrderingLab ? 'Cancel' : t('newLabOrder')}
                    </button>
                  </div>

                  {isOrderingLab && (
                    <motion.div className="p-8 bg-brand-surface rounded-[2rem] border border-brand-accent/10 space-y-6">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">{t('testType')}</label>
                        <select 
                          value={newTest}
                          onChange={(e) => setNewTest(e.target.value)}
                          className="w-full px-6 py-4 rounded-[1.5rem] border border-brand-accent/10 focus:ring-4 focus:ring-brand-primary/5 outline-none font-bold text-brand-primary bg-white appearance-none cursor-pointer"
                        >
                          <option value="">Select Protocol...</option>
                          <option value="Complete Blood Count">CBC (Complete Blood Count)</option>
                          <option value="Metabolic Panel">Metabolic Panel</option>
                          <option value="MRI Brain">MRI Neuro-imaging</option>
                          <option value="CT Scan Chest">CT Scan Thoracic</option>
                          <option value="HBA1C Testing">Diabetes Markers (HbA1c)</option>
                        </select>
                      </div>
                      <button 
                        onClick={handleOrderLab}
                        className="w-full py-4 bg-brand-primary text-white rounded-full font-bold shadow-xl shadow-brand-primary/10 hover:bg-brand-secondary transition-all"
                      >
                        {t('submitOrder')}
                      </button>
                    </motion.div>
                  )}

                  <div className="space-y-12">
                    {/* Lab Reports Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <FileText className="w-4 h-4 text-brand-secondary" />
                         <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400">Clinical Lab Reports</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {labResults.map((result, i) => (
                          <div key={result.id} className={`p-6 rounded-[2rem] border transition-all ${result.status === 'abnormalStatus' ? 'bg-red-50 border-red-100' : 'bg-brand-surface border-brand-accent/10'}`}>
                            <div className="flex justify-between items-start mb-4">
                              <h5 className="font-bold text-brand-primary">{t(result.testName)}</h5>
                              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${result.status === 'abnormalStatus' ? 'bg-red-500 text-white' : 'bg-brand-accent/20 text-brand-secondary'}`}>
                                {t(result.status)}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1 mb-4">
                              <span className="text-3xl font-serif font-bold text-brand-primary">{result.resultValue}</span>
                              <span className="text-xs font-bold text-brand-secondary uppercase">{result.unit}</span>
                            </div>
                            <div className="pt-4 border-t border-black/5 flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                               <span>ID: #{result.id.slice(-4)}</span>
                               <span>{new Date(result.date).toLocaleDateString(locale)}</span>
                            </div>
                          </div>
                        ))}
                        {labResults.length === 0 && (
                          <div className="col-span-2 py-10 text-center bg-zinc-50/50 rounded-[2rem] border border-dashed border-zinc-200">
                             <p className="text-sm italic text-zinc-300">{t('noLabResults')}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pending Orders Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <Clock className="w-4 h-4 text-brand-secondary" />
                         <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400">Scheduled Diagnostic Orders</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {labOrders.map((order, i) => (
                           <div key={order.id} className="p-6 border border-brand-accent/5 rounded-[2rem] bg-brand-surface flex justify-between items-center">
                              <div>
                                <h4 className="font-bold text-brand-primary">{t(order.testName)}</h4>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t(order.status)}</p>
                              </div>
                              <span className="text-[10px] font-bold text-brand-secondary">{new Date(order.date).toLocaleDateString(locale)}</span>
                           </div>
                         ))}
                         {labOrders.length === 0 && (
                           <div className="col-span-2 py-10 text-center bg-zinc-50/50 rounded-[2rem] border border-dashed border-zinc-200">
                             <p className="text-sm italic text-zinc-300">No active diagnostic conduits.</p>
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'appointments' && (
                <motion.div key="appointments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="bg-brand-surface/50 p-6 rounded-3xl border border-brand-accent/5">
                    <h3 className="text-lg font-serif font-bold text-brand-primary">{t('upcomingAppointments')}</h3>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('scheduledConsultations')}</p>
                  </div>
                  <div className="space-y-4">
                    {appointments.map((appt, i) => (
                      <div key={appt.id} className="p-8 bg-brand-surface border border-brand-accent/5 rounded-[2.5rem] flex items-center gap-8 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col items-center justify-center w-20 py-4 bg-white rounded-2xl border border-brand-accent/10 shadow-sm">
                           <span className="text-2xl font-serif font-bold text-brand-primary leading-none">{new Date(appt.date).getDate()}</span>
                           <span className="text-[10px] font-black uppercase text-brand-secondary tracking-widest">{new Date(appt.date).toLocaleDateString(locale, { month: 'short' })}</span>
                        </div>
                        <div className="flex-1">
                           <h4 className="text-xl font-serif font-bold text-brand-primary mb-1">{t(appt.reason)}</h4>
                           <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase text-zinc-400 tracking-widest">
                                 <Clock className="w-3.5 h-3.5" />
                                 {new Date(appt.date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                appt.severity === 'Emergency' ? 'bg-red-50 text-red-500 border border-red-100' :
                                appt.severity === 'Critical' ? 'bg-orange-50 text-orange-500 border border-orange-100' :
                                'bg-emerald-50 text-emerald-500 border border-emerald-100'
                              }`}>
                                {appt.severity}
                              </span>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className="block text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] mb-1">Confirmed</span>
                           <button className="text-[10px] font-bold text-brand-secondary hover:text-brand-primary transition-colors underline underline-offset-4">Modify Schedule</button>
                        </div>
                      </div>
                    ))}
                    {appointments.length === 0 && (
                      <div className="text-center py-20 bg-zinc-50/50 rounded-[3rem] border border-dashed border-zinc-200">
                        <Calendar className="w-16 h-16 mx-auto mb-6 text-zinc-200" />
                        <p className="text-sm font-bold text-zinc-300 uppercase tracking-widest italic">{t('noUpcomingAppointments')}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'consult' && (
                <motion.div key="consult" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <SecureMessaging initialChat={patient} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
