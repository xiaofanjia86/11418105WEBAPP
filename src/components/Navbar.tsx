/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PawPrint, Heart, User, ClipboardList, Menu, X, Check, LogIn } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  activeTab: 'main' | 'profile' | 'records';
  setActiveTab: (tab: 'main' | 'profile' | 'records') => void;
  scrollToSection: (id: string) => void;
  currentUser: FirebaseUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  scrollToSection,
  currentUser,
  onOpenAuth,
  onLogout
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setActiveTab('main');
    setMobileMenuOpen(false);
    setTimeout(() => {
      scrollToSection(sectionId);
    }, 100);
  };

  const handleTabChange = (tab: 'profile' | 'records') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/30 backdrop-blur-2xl border-b border-white/40 shadow-lg shadow-amber-950/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo 標誌區 */}
          <div 
            onClick={() => handleNavClick('about')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-amber-600 border border-white/40 rounded-full flex items-center justify-center text-white shadow-md shadow-amber-300 group-hover:scale-110 transition-transform">
              <PawPrint className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold text-amber-950 tracking-wider block">浪愛有家</span>
              <span className="text-[10px] text-amber-600 block -mt-1 font-bold">PET ADOPTION SYSTEM</span>
            </div>
          </div>

          {/* 桌面版導覽連結 */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => handleNavClick('about')}
              className={`font-medium px-3 py-2 rounded-xl transition-all ${activeTab === 'main' ? 'text-amber-950 hover:bg-white/40' : 'text-slate-600 hover:text-amber-950 hover:bg-white/40'}`}
            >
              關於我們
            </button>
            <button 
              onClick={() => handleNavClick('pets')}
              className={`font-medium px-3 py-2 rounded-xl transition-all ${activeTab === 'main' ? 'text-amber-950 hover:bg-white/40' : 'text-slate-600 hover:text-amber-950 hover:bg-white/40'}`}
            >
              尋找伴侶
            </button>
            <button 
              onClick={() => handleNavClick('process')}
              className={`font-medium px-3 py-2 rounded-xl transition-all ${activeTab === 'main' ? 'text-amber-950 hover:bg-white/40' : 'text-slate-600 hover:text-amber-950 hover:bg-white/40'}`}
            >
              認養流程
            </button>

            <span className="h-6 w-[1px] bg-white/50"></span>

            {/* 個人資料與紀錄按鈕 */}
            <button 
              onClick={() => handleTabChange('profile')}
              className={`flex items-center gap-1.5 font-medium px-4 py-2 rounded-xl transition-all border ${
                activeTab === 'profile' 
                  ? 'bg-white/65 text-amber-950 font-bold border-white/60 shadow-sm' 
                  : 'text-slate-600 border-transparent hover:text-amber-950 hover:bg-white/40'
              }`}
            >
              <User className="w-4 h-4" />
              個人資料設定
            </button>
            
            <button 
              onClick={() => handleTabChange('records')}
              className={`flex items-center gap-1.5 font-medium px-4 py-2 rounded-xl transition-all border ${
                activeTab === 'records' 
                  ? 'bg-white/65 text-amber-950 font-bold border-white/60 shadow-sm' 
                  : 'text-slate-600 border-transparent hover:text-amber-950 hover:bg-white/40'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              申請記錄進度
            </button>

            {/* 會員登入/登出 */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-950 bg-amber-50/70 border border-amber-200/60 px-3 py-1.5 rounded-xl truncate max-w-[140px] shadow-sm">
                  {currentUser.displayName || currentUser.email?.split('@')[0] || '已登入領養人'}
                </span>
                <button 
                  onClick={onLogout}
                  className="text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 px-3 py-1.5 rounded-xl transition-all"
                >
                  登出
                </button>
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 font-bold text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3.5 py-2.5 rounded-xl hover:bg-amber-100/50 transition-all active:scale-95 duration-200 shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                登入 / 註冊
              </button>
            )}

            {/* 線上認養快捷呼叫 */}
            <button 
              onClick={() => handleNavClick('adopt-form-section')}
              className="bg-amber-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-amber-700 shadow-md shadow-amber-200/40 hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5"
            >
              <Heart className="w-4 h-4 fill-white text-white" />
              線上認養申請
            </button>
          </div>
          
          {/* 行動裝置選單開關 */}
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={() => handleNavClick('adopt-form-section')}
              className="bg-amber-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-amber-700 transition-all shadow-sm"
            >
              立即申請
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-amber-950 hover:bg-white/40 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* 行動裝置下拉選單 */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/70 backdrop-blur-xl border-b border-white/40 py-3 px-4 flex flex-col gap-2 shadow-inner">
          <button 
            onClick={() => handleNavClick('about')}
            className="text-left w-full px-4 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-white/40"
          >
            關於我們
          </button>
          <button 
            onClick={() => handleNavClick('pets')}
            className="text-left w-full px-4 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-white/40"
          >
            尋找伴侶
          </button>
          <button 
            onClick={() => handleNavClick('process')}
            className="text-left w-full px-4 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-white/40"
          >
            認養流程
          </button>
          
          <div className="h-[1px] bg-white/30 my-1 mx-4"></div>

          <button 
            onClick={() => handleTabChange('profile')}
            className={`flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl font-medium ${
              activeTab === 'profile' ? 'bg-white/60 text-amber-950 font-bold border border-white/50' : 'text-slate-700 hover:bg-white/40'
            }`}
          >
            <User className="w-4 h-4 text-amber-600" />
            個人資料設定
          </button>
          <button 
            onClick={() => handleTabChange('records')}
            className={`flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl font-medium ${
              activeTab === 'records' ? 'bg-white/60 text-amber-950 font-bold border border-white/50' : 'text-slate-700 hover:bg-white/40'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-amber-600" />
            申請記錄進度
          </button>

          <div className="h-[1px] bg-white/30 my-1 mx-4"></div>

          {currentUser ? (
            <div className="flex items-center justify-between px-4 py-2 bg-amber-50/50 rounded-xl mx-2 border border-amber-100/40">
              <span className="text-xs font-bold text-amber-950 truncate max-w-[150px]">
                👤 {currentUser.displayName || currentUser.email || '已登入領養人'}
              </span>
              <button 
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="text-xs font-bold text-rose-600 bg-white hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100"
              >
                登出
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl font-bold text-amber-900 hover:bg-amber-50"
            >
              <LogIn className="w-4 h-4 text-amber-600" />
              會員登入 / 註冊
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
