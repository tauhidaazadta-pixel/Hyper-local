import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  LogIn,
  User,
  ShieldCheck,
  Store,
  Bike,
  CheckCircle2,
  Mail,
  Lock,
} from 'lucide-react';
import { UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    allUsers,
    switchUser,
    loginWithSocial,
    currentUser,
  } = useApp();

  const [mode, setMode] = useState<'social' | 'email'>('social');
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  if (!isAuthModalOpen) return null;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    loginWithSocial('email', emailInput, nameInput || 'Account User');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0f2b5c] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Authentication & Role Switcher</h3>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 rounded-full hover:bg-blue-800 text-blue-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Quick Persona Selector for Testing */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              1-Click Instant Test Personas:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {allUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    switchUser(user.id);
                    setIsAuthModalOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    user.id === currentUser.id
                      ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#0f2b5c] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="truncate text-xs">
                    <div className="font-bold text-slate-900 truncate">{user.name}</div>
                    <div className="text-[10px] text-blue-700 font-semibold capitalize">{user.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-400 font-semibold">Or Connect Account</span>
            </div>
          </div>

          {/* Social Sign-In Buttons */}
          <div className="space-y-2">
            {/* Google Sign In */}
            <button
              onClick={() => loginWithSocial('google')}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Facebook Sign In */}
            <button
              onClick={() => loginWithSocial('facebook')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Continue with Facebook</span>
            </button>
          </div>

          {/* Email / Password Form toggle */}
          {mode === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-2.5 text-xs pt-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Your Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#0f2b5c] hover:bg-blue-900 text-white font-bold text-xs rounded-xl"
              >
                Sign In with Email
              </button>
            </form>
          ) : (
            <button
              onClick={() => setMode('email')}
              className="w-full py-2 text-center text-xs text-blue-700 font-bold hover:underline"
            >
              Or sign in with email & password
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
