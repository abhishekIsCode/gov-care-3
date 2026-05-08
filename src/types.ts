export type UserRole = 'doctor' | 'patient';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  assignedDoctorId?: string;
  currentSeverity?: AppointmentSeverity;
  photoURL?: string;
  phone?: string;
  emergencyContact?: string;
  createdAt: number;
}

export type AppointmentSeverity = 'Emergency' | 'Critical' | 'Normal';
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName?: string;
  doctorName?: string;
  date: number;
  status: AppointmentStatus;
  severity: AppointmentSeverity;
  reason: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  resultValue: string;
  unit: string;
  status: 'Normal' | 'Abnormal';
  date: number;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medication: string;
  dosage: string;
  duration: string;
  date: number;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  notes: string;
  date: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  read: boolean;
}
