import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  enterAsGuestDoctor: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const enterAsGuestDoctor = () => {
    const guestProfile: UserProfile = {
      uid: 'guest_doctor_aryan',
      email: 'doctor@docportal.com',
      displayName: 'Aryan Kumar',
      role: 'doctor',
      photoURL: '',
      createdAt: Date.now(),
    };
    setProfile(guestProfile);
    setLoading(false);
  };

  useEffect(() => {
    const sessionProfile = localStorage.getItem('guest_profile');
    if (sessionProfile) {
      setProfile(JSON.parse(sessionProfile));
      setLoading(false);
    }

    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const profileDoc = await getDoc(doc(db, 'users', user.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as UserProfile);
        } else {
          // Default to patient if New User
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || 'doctor@docportal.com',
            displayName: user.isAnonymous ? 'Aryan Kumar' : (user.displayName || 'Aryan Kumar'),
            role: 'doctor', 
            photoURL: user.photoURL || '',
            createdAt: Date.now(),
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          setProfile(newProfile);
        }
      } else if (!sessionProfile) {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (profile && profile.uid.startsWith('guest_')) {
      localStorage.setItem('guest_profile', JSON.stringify(profile));
    } else if (!profile) {
      localStorage.removeItem('guest_profile');
    }
  }, [profile]);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn: async () => {}, // Handled in individual components for now
      enterAsGuestDoctor,
      signOut: async () => {
        localStorage.removeItem('guest_profile');
        setProfile(null);
        await auth.signOut();
      },
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
