/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getApplications } from '../services/dbService';
import { AdoptionApplication } from '../types';
import { 
  ClipboardList, 
  Search, 
  RefreshCw, 
  Timer, 
  CheckCircle, 
  XCircle, 
  PawPrint,
  Heart
} from 'lucide-react';

interface ApplicationRecordsProps {
  userPhone?: string;
}

export default function ApplicationRecords({ userPhone }: ApplicationRecordsProps) {
  const [phone, setPhone] = useState<string>(userPhone || '');
  const [records, setRecords] = useState<AdoptionApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 當 profile 電話變更時，若有值，自動撈取
  useEffect(() => {
    if (userPhone) {
      setPhone(userPhone);
      fetchRecords(userPhone);
    }
  }, [userPhone]);

  const fetchRecords = async (searchPhone: string) => {
    if (!searchPhone.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getApplications(searchPhone.trim());
      setRecords(data);
      setHasSearched(true);
    } catch (err) {
      console.error("讀取歷史申請失敗:", err);
      setError("無法讀取資料，請確認網路或 Firestore 狀態。");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords(phone);
  };

  const getStatusStyle = (status: AdoptionApplication['status']) => {
    switch (status) {
      case '已同意':
        return {
          bg: 'bg-emerald-55 border bg-emerald-500/10 text-emerald-800 border-emerald-550/30 backdrop-blur-sm',
          dot: 'bg-emerald-500',
          icon: <CheckCircle className="w-5 h-5 text-emerald-600" />
        };
      case '已婉拒':
        return {
          bg: 'bg-slate-35 border bg-slate-400/10 text-slate-705 border-slate-405/20 backdrop-blur-sm',
          dot: 'bg-slate-400',
          icon: <XCircle className="w-5 h-5 text-slate-500" />
        };
      default: // 審核中
        return {
          bg: 'bg-amber-35 border bg-amber-500/10 text-amber-805 border-amber-500/30 backdrop-blur-sm',
          dot: 'bg-amber-500 animate-pulse',
          icon: <Timer className="w-5 h-5 text-amber-600" />
        };
    }
  };

  return (
    <section className="py-12 bg-transparent min-h-[480px]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 標題與簡介 */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-amber-605 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-1">
            <ClipboardList className="w-4 h-4 text-amber-600" /> Tracking System
          </span>
          <h2 className="text-3xl font-extrabold text-slate-800 mt-1">領養審核進度查詢</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto my-3 rounded-full"></div>
          <p className="text-slate-600 text-sm">
            請在下方輸入遞交申請時填寫的「聯絡電話」。我們將由專屬志工持續進行背景審查與環境評估。
          </p>
        </div>

        {/* 搜尋列 */}
        <div className="glass-panel p-6 rounded-3xl mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-amber-600">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="請輸入遞交申請的聯絡電話 (如過往已在設定預留，將自動填入)"
                className="block w-full pl-11 pr-4 py-3.5 glass-input rounded-2xl outline-none text-slate-800 font-medium placeholder-slate-400"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              查詢認養進度
            </button>
          </form>

          {userPhone && (
            <p className="text-center text-[11px] text-amber-800/80 font-medium mt-3">
              💡 系統提示：已自動依據您的「個人資料設定」聯絡電話進行同步檢索。
            </p>
          )}
        </div>

        {/* 查詢結果區 */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 font-medium animate-pulse">正在為您連線 Firestore 資料庫...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-rose-50/60 backdrop-blur-md border border-rose-100 rounded-2xl p-6 text-rose-850 text-sm font-semibold">
            {error}
          </div>
        ) : hasSearched && records.length === 0 ? (
          <div className="bg-white/45 backdrop-blur-md rounded-3xl p-12 text-center border border-white/50 shadow-sm space-y-3">
            <p className="text-slate-700 font-bold text-lg">查無送件記錄 🔍</p>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              此聯絡電話：<span className="font-mono text-amber-800 font-bold">{phone}</span> 尚未向本系統投過任何認養申請，或尚未核可。您可以前往「尋找伴侶」選擇一隻投緣的毛孩，並送出線上認養申請。
            </p>
          </div>
        ) : hasSearched ? (
          /* 多條申請記錄 Timeline 清單 */
          <div className="space-y-6">
            <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
              <span>共檢索引出 {records.length} 筆認養投遞案</span>
              <button 
                onClick={() => fetchRecords(phone)}
                className="text-amber-605 hover:text-amber-800 flex items-center gap-1 font-extrabold"
              >
                <RefreshCw className="w-3 h-3" />手動重新整理
              </button>
            </div>

            {records.map((record, index) => {
              const style = getStatusStyle(record.status);
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="glass-card rounded-[32px] overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/20"
                >
                  {/* 左：寵物頭像與資訊 */}
                  <div className="md:w-1/3 bg-white/10 p-6 flex flex-col items-center text-center justify-center space-y-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/60 shadow-md relative">
                      <img 
                        src={record.petImageUrl} 
                        alt={record.petName} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as any).src = "https://placehold.co/100/f6e5d3/673b1f?text=" + record.petName[0];
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-800 flex items-center justify-center gap-1">
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                        {record.petName}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-1">案編: {record.id.substring(0, 10)}</p>
                    </div>
                  </div>

                  {/* 右：進度詳情與表單資料概覽 */}
                  <div className="p-6 md:w-2/3 flex-1 flex flex-col justify-between space-y-4 md:space-y-6">
                    {/* 案件狀態標章 */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold ${style.bg}`}>
                        <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
                        狀態：{record.status}
                      </div>
                      
                      <span className="text-xs text-slate-400 font-bold">
                        成表日期：{new Date(record.createdAt).toLocaleDateString('zh-TW')} {new Date(record.createdAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* 個人簡報摘要 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-650 bg-white/45 p-4 border border-white/40 rounded-2xl">
                      <p><strong>申請姓名：</strong>{record.adopterName}</p>
                      <p><strong>聯絡電話：</strong>{record.adopterPhone}</p>
                      <p className="sm:col-span-2"><strong>電子信箱：</strong>{record.adopterEmail}</p>
                      <p className="sm:col-span-2"><strong>當前住址：</strong>{record.adopterAddress}</p>
                      <p><strong>飼育經驗：</strong>{record.hasPetExperience === 'yes' ? `有 (${record.previousBreed})` : '新手領養'}</p>
                    </div>

                    {/* 自述動機 */}
                    <div className="text-xs leading-relaxed text-slate-600 bg-white/30 backdrop-blur-sm p-3.5 rounded-xl border border-white/40">
                      <p className="font-bold text-slate-700 mb-1">📋 認養動機與環境安排：</p>
                      <p className="line-clamp-3" title={record.adoptionReason}>{record.adoptionReason}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* 初置導引 banner */
          <div className="bg-white/45 backdrop-blur-md rounded-[32px] p-8 border border-dashed border-white/60 text-center space-y-4 max-w-xl mx-auto">
            <PawPrint className="w-12 h-12 text-amber-600 mx-auto animate-bounce" />
            <div>
              <p className="text-slate-800 font-bold text-base">輸入電話查進件進度</p>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                如果您尚未在「個人資料設定」完成填寫，請在上方搜尋欄位直接輸入聯絡電話。一經按下搜尋，系統會立即從 Firestore 取得屬於您的精細實時狀態。
              </p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
