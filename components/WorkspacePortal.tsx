
import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  ArrowRight, 
  Terminal, 
  ShieldCheck, 
  Users,
  AlertCircle,
  Cpu,
  Orbit
} from 'lucide-react';
import { 
  collection, 
  setDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  arrayUnion,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase';

interface WorkspacePortalProps {
  onWorkspaceFound: (id: string) => void;
}

export const WorkspacePortal: React.FC<WorkspacePortalProps> = ({ onWorkspaceFound }) => {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [wsName, setWsName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreate = async () => {
    if (!wsName.trim() || !auth.currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const wsId = `ws-${Date.now()}`;
      const code = generateInviteCode();
      
      const wsData = {
        id: wsId,
        name: wsName,
        ownerId: auth.currentUser.uid,
        members: [auth.currentUser.uid],
        inviteCode: code,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'workspaces', wsId), wsData);
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        activeWorkspaceId: wsId,
        email: auth.currentUser.email
      }, { merge: true });

      onWorkspaceFound(wsId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim() || !auth.currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'workspaces'), where('inviteCode', '==', inviteCode.trim().toUpperCase()));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error("INVALID_INVITE_CODE: Nexus cluster not found.");
      }

      const wsDoc = snapshot.docs[0];
      const wsId = wsDoc.id;

      await updateDoc(doc(db, 'workspaces', wsId), {
        members: arrayUnion(auth.currentUser.uid)
      });

      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        activeWorkspaceId: wsId,
        email: auth.currentUser.email
      }, { merge: true });

      onWorkspaceFound(wsId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black p-6">
      <div className="fixed inset-0 bg-grid opacity-20" />
      
      <div className="relative w-full max-w-xl animate-in fade-in zoom-in-95 duration-500">
        <div className="neon-border bg-[#0F0F0F] p-8 md:p-12 shadow-[0_0_50px_rgba(255,106,0,0.1)]">
          {mode === 'select' && (
            <div className="space-y-10">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FF6A00]/10 border border-[#FF6A00]/30 flex items-center justify-center rounded-sm mx-auto mb-6">
                  <Orbit className="text-[#FF6A00] animate-spin-slow" size={32} />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Cluster Identification</h2>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Select synchronization path</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={() => setMode('create')}
                  className="p-8 border border-white/5 bg-white/2 hover:bg-[#FF6A00]/5 hover:border-[#FF6A00]/50 transition-all group text-left"
                >
                  <Plus className="text-[#FF6A00] mb-4 group-hover:scale-110 transition-transform" size={24} />
                  <div className="font-bold uppercase text-sm mb-2">Initialize New</div>
                  <div className="text-[9px] font-mono text-gray-600 uppercase">Create a fresh operational cluster for your team.</div>
                </button>
                <button 
                  onClick={() => setMode('join')}
                  className="p-8 border border-white/5 bg-white/2 hover:bg-[#FF6A00]/5 hover:border-[#FF6A00]/50 transition-all group text-left"
                >
                  <Users className="text-[#FF6A00] mb-4 group-hover:scale-110 transition-transform" size={24} />
                  <div className="font-bold uppercase text-sm mb-2">Sync with Cluster</div>
                  <div className="text-[9px] font-mono text-gray-600 uppercase">Join an existing workspace via Nexus invite code.</div>
                </button>
              </div>
            </div>
          )}

          {(mode === 'create' || mode === 'join') && (
            <div className="space-y-8">
              <button 
                onClick={() => setMode('select')}
                className="text-[10px] font-mono text-gray-600 hover:text-white uppercase tracking-widest flex items-center gap-2 mb-4"
              >
                Abort Protocol
              </button>

              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">
                  {mode === 'create' ? 'Name Your Cluster' : 'Nexus Authentication'}
                </h2>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                  {mode === 'create' ? 'Set operational workspace identity' : 'Enter 6-digit cluster authorization code'}
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 p-4 flex items-center gap-3 animate-in shake">
                  <AlertCircle className="text-red-500" size={16} />
                  <span className="text-[10px] font-mono text-red-500 uppercase">{error}</span>
                </div>
              )}

              <div className="space-y-6">
                {mode === 'create' ? (
                  <div>
                    <label className="text-[9px] font-mono text-gray-600 uppercase mb-2 block">Cluster Codename</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 p-5 text-white font-mono focus:border-[#FF6A00] outline-none rounded-sm uppercase tracking-widest"
                      placeholder="E.G. ALPHA_STARK"
                      value={wsName}
                      onChange={e => setWsName(e.target.value)}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-[9px] font-mono text-gray-600 uppercase mb-2 block">Invite Code</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 p-5 text-white font-mono focus:border-[#FF6A00] outline-none rounded-sm text-center text-2xl tracking-[0.5em] uppercase"
                      placeholder="X8Z2B1"
                      maxLength={6}
                      value={inviteCode}
                      onChange={e => setInviteCode(e.target.value)}
                    />
                  </div>
                )}

                <button 
                  disabled={loading || (mode === 'create' ? !wsName : !inviteCode)}
                  onClick={mode === 'create' ? handleCreate : handleJoin}
                  className="w-full py-5 bg-[#FF6A00] text-black font-black uppercase text-xs tracking-widest hover:bg-white transition-all rounded-sm disabled:opacity-20 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <Cpu className="animate-spin" size={18} />
                  ) : (
                    <>
                      {mode === 'create' ? 'Initialize Cluster' : 'Authorize Sync'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
};
