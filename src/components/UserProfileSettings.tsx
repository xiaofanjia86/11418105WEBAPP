/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  getOrInitializeVisitorUid, 
  saveUserProfile, 
  getUserProfile 
} from '../services/dbService';
import { UserProfile } from '../types';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  FileCheck
} from 'lucide-react';

interface UserProfileSettingsProps {
  onProfileUpdated: (profile: UserProfile) => void;
  currentUid: string;
}

export default function UserProfileSettings({ onProfileUpdated, currentUid }: UserProfileSettingsProps) {
  
  const [profile, setProfile] = useState<UserProfile>({
    uid: currentUid,
    name: '',
    phone: '',
    email: '',
    address: '',
    hasPetExperience: 'yes',
    previousBreed: '',
    adoptionReason: '',
    otherSuggestions: ''
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 載入當前使用者的個人檔案
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await getUserProfile(currentUid);
        if (data) {
          setProfile(data);
          onProfileUpdated(data); // 同步回父組件
        } else {
          // 如果為新進入使用者尚未存檔，重置表單
          setProfile({
            uid: currentUid,
            name: '',
            phone: '',
            email: '',
            address: '',
            hasPetExperience: 'yes',
            previousBreed: '',
            adoptionReason: '',
            otherSuggestions: ''
          });
        }
      } catch (err) {
        console.error("載入個人資料失敗:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [currentUid]);

  // 格式驗證
  const validateField = (name: string, value: string) => {
    let errorMsg = '';
    if (name === 'phone') {
      const phonePattern = /^09\d{8}$|^0\d{1,2}-\d{6,8}$|^0\d{7,9}$/;
      const cleaned = value.trim().replace(/-/g, '');
      if (cleaned && !phonePattern.test(cleaned)) {
        errorMsg = '聯絡電話格式不正確 (如: 0912345678)';
      }
    } else if (name === 'email') {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (value.trim() && !emailPattern.test(value.trim())) {
        errorMsg = '電子信箱格式不正確 (如: example@mail.com)';
      }
    } else if (['name', 'address', 'adoptionReason'].includes(name)) {
      if (!value.trim()) {
        errorMsg = '此欄位為必填項目';
      }
    } else if (name === 'previousBreed' && profile.hasPetExperience === 'yes') {
      if (!value.trim()) {
        errorMsg = '請輸入您上一隻寵物的品種';
      }
    }

    setErrors(prev => ({
      ...prev,
      [name]: errorMsg
    }));

    return errorMsg === '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => {
      const updated = { ...prev, [name]: value };
      // 如果切換沒有養過寵物，清空品種並重設品種錯誤
      if (name === 'hasPetExperience' && value === 'no') {
        updated.previousBreed = '';
        setErrors(errs => ({ ...errs, previousBreed: '' }));
      }
      return updated;
    });
    
    // 即時驗證
    validateField(name, value);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 全體欄位驗證
    const fieldsToValidate = ['name', 'phone', 'email', 'address', 'adoptionReason'];
    if (profile.hasPetExperience === 'yes') {
      fieldsToValidate.push('previousBreed');
    }

    let isValid = true;
    fieldsToValidate.forEach(field => {
      const fieldValid = validateField(field, (profile as any)[field] || '');
      if (!fieldValid) isValid = false;
    });

    if (!isValid) {
      const firstErrorField = Object.keys(errors).find(key => errors[key]);
      if (firstErrorField) {
        const el = document.getElementsByName(firstErrorField)[0];
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      setSaving(true);
      await saveUserProfile(profile);
      onProfileUpdated(profile);
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    } catch (err) {
      console.error("儲存個人設定失敗:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-transparent">
        <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-600 mt-4 font-medium animate-pulse">個人設定載入中...</p>
      </div>
    );
  }

  return (
    <section className="py-12 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-amber-605 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 fill-amber-500 text-amber-500" /> Account Settings
          </span>
          <h2 className="text-3xl font-extrabold text-slate-800 mt-1">個人資料設定</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto my-3 rounded-full"></div>
          <p className="text-slate-600 text-sm">
            在此編輯您的基礎通訊方式與家庭認養背景。編輯後的資訊將同步儲存於 Firestore，並可在您填寫認養申請單時「自動代入」，無需重複填寫。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 左側：精美履歷預覽卡 */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-slate-900/80 backdrop-blur-md text-white rounded-3xl p-6 shadow-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between min-h-[340px]">
              {/* 背景網紋與微光 */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-amber-600/25 rounded-full blur-2xl -z-10 animate-pulse" style={{ animationDuration: '8s' }}></div>
              
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-amber-600/80 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/15">
                    領養人數位身分卡
                  </span>
                  <FileCheck className="w-5 h-5 text-amber-300" />
                </div>
                
                <h3 className="text-2xl font-black mb-1">{profile.name || "未填寫姓名"}</h3>
                <p className="text-xs text-amber-400/80 font-mono tracking-wider mb-6 opacity-85">
                  ID: {profile.uid.substring(0, 16)}...
                </p>

                <div className="space-y-3.5 text-sm text-yellow-50/90">
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{profile.phone || "尚未設定聯絡電話"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">{profile.email || "尚未設定電子信箱"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="line-clamp-1">{profile.address || "尚未設定居住地址"}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-amber-300/80">
                <span>過往經驗: {profile.hasPetExperience === 'yes' ? `有 (${profile.previousBreed || '未載明'})` : '無'}</span>
                <span className="bg-white/10 text-amber-250 px-2 py-0.5 rounded border border-white/15 font-bold">
                  已同步
                </span>
              </div>
            </div>

            <div className="bg-white/35 backdrop-blur-md rounded-3xl p-5 border border-white/50 shadow-sm text-xs text-slate-500 leading-relaxed space-y-2">
              <p className="font-bold text-slate-805 flex items-center gap-1 text-sm mb-1">
                <HelpCircle className="w-4 h-4 text-amber-650" /> 隱私與安全說明
              </p>
              <p>我們十分重視領養人的隱私。您填載的所有個人通訊資料將完全儲存在 Google Firestore 安全資料庫中，僅供認養媒合用途與領養進度跟進審核，絕不會洩漏予任何第三方或作為廣告使用。</p>
            </div>
          </div>

          {/* 右側：編輯表單 */}
          <div className="lg:col-span-8 bg-white/35 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/50 shadow-xl relative">
            
            {saveSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-emerald-50 border border-emerald-250 rounded-xl flex items-center gap-3 text-emerald-900 shadow-sm"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-sm">個人履歷修改成功！</p>
                  <p className="text-xs text-emerald-700/90">最新資訊已成功同步寫入 Firestore 安全資料庫。</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 姓名 */}
                <div>
                  <label className="block text-sm font-bold text-slate-705 mb-2 flex items-center gap-1">
                    領養人姓名 <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-amber-700">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      name="name"
                      required
                      value={profile.name}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-4 py-3 glass-input rounded-xl outline-none text-slate-800 transition-all ${
                        errors.name ? 'border-rose-500 focus:ring-2 focus:ring-rose-200' : ''
                      }`}
                      placeholder="請填入您的真實姓名"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.name}
                    </p>
                  )}
                </div>

                {/* 聯絡電話 */}
                <div>
                  <label className="block text-sm font-bold text-slate-705 mb-2">
                    聯絡電話 <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-amber-700">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={profile.phone}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-4 py-3 glass-input rounded-xl outline-none text-slate-800 transition-all ${
                        errors.phone ? 'border-rose-500 focus:ring-2 focus:ring-rose-200' : ''
                      }`}
                      placeholder="例如: 0912345678"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* 電子信箱 */}
              <div>
                <label className="block text-sm font-bold text-slate-705 mb-2">
                  電子信箱 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-amber-700">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    value={profile.email}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-4 py-3 glass-input rounded-xl outline-none text-slate-800 transition-all ${
                      errors.email ? 'border-rose-500 focus:ring-2 focus:ring-rose-200' : ''
                    }`}
                    placeholder="請輸入電子信箱，以接收進度通知"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>

              {/* 居住地址 */}
              <div>
                <label className="block text-sm font-bold text-slate-705 mb-2">
                  居住地址 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-amber-700">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="address"
                    required
                    value={profile.address}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-4 py-3 glass-input rounded-xl outline-none text-slate-800 transition-all ${
                      errors.address ? 'border-rose-500 focus:ring-2 focus:ring-rose-200' : ''
                    }`}
                    placeholder="請輸入您目前居住的詳細地址"
                  />
                </div>
                {errors.address && (
                  <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.address}
                  </p>
                )}
              </div>

              {/* 養寵物經驗 */}
              <div>
                <label className="block text-sm font-bold text-slate-705 mb-3">
                  是否有飼養過寵物的經驗？ <span className="text-rose-500">*</span>
                </label>
                <select
                  name="hasPetExperience"
                  value={profile.hasPetExperience}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-amber-205 outline-none text-slate-805 transition-all"
                >
                  <option value="yes">有飼養經驗</option>
                  <option value="no">無飼養經驗</option>
                </select>
              </div>

              {/* 上一隻品種（僅在 yes 時顯示） */}
              {profile.hasPetExperience === 'yes' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="block text-sm font-bold text-slate-705">
                    上一隻寵物是什麼品種？ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="previousBreed"
                    required={profile.hasPetExperience === 'yes'}
                    value={profile.previousBreed}
                    onChange={handleInputChange}
                    className={`block w-full px-4 py-3 glass-input rounded-xl outline-none text-slate-805 transition-all ${
                      errors.previousBreed ? 'border-rose-500 focus:ring-2 focus:ring-rose-200' : ''
                    }`}
                    placeholder="例如：柴犬、米克斯貓、波斯貓"
                  />
                  {errors.previousBreed && (
                    <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.previousBreed}
                    </p>
                  )}
                </motion.div>
              )}

              {/* 自我介紹與領養原因 */}
              <div>
                <label className="block text-sm font-bold text-slate-705 mb-2">
                  親自概述與認養原因 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="adoptionReason"
                  required
                  rows={4}
                  value={profile.adoptionReason}
                  onChange={handleInputChange}
                  maxLength={600}
                  className={`block w-full px-4 py-3 glass-input rounded-xl outline-none text-slate-850 transition-all resize-none ${
                    errors.adoptionReason ? 'border-rose-500 focus:ring-2 focus:ring-rose-200' : ''
                  }`}
                  placeholder="請簡述您的起心動念、日常環境規劃或能給予毛孩怎樣的陪伴、生活起居..."
                />
                <div className="flex justify-between items-center mt-1.5">
                  <span className="text-rose-500 text-xs">
                    {errors.adoptionReason && (
                      <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.adoptionReason}</span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {profile.adoptionReason.length}/600 字
                  </span>
                </div>
              </div>

              {/* 其他想法與備註 */}
              <div>
                <label className="block text-sm font-bold text-slate-705 mb-2">
                  其他想法與補充 (選填)
                </label>
                <textarea
                  name="otherSuggestions"
                  rows={2}
                  value={profile.otherSuggestions || ''}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 glass-input rounded-xl outline-none text-slate-850 transition-all resize-none"
                  placeholder="例：想詢問其他特定細節，或是有特殊照護預備事項..."
                />
              </div>

              {/* 送出與儲存 */}
              <div className="pt-4 border-t border-white/20 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-400 text-white font-bold py-3.5 px-10 rounded-xl tracking-wider transition-all shadow-md shadow-amber-300/20 active:scale-95 flex items-center justify-center gap-2 text-sm"
                >
                  <Save className="w-4 h-4" />
                  {saving ? '同步與儲存中...' : '儲存履歷設定'}
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </section>
  );
}
