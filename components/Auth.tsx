
import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '../firebase';
import { 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Lock, 
  Mail, 
  UserPlus, 
  LogIn, 
  AlertTriangle,
  Terminal,
  Cpu,
  Chrome
} from 'lucide-react';

interface AuthProps {
  onSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black p-6">
      {/* Background Grid & Glow */}
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF6A00]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="neon-border bg-[#0F0F0F] p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#FF6A00] flex items-center justify-center font-black text-black text-2xl rounded-sm shadow-[0_0_30px_rgba(255,106,0,0.3)] mb-4">
              S
            </div>
            <h2 className="text-2xl font-black tracking-tighter uppercase text-white mb-2">
              {mode === 'login' ? 'System Access' : 'Register Operator'}
            </h2>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              Secured Neural Link Protocol v2.0
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 p-4 flex items-start gap-3 animate-in shake duration-300">
              <AlertTriangle className="text-red-500 shrink-0" size={16} />
              <p className="text-[10px] font-mono text-red-500 uppercase">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <label className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1 block">Identifier (Email)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input 
                    type="email"
                    required
                    className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm font-mono text-white placeholder:text-gray-700 focus:outline-none focus:border-[#FF6A00] transition-all rounded-sm"
                    placeholder="OPERATOR_ID@SPEEDOPS.IO"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1 block">Cipher (Password)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input 
                    type="password"
                    required
                    className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm font-mono text-white placeholder:text-gray-700 focus:outline-none focus:border-[#FF6A00] transition-all rounded-sm"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-5 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#FF6A00]/10 disabled:opacity-30 group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Cpu className="animate-spin" size={16} /> Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
                  {mode === 'login' ? 'Establish Connection' : 'Register Operator'}
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                </span>
              )}
            </button>
          </form>

          {/* Social Separator */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-[1px] bg-white/5" />
            <span className="text-[8px] font-mono text-gray-700 uppercase tracking-widest">External SSO</span>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>

          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 border border-white/10 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-sm disabled:opacity-30 group"
          >
            <Chrome size={16} className="text-gray-400 group-hover:text-white transition-colors" />
            Bypass with Google
          </button>

          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-[10px] font-mono text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              {mode === 'login' ? 'No access? Request registration' : 'Already registered? Sync existing ID'}
            </button>
          </div>
        </div>

        {/* Decorative corner markers */}
        <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 border-[#FF6A00]" />
        <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b-2 border-r-2 border-[#FF6A00]" />
      </div>

      <style>{`
        .btn-primary {
          background-color: #FF6A00;
          color: black;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          border-radius: 2px;
        }
        .btn-primary:hover:not(:disabled) {
          background-color: white;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};
