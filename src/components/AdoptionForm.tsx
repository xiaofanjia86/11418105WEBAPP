/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { saveApplication } from '../services/dbService';
import { UserProfile, Pet } from '../types';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Smile, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Sparkles,
  ClipboardCheck,
  Check,
  AlertCircle
} from 'lucide-react';

interface AdoptionFormProps {
  selectedPet: Pet | null;
  onClearSelectedPet: () => void;
  userProfile: UserProfile | null;
  onApplicationSubmitted: (appDetails: any) => void;
}

export default function AdoptionForm({ 
  selectedPet, 
  onClearSelectedPet, 
  userProfile, 
  onApplicationSubmitted 
}: AdoptionFormProps) {
  
  const [step, setStep] = useState<1 | 2>(1);
  
  // 表單資料 state
  const [adopterName, setAdopterName] = useState('');
  const [adopterPhone, setAdopterPhone] = useState('');
  const [adopterEmail, setAdopterEmail] = useState('');
  const [adopterAddress, setAdopterAddress] = useState('');
  const [hasPetExperience, setHasPetExperience] = useState<'yes' | 'no'>('yes');
  const [previousBreed, setPreviousBreed] = useState('');
  const [adoptionReason, setAdoptionReason] = useState('');
  const [otherSuggestions, setOtherSuggestions] = useState('');

  // 獨立即時錯誤
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // 一鍵填入提示旗標
  const [showAutoFillAlert, setShowAutoFillAlert] = useState(false);

  // 當使用者在個人設定中已經有資料，且表單尚未填寫時，提供一鍵填入
  useEffect(() => {
    if (userProfile && userProfile.name && adopterName === '') {
      setShowAutoFillAlert(true);
    } else {
      setShowAutoFillAlert(false);
    }
  }, [userProfile]);

  const handleAutoFill = () => {
    if (!userProfile) return;
    setAdopterName(userProfile.name || '');
    setAdopterPhone(userProfile.phone || '');
    setAdopterEmail(userProfile.email || '');
    setAdopterAddress(userProfile.address || '');
    setHasPetExperience(userProfile.hasPetExperience || 'yes');
    setPreviousBreed(userProfile.previousBreed || '');
    setAdoptionReason(userProfile.adoptionReason || '');
    setOtherSuggestions(userProfile.otherSuggestions || '');
    
    // 清除一鍵填入提示與錯誤狀態
    setShowAutoFillAlert(false);
    setErrors({});
  };

  // 驗證電話 (台規)
  const validatePhone = (num: string) => {
    const phonePattern = /^09\d{8}$|^0\d{1,2}-\d{6,8}$|^0\d{7,9}$/;
    const cleaned = num.trim().replace(/-/g, '');
    if (!cleaned) return '聯絡電話為必填項';
    if (!phonePattern.test(cleaned)) return '請輸入正確的行動電話格式如 0912345678';
    return '';
  };

  // 驗證 Email
  const validateEmail = (mail: string) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!mail.trim()) return '電子信箱為必填項';
    if (!emailPattern.test(mail.trim())) return '請輸入正確格式的 Email 位址';
    return '';
  };

  const handleNextStep = () => {
    const newErrors: { [key: string]: string } = {};
    if (!adopterName.trim()) newErrors.adopterName = '領養人姓名為必填項';
    
    const phoneErr = validatePhone(adopterPhone);
    if (phoneErr) newErrors.adopterPhone = phoneErr;
    
    const emailErr = validateEmail(adopterEmail);
    if (emailErr) newErrors.adopterEmail = emailErr;
    
    if (!adopterAddress.trim()) newErrors.adopterAddress = '居住地址為必填項';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};
    if (hasPetExperience === 'yes' && !previousBreed.trim()) {
      newErrors.previousBreed = '有飼育經驗者，請寫上曾經歷過的一種品種';
    }
    if (!adoptionReason.trim()) {
      newErrors.adoptionReason = '領養念頭及環境安排為必填項';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      
      const payload = {
        petId: selectedPet ? selectedPet.id : 'any_pet',
        petName: selectedPet ? selectedPet.name : '對緣毛孩 (任意特定對象)',
        petImageUrl: selectedPet ? selectedPet.imageUrl : 'https://placehold.co/100/f6e5d3/673b1f?text=Any+Pet',
        adopterName,
        adopterPhone,
        adopterEmail,
        adopterAddress,
        hasPetExperience,
        previousBreed: hasPetExperience === 'yes' ? previousBreed : '',
        adoptionReason,
        otherSuggestions
      };

      const docId = await saveApplication(payload);
      
      // 觸發送件成功，把資料送出讓 Modal 讀取
      onApplicationSubmitted({
        id: docId,
        ...payload,
        status: '審核中',
        createdAt: new Date()
      });

      // 重置表單
      setStep(1);
      setAdopterName('');
      setAdopterPhone('');
      setAdopterEmail('');
      setAdopterAddress('');
      setHasPetExperience('yes');
      setPreviousBreed('');
      setAdoptionReason('');
      setOtherSuggestions('');
      setErrors({});
      onClearSelectedPet();

    } catch (err) {
      console.error("呈遞申請失敗:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="adopt-form-section" className="py-20 bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 標題與簡介 */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-amber-800 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-1">
            <ClipboardCheck className="w-5 h-5 text-amber-600 animate-bounce" /> Application Form
          </span>
          <h2 className="text-3xl font-extrabold text-slate-800 mt-1">填寫認養意願申請表</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto my-3 rounded-full"></div>
          <p className="text-slate-600 text-sm">
            本表單將即時登記並建檔至 Firestore。建檔完成後，志工團隊將立刻進入家庭審核與電話約訪程序。
          </p>
        </div>

        {/* 智慧自動填寫提示 */}
        {showAutoFillAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-white/45 backdrop-blur-md border border-white/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-700 fill-amber-500 shrink-0" />
              <div className="text-left">
                <p className="font-bold text-sm text-slate-800">偵測到已儲存的個人檔案！</p>
                <p className="text-xs text-slate-500">您可以點擊右側一鍵代入，加速本次意願書的填載。</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAutoFill}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-xl text-xs tracking-wider shadow-sm transition-all whitespace-nowrap active:scale-95"
            >
              🚀 帶入個人設定
            </button>
          </motion.div>
        )}

        {/* 當前選擇認養對象提示框 */}
        {selectedPet && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 bg-white/45 backdrop-blur-md border border-white/50 rounded-3xl p-4.5 flex items-center justify-between shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/60 shrink-0 shadow-sm animate-fade-in">
                <img 
                  src={selectedPet.imageUrl} 
                  alt={selectedPet.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-bold">您當前特意鎖定的認養志向：</p>
                <p className="text-xl font-black text-slate-800 flex items-center gap-1">
                  {selectedPet.name} <span className="text-xs font-medium text-slate-400">({selectedPet.breed})</span>
                </p>
              </div>
            </div>
            
            <button 
              type="button" 
              onClick={onClearSelectedPet} 
              className="text-slate-500 hover:text-rose-500 text-xs font-bold transition-colors"
            >
              清除選擇 / 任意皆可
            </button>
          </motion.div>
        )}

        {/* 表單大骨架卡片 */}
        <div className="glass-panel-heavy rounded-[32px] overflow-hidden">
          
          {/* 步驟標籤狀態條 */}
          <div className="bg-white/20 px-8 py-6 flex items-center justify-between border-b border-white/20">
            <div className="flex items-center gap-4 w-full justify-around sm:justify-start sm:gap-12 text-sm">
              
              {/* 步驟 1 */}
              <div className="flex items-center gap-2.5">
                <span className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs transition-with-shadow border ${
                  step === 1 
                    ? 'bg-amber-600 text-white border-white/30 shadow-md shadow-amber-300/30 font-extrabold' 
                    : 'bg-emerald-500 text-white border-white/30'
                }`}>
                  {step === 1 ? '1' : <Check className="w-4 h-4" />}
                </span>
                <span className={`font-bold ${step === 1 ? 'text-slate-800' : 'text-slate-400'} hidden sm:inline`}>
                  領養人基本資訊
                </span>
              </div>

              {/* 連接線 */}
              <div className={`hidden sm:block h-[1px] w-16 transition-colors duration-300 ${step === 2 ? 'bg-amber-600' : 'bg-white/40'}`}></div>

              {/* 步驟 2 */}
              <div className="flex items-center gap-2.5">
                <span className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs transition-all border ${
                  step === 2 
                    ? 'bg-amber-600 text-white border-white/40 shadow-md shadow-amber-300/30' 
                    : 'bg-white/40 text-slate-600 border-white/30'
                }`}>
                  2
                </span>
                <span className={`font-bold ${step === 2 ? 'text-slate-800' : 'text-slate-400'} hidden sm:inline`}>
                  家庭狀況調查表
                </span>
              </div>
            </div>
          </div>

          {/* 表單實體 */}
          <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-8 text-left">
            
            {/* 步驟 1 欄位群組 */}
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 姓名 */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">領養人姓名 <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-amber-700">
                        <User className="w-4 h-4" />
                      </span>
                      <input 
                        type="text" 
                        required
                        value={adopterName}
                        onChange={(e) => {
                          setAdopterName(e.target.value);
                          if(errors.adopterName) setErrors(prev => ({ ...prev, adopterName: '' }));
                        }}
                        className={`block w-full pl-10 pr-4 py-3 glass-input rounded-xl outline-none text-slate-800 transition-all ${
                          errors.adopterName ? 'border-rose-500 !bg-rose-50/10 focus:ring-2 focus:ring-rose-200' : ''
                        }`}
                        placeholder="請輸入您的真實姓名"
                      />
                    </div>
                    {errors.adopterName && <p className="text-xs text-rose-500 mt-1">{errors.adopterName}</p>}
                  </div>

                  {/* 電話 */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">聯絡電話 <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-amber-700">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input 
                        type="tel" 
                        required
                        value={adopterPhone}
                        onChange={(e) => {
                          setAdopterPhone(e.target.value);
                          if(errors.adopterPhone) setErrors(prev => ({ ...prev, adopterPhone: '' }));
                        }}
                        className={`block w-full pl-10 pr-4 py-3 glass-input rounded-xl outline-none text-slate-800 transition-all ${
                          errors.adopterPhone ? 'border-rose-500 !bg-rose-50/10 focus:ring-2 focus:ring-rose-200' : ''
                        }`}
                        placeholder="例如: 0912345678"
                      />
                    </div>
                    {errors.adopterPhone && <p className="text-xs text-rose-500 mt-1">{errors.adopterPhone}</p>}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">電子信箱 <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-amber-700">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input 
                      type="email" 
                      required
                      value={adopterEmail}
                      onChange={(e) => {
                        setAdopterEmail(e.target.value);
                        if(errors.adopterEmail) setErrors(prev => ({ ...prev, adopterEmail: '' }));
                      }}
                      className={`block w-full pl-10 pr-4 py-3 glass-input rounded-xl outline-none text-slate-800 transition-all ${
                        errors.adopterEmail ? 'border-rose-500 !bg-rose-50/10 focus:ring-2 focus:ring-rose-200' : ''
                      }`}
                      placeholder="請輸入電子信箱，接收審查案最新結果"
                    />
                  </div>
                  {errors.adopterEmail && <p className="text-xs text-rose-500 mt-1">{errors.adopterEmail}</p>}
                </div>

                {/* 住址 */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">居住地址 <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-amber-700">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      required
                      value={adopterAddress}
                      onChange={(e) => {
                        setAdopterAddress(e.target.value);
                        if(errors.adopterAddress) setErrors(prev => ({ ...prev, adopterAddress: '' }));
                      }}
                      className={`block w-full pl-10 pr-4 py-3 glass-input rounded-xl outline-none text-slate-800 transition-all ${
                        errors.adopterAddress ? 'border-rose-500 !bg-rose-50/10 focus:ring-2 focus:ring-rose-200' : ''
                      }`}
                      placeholder="請填入當前平常起居的詳細地址"
                    />
                  </div>
                  {errors.adopterAddress && <p className="text-xs text-rose-500 mt-1">{errors.adopterAddress}</p>}
                </div>

                {/* 導向下一步 */}
                <div className="pt-4 flex justify-end">
                  <button 
                    type="button" 
                    onClick={handleNextStep}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    下一步：家庭背景調查 <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* 步驟 2 欄位群組 */}
            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* 飼育經驗 */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">1. 是否有飼養過寵物的經驗？ <span className="text-rose-500">*</span></label>
                  <div className="grid grid-cols-2 gap-4">
                    <label 
                      onClick={() => setHasPetExperience('yes')}
                      className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                        hasPetExperience === 'yes' ? 'border-2 border-amber-600 bg-white/50' : 'border-white/40 bg-white/20 hover:bg-white/35'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="experience"
                          checked={hasPetExperience === 'yes'}
                          onChange={() => {}}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-400" 
                        />
                        <span className="text-sm font-bold text-slate-800">有飼養經驗</span>
                      </div>
                      <CheckCircle className={`w-5 h-5 ${hasPetExperience === 'yes' ? 'text-amber-600 fill-amber-100/40' : 'text-slate-300'}`} />
                    </label>

                    <label 
                      onClick={() => {
                        setHasPetExperience('no');
                        setPreviousBreed('');
                      }}
                      className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                        hasPetExperience === 'no' ? 'border-2 border-amber-600 bg-white/50' : 'border-white/40 bg-white/20 hover:bg-white/35'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="experience"
                          checked={hasPetExperience === 'no'}
                          onChange={() => {}}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-400" 
                        />
                        <span className="text-sm font-bold text-slate-800">無飼養經驗</span>
                      </div>
                      <Smile className={`w-5 h-5 ${hasPetExperience === 'no' ? 'text-amber-600 fill-amber-100/40' : 'text-slate-300'}`} />
                    </label>
                  </div>
                </div>

                {/* 比照前一隻品種 */}
                {hasPetExperience === 'yes' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label className="block text-sm font-bold text-slate-700 mb-2">2. 上一隻寵物是什麼品種？ <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      required={hasPetExperience === 'yes'}
                      value={previousBreed}
                      onChange={(e) => {
                        setPreviousBreed(e.target.value);
                        if(errors.previousBreed) setErrors(prev => ({ ...prev, previousBreed: '' }));
                      }}
                      className={`block w-full px-4 py-3 glass-input rounded-xl outline-none text-slate-800 transition-all ${
                        errors.previousBreed ? 'border-rose-500 focus:ring-2 focus:ring-rose-200' : ''
                      }`}
                      placeholder="例如：米克斯貓、柴犬、波斯貓"
                    />
                    {errors.previousBreed && <p className="text-xs text-rose-500 mt-1.5">{errors.previousBreed}</p>}
                  </motion.div>
                )}

                {/* 領養動機 */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">3. 這次為什麼想領養寵物？ <span className="text-rose-500">*</span></label>
                  <textarea 
                    rows={4} 
                    required
                    value={adoptionReason}
                    onChange={(e) => {
                      setAdoptionReason(e.target.value);
                      if(errors.adoptionReason) setErrors(prev => ({ ...prev, adoptionReason: '' }));
                    }}
                    className={`block w-full px-4 py-3 glass-input rounded-xl outline-none text-slate-800 transition-all resize-none ${
                      errors.adoptionReason ? 'border-rose-500 focus:ring-2 focus:ring-rose-250' : ''
                    }`}
                    placeholder="請簡述您的起心動念、日常環境規劃或能給予毛孩怎樣的陪伴、預算準備..."
                  />
                  {errors.adoptionReason && <p className="text-xs text-rose-500 mt-1">{errors.adoptionReason}</p>}
                </div>

                {/* 備註與建議 */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">4. 其他建議與想法 (選填)</label>
                  <textarea 
                    rows={2} 
                    value={otherSuggestions}
                    onChange={(e) => setOtherSuggestions(e.target.value)}
                    className="block w-full px-4 py-3 glass-input rounded-xl outline-none text-slate-800 transition-all resize-none"
                    placeholder="如對本機構流程有任何事項和想詢問，歡迎在此說明"
                  />
                </div>

                {/* 表單按鈕列 (上一步、送出) */}
                <div className="pt-4 border-t border-white/20 flex flex-col sm:flex-row gap-4 justify-between">
                  <button 
                    type="button" 
                    onClick={handlePrevStep}
                    className="bg-white/40 border border-white/50 text-slate-700 hover:bg-white/60 px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> 上一步：修改基本資訊
                  </button>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white px-10 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-300/30 transform hover:-translate-y-0.5 active:scale-95 text-sm"
                  >
                    <ClipboardCheck className="w-4 h-4" /> 
                    {submitting ? '呈遞寫入中...' : '遞交認養申請'}
                  </button>
                </div>
              </motion.div>
            )}

          </form>
        </div>

      </div>
    </section>
  );
}
