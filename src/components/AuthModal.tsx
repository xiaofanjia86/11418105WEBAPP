/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '../firebase';
import { 
  X, 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  PawPrint
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim() || !password) {
      setError('請填寫所有必填欄位');
      return;
    }

    if (password.length < 6) {
      setError('密碼長度必須至少為 6 個字元');
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError('兩次輸入的密碼不一致');
      return;
    }

    try {
      setLoading(true);
      if (isRegister) {
        // 註冊
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        setSuccess('註冊成功！已為您自動登入！');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1500);
      } else {
        // 登入
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setSuccess('登入成功！歡迎回來！');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      let localizedError = '操作失敗，請確認您的帳號密碼。';
      if (err.code === 'auth/email-already-in-use') {
        localizedError = '此電子信箱已被註冊。';
      } else if (err.code === 'auth/invalid-email') {
        localizedError = '請輸入格式正確的電子信箱。';
      } else if (err.code === 'auth/weak-password') {
        localizedError = '密碼強度不足，至少需要 6 個字元。';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        localizedError = '電子信箱或密碼有誤，請再試一次。';
      } else if (err.code === 'auth/too-many-requests') {
        localizedError = '嘗試登入次數過多，帳戶已暫時鎖定，請稍後再試。';
      }
      setError(localizedError);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setSuccess('Google 登入成功！歡迎您！');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google 登入時發生錯誤，請稍後再試。');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* 背景背板 (防誤觸遮罩) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 視窗主體 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white/95 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl max-w-md w-full border border-amber-100/50 relative z-10 p-6 sm:p-8"
      >
        {/* 關閉按鈕 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 品牌標章 */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center text-lg mx-auto mb-3 shadow-[0_4px_12px_rgba(245,158,11,0.35)] animate-pulse">
            <PawPrint className="w-6 h-6 fill-white text-white" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">
            {isRegister ? '加入浪愛有家' : '登入領養人帳號'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            登入後，您的個人履歷與領養進度將自動安全備份在雲端
          </p>
        </div>

        {/* 狀態反饋區域 */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2.5 text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3.5 bg-emerald-50 border border-emerald-250 text-emerald-850 rounded-xl flex items-start gap-2.5 text-xs font-semibold animate-bounce"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 認養登入表單 */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {/* 電子信箱 */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              電子信箱 Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input 
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl outline-none text-sm text-slate-800 transition-all font-medium placeholder-slate-400 focus:ring-2 focus:ring-amber-200"
                placeholder="example@email.com"
              />
            </div>
          </div>

          {/* 密碼 */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              密碼 Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input 
                type="password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl outline-none text-sm text-slate-800 transition-all font-medium placeholder-slate-400 focus:ring-2 focus:ring-amber-200"
                placeholder="輸入至少 6 位字元"
              />
            </div>
          </div>

          {/* 重複確認密碼 (註冊時顯示) */}
          {isRegister && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden"
            >
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                確認密碼 Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input 
                  type="password"
                  required={isRegister}
                  disabled={loading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl outline-none text-sm text-slate-800 transition-all font-medium placeholder-slate-400 focus:ring-2 focus:ring-amber-200"
                  placeholder="請再次輸入相同密碼"
                />
              </div>
            </motion.div>
          )}

          {/* 遞交按鈕 */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-350 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-amber-200 active:scale-95 flex items-center justify-center gap-2"
          >
            {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            {loading ? '請稍候...' : isRegister ? '建立領養人帳號' : '登入帳號'}
          </button>
        </form>

        {/* 分隔線 (Or) */}
        <div className="relative flex items-center justify-center my-5">
          <div className="absolute inset-x-0 h-[1px] bg-slate-200" />
          <span className="relative bg-white px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            或使用第三方登入
          </span>
        </div>

        {/* Google 快捷登入 */}
        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full border border-slate-200 hover:bg-slate-50 bg-white font-semibold text-slate-700 py-2.5 px-4 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {/* 設計簡潔的 Google 彩色標誌 SVG */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.125C18.28 1.915 15.54 1 12.24 1 5.92 1 .8 6.12.8 12.4s5.12 11.4 11.44 11.4c6.6 0 11-4.636 11-11.182 0-.75-.08-1.32-.24-1.882H12.24z"/>
          </svg>
          使用 Google 帳號一鍵登入
        </button>

        {/* 切換註冊/登入鏈結 */}
        <div className="text-center mt-5">
          <button 
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              resetForm();
            }}
            className="text-xs text-amber-700 hover:text-amber-800 font-bold hover:underline"
          >
            {isRegister ? '已有帳號？立即登入' : '第一次光臨？建立全新帳號'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
