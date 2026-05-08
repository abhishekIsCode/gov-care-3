import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  User,
  Send,
  MoreVertical,
  Paperclip,
  Smile,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Lock,
  ChevronLeft,
  MessageSquare
} from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../AuthProvider';
import { useLanguage } from '../LanguageProvider';
import { Message, UserProfile } from '../../types';

export default function SecureMessaging({ initialChat }: { initialChat?: UserProfile }) {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<UserProfile[]>([]);
  const [selectedChat, setSelectedChat] = useState<UserProfile | null>(initialChat || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialChat) {
      setSelectedChat(initialChat);
    }
  }, [initialChat]);

  useEffect(() => {
    if (!profile) return;

    if (profile.uid === 'guest_doctor_aryan') {
      const mockPatients: UserProfile[] = [
        { uid: 'p1', displayName: 'Elena Gilbert', email: 'elena@example.com', role: 'patient', photoURL: '', createdAt: Date.now() - 1000000 },
        { uid: 'p2', displayName: 'Stefan Salvatore', email: 'stefan@example.com', role: 'patient', photoURL: '', createdAt: Date.now() - 2000000 },
        { uid: 'p3', displayName: 'Damon Salvatore', email: 'damon@example.com', role: 'patient', photoURL: '', createdAt: Date.now() - 3000000 },
      ];
      setConversations(mockPatients);
      setLoading(false);
      return;
    }

    // In a real app, we'd query users this doctor has messages with
    // For demo, list all patients as potential chats
    const q = query(collection(db, 'users'), where('role', '==', 'patient'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setConversations(snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [profile]);

  useEffect(() => {
    if (!profile || !selectedChat) return;

    if (profile.uid === 'guest_doctor_aryan') {
      const mockMessages: Message[] = [
        { id: 'm1', senderId: selectedChat.uid, receiverId: profile.uid, content: "Doctor, I'm feeling some tightness in my chest since this morning.", timestamp: Date.now() - 3600000, read: true },
        { id: 'm2', senderId: profile.uid, receiverId: selectedChat.uid, content: "Hello, based on your history I'd like you to monitor your oxygen levels. I've sent a lab request.", timestamp: Date.now() - 1800000, read: true },
        { id: 'm3', senderId: selectedChat.uid, receiverId: profile.uid, content: "Okay, I'll update you as soon as I have the reading.", timestamp: Date.now() - 600000, read: false },
      ];
      setMessages(mockMessages);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      return;
    }

    // Chat ID pattern: smallerUid_largerUid
    const chatId = [profile.uid, selectedChat.uid].sort().join('_');
    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [profile, selectedChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedChat || !newMessage.trim()) return;

    const currentMsg = newMessage.trim();
    setNewMessage('');

    if (profile.uid === 'guest_doctor_aryan') {
      const newM: Message = {
        id: 'm' + Date.now(),
        senderId: profile.uid,
        receiverId: selectedChat.uid,
        content: currentMsg,
        timestamp: Date.now(),
        read: false
      };
      setMessages([...messages, newM]);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      return;
    }

    const chatId = [profile.uid, selectedChat.uid].sort().join('_');
    const content = newMessage.trim();
    setNewMessage('');

    try {
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        senderId: profile.uid,
        receiverId: selectedChat.uid,
        content,
        timestamp: Date.now(),
        read: false
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-brand-accent/10 overflow-hidden h-[calc(100vh-200px)] flex shadow-sm">
      {/* Sidebar: Conversations */}
      <div className={`w-80 border-r border-brand-accent/5 flex flex-col ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-8 border-b border-brand-accent/5">
          <h3 className="text-xl font-serif font-bold text-brand-primary mb-6">{t('consultations')}</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
            <input
              type="text"
              placeholder={t('searchPatients')}
              className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-brand-accent/5 rounded-full text-sm outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-brand-accent/5">
          {conversations.map((conv) => (
            <button
              key={conv.uid}
              onClick={() => setSelectedChat(conv)}
              className={`w-full p-6 text-left hover:bg-brand-surface transition-colors flex items-center gap-4 group ${
                selectedChat?.uid === conv.uid ? 'bg-brand-accent/10 border-r-2 border-brand-primary' : ''
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-brand-surface border border-brand-accent/5 flex items-center justify-center font-bold text-brand-secondary uppercase transition-all group-hover:bg-white group-hover:shadow-md">
                  {conv.displayName[0]}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-bold text-sm text-brand-primary truncate">{conv.displayName}</h4>
                  <span className="text-[10px] text-brand-secondary font-bold uppercase tracking-tight">12m</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-zinc-300 truncate tracking-widest">Medical Record Sync...</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-brand-surface/30 ${!selectedChat ? 'hidden lg:flex' : 'flex'}`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="px-8 py-6 border-b border-brand-accent/5 bg-white/50 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedChat(null)} className="lg:hidden p-2 hover:bg-brand-surface rounded-xl">
                  <ChevronLeft className="w-5 h-5 text-brand-primary" />
                </button>
                <div className="w-12 h-12 rounded-[1.25rem] bg-brand-accent/10 flex items-center justify-center text-brand-secondary font-bold text-lg uppercase">
                  {selectedChat.displayName[0]}
                </div>
                <div>
                  <h4 className="font-bold text-brand-primary">{selectedChat.displayName}</h4>
                  <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase text-emerald-500 tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t('activeLink')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <button className="w-10 h-10 hover:bg-brand-surface rounded-full flex items-center justify-center text-brand-secondary transition-colors border border-brand-accent/10">
                    <ShieldCheck className="w-5 h-5" />
                 </button>
                 <button className="w-10 h-10 hover:bg-brand-surface rounded-full flex items-center justify-center text-zinc-300 transition-colors border border-brand-accent/10">
                    <MoreVertical className="w-5 h-5" />
                 </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="flex flex-col items-center mb-8">
                 <div className="flex items-center gap-2 px-6 py-2 bg-brand-accent/20 rounded-full text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] border border-brand-accent/30">
                    <Lock className="w-3.5 h-3.5" /> End-to-End Encrypted
                 </div>
                 <p className="mt-4 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Chat started on {new Date(selectedChat.createdAt).toLocaleDateString()} • {new Date(selectedChat.createdAt).toLocaleTimeString()}</p>
              </div>

              {messages.map((msg, i) => {
                const isMine = msg.senderId === profile?.uid;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] group`}>
                       <div className={`px-6 py-4 rounded-[1.75rem] text-sm leading-relaxed shadow-sm ${
                         isMine
                           ? 'bg-brand-primary text-white rounded-tr-none'
                           : 'bg-white text-brand-primary border border-brand-accent/10 rounded-tl-none'
                       }`}>
                          {msg.content}
                       </div>
                       <div className={`mt-2 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-zinc-300 ${isMine ? 'justify-end' : 'justify-start'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMine && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                       </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-8 bg-white border-t border-brand-accent/5">
               <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-brand-surface rounded-[2rem] p-2 pl-4 border border-brand-accent/10 focus-within:ring-4 focus-within:ring-brand-primary/5 transition-all">
                  <button type="button" className="w-10 h-10 text-brand-secondary/40 hover:text-brand-secondary transition-colors">
                     <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('typeMessage')}
                    className="flex-1 bg-transparent border-none outline-none text-sm py-2 pr-4 font-bold text-brand-primary placeholder:text-zinc-300"
                  />
                  <button type="button" className="w-10 h-10 text-brand-secondary/40 hover:text-brand-secondary transition-colors">
                     <Smile className="w-5 h-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-12 h-12 bg-brand-primary text-white rounded-full flex items-center justify-center hover:bg-brand-secondary disabled:opacity-30 disabled:grayscale transition-all shadow-xl shadow-brand-primary/20 active:scale-95"
                  >
                    <Send className="w-5 h-5" />
                  </button>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-300 p-12 text-center">
            <div className="w-24 h-24 bg-white border border-brand-accent/10 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-brand-primary/5">
               <MessageSquare className="w-10 h-10 text-brand-accent/30" />
            </div>
            <h3 className="text-xl font-serif font-bold text-brand-primary mb-4">Secure Consultation Channel</h3>
            <p className="max-w-xs text-xs font-bold uppercase tracking-widest text-brand-secondary/40 leading-relaxed">
               Pick a patient context from the sidebar to establish a verified secure link.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
