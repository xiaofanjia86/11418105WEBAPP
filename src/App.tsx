/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PetList from './components/PetList';
import AdoptionProcess from './components/AdoptionProcess';
import AdoptionForm from './components/AdoptionForm';
import UserProfileSettings from './components/UserProfileSettings';
import ApplicationRecords from './components/ApplicationRecords';
import AuthModal from './components/AuthModal';
import { auth } from './firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { getOrInitializeVisitorUid, getUserProfile } from './services/dbService';
import { Pet, UserProfile } from './types';
import { 
  Check, 
  ClipboardCheck, 
  Heart,
  PawPrint,
  Info,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'main' | 'profile' | 'records'>('main');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // 剛送件成功的對象 (控管對應成功摘要 Modal 的彈出)
  const [submittedApp, setSubmittedApp] = useState<any | null>(null);

  // 會員管理狀態
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // 訂閱 Firebase Auth 變更
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 計算動態的 UID
  const currentUid = currentUser ? currentUser.uid : getOrInitializeVisitorUid();

  // 當使用者 UID 改變（不論是登入、登出或新訪客），自動載入 Firestore 個人設定檔
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getUserProfile(currentUid);
        if (data) {
          setUserProfile(data);
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        console.error("載入全站使用者設定檔失敗:", err);
      }
    }
    loadProfile();
  }, [currentUid]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectPet = (pet: Pet) => {
    setSelectedPet(pet);
    // 自動移到表單 section
    setTimeout(() => {
      scrollToSection('adopt-form-section');
    }, 150);
  };

  const handleClearSelectedPet = () => {
    setSelectedPet(null);
  };

  const handleProfileUpdated = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const handleApplicationSubmitted = (appDetails: any) => {
    setSubmittedApp(appDetails);
  };

  const closeSuccessModal = () => {
    setSubmittedApp(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab('main');
    } catch (err) {
      console.error("登出失敗:", err);
    }
  };

  return (
    <div className="bg-amber-50/20 text-slate-800 font-sans min-h-screen flex flex-col antialiased">
      
      {/* 導覽列 */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        scrollToSection={scrollToSection} 
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 核心內容視圖切換 */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {activeTab === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* 英雄 Banner */}
              <Hero scrollToSection={scrollToSection} />

              {/* 寵物清單 */}
              <PetList onSelectPet={handleSelectPet} />

              {/* 認養流程 */}
              <AdoptionProcess />

              {/* 線上認養表單 */}
              <AdoptionForm 
                selectedPet={selectedPet}
                onClearSelectedPet={handleClearSelectedPet}
                userProfile={userProfile}
                onApplicationSubmitted={handleApplicationSubmitted}
              />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <UserProfileSettings onProfileUpdated={handleProfileUpdated} currentUid={currentUid} />
            </motion.div>
          )}

          {activeTab === 'records' && (
            <motion.div
              key="records"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ApplicationRecords userPhone={userProfile?.phone} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 全網會員登入與註冊彈出窗 */}
      <AnimatePresence>
        {authModalOpen && (
          <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        )}
      </AnimatePresence>

      {/* 成功提送表單大視窗彈出 (AnimatePresence) */}
      <AnimatePresence>
        {submittedApp && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* 背景微模糊與半透明 */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={closeSuccessModal}
            />
            
            {/* 內容視窗 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full border border-amber-100 relative z-10"
            >
              {/* 頂部炫彩區 */}
              <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-8 text-center text-white relative">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-amber-600 mx-auto mb-4 shadow-md animate-heart-beat">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-2xl font-black">認養意願申請已遞交！</h3>
                <p className="text-xs text-amber-50 mt-1">
                  感謝大愛！您的資料已安全寫入至 Firestore，志工將於 3 天內與您電話約約。
                </p>
              </div>
              
              {/* 履歷摘要 */}
              <div className="px-8 py-6 max-h-[380px] overflow-y-auto space-y-4">
                <h4 className="font-bold text-amber-950 border-b border-amber-100 pb-2 text-sm flex items-center gap-1.5">
                  <ClipboardCheck className="w-5 h-5 text-amber-600" />
                  認養申請資料摘要 (Firestore 建檔錄)
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                  <div>
                    <span className="font-medium text-slate-400 block">認養意向目標</span>
                    <span className="text-amber-900 font-bold text-sm block">{submittedApp.petName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400 block">申請人姓名</span>
                    <span className="text-slate-800 font-bold text-sm block">{submittedApp.adopterName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400 block">聯絡電話</span>
                    <span className="text-slate-800 font-semibold block">{submittedApp.adopterPhone}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400 block">電子信箱</span>
                    <span className="text-slate-800 font-semibold truncate block">{submittedApp.adopterEmail}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-medium text-slate-400 block">通訊地址</span>
                    <span className="text-slate-800 block">{submittedApp.adopterAddress}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400 block">過往飼育歷史</span>
                    <span className="text-slate-800 block">{submittedApp.hasPetExperience === 'yes' ? '有飼養經驗' : '無過往經驗'}</span>
                  </div>
                  {submittedApp.hasPetExperience === 'yes' && (
                    <div>
                      <span className="font-medium text-slate-400 block">前寵物品種</span>
                      <span className="text-slate-800 block">{submittedApp.previousBreed}</span>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <span className="font-medium text-slate-400 block">認養起心動念與理念</span>
                    <span className="text-slate-700 bg-amber-50/50 p-3.5 rounded-2xl block border border-amber-100/40 text-xs leading-relaxed max-h-[100px] overflow-y-auto">
                      {submittedApp.adoptionReason}
                    </span>
                  </div>
                </div>
              </div>

              {/* 底部按鈕 */}
              <div className="bg-amber-50/80 px-6 py-4 flex flex-col sm:flex-row justify-end gap-2 border-t border-amber-100">
                <button 
                  onClick={() => {
                    closeSuccessModal();
                    setActiveTab('records');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="border border-amber-300 hover:bg-amber-100 text-amber-900 px-5 py-2 rounded-xl font-bold transition-all text-xs"
                >
                  前往查看案件進度
                </button>
                <button 
                  onClick={closeSuccessModal}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-md text-xs"
                >
                  好的，我明白了
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 頁尾 */}
      <footer className="bg-amber-950 text-amber-250 py-12 border-t border-amber-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-amber-900 pb-8">
            <div 
              onClick={() => {
                setActiveTab('main');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center text-lg shadow-inner group-hover:scale-105 transition-transform">
                <PawPrint className="w-5 h-5 fill-white text-white" />
              </div>
              <div className="text-left">
                <span className="text-lg font-bold text-white tracking-wide block">浪愛有家</span>
                <span className="text-[10px] text-amber-400 block -mt-1 font-bold">PET ADOPTION AGENCY</span>
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <button onClick={() => { setActiveTab('main'); setTimeout(() => scrollToSection('about'), 100); }} className="text-amber-200 hover:text-white transition-colors">關於我們</button>
              <button onClick={() => { setActiveTab('main'); setTimeout(() => scrollToSection('pets'), 100); }} className="text-amber-200 hover:text-white transition-colors">尋找伴侶</button>
              <button onClick={() => { setActiveTab('main'); setTimeout(() => scrollToSection('adopt-form-section'), 100); }} className="text-amber-200 hover:text-white transition-colors">線上認養</button>
              <button onClick={() => { setActiveTab('profile'); }} className="text-amber-200 hover:text-white transition-colors">個人履歷設定</button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-[11px] text-amber-400/80">
            <p>&copy; 2026 浪愛有家寵物認養機構. 保留所有權利。</p>
            <p className="flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" /> for lovable companions.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
