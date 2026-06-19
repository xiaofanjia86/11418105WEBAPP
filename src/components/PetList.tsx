/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getPets } from '../services/dbService';
import { Pet } from '../types';
import { Clock, Bone, Heart, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface PetListProps {
  onSelectPet: (pet: Pet) => void;
}

export default function PetList({ onSelectPet }: PetListProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [filter, setFilter] = useState<'all' | 'dog' | 'cat'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPets() {
      try {
        setLoading(true);
        const data = await getPets();
        setPets(data);
      } catch (err) {
        console.error("載入寵物資料失敗:", err);
        setError("無法載入寵物清單，請稍後再試。");
      } finally {
        setLoading(false);
      }
    }
    loadPets();
  }, []);

  const filteredPets = pets.filter(pet => {
    if (filter === 'all') return true;
    return pet.type === filter;
  });

  return (
    <section id="pets" className="py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 標題區 */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-amber-600 font-bold uppercase tracking-wider text-sm">Waiting for you</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-2">待認養的可愛毛孩</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto my-4 rounded-full"></div>
          <p className="text-slate-600">
            不論是活潑熱情的狗狗，還是溫柔安靜的貓咪，他們都在這裡等著與你相遇。點選「申請認養」，即可自動帶入申請表單。
          </p>
        </div>

        {/* 篩選標籤按鈕 */}
        <div className="flex justify-center flex-wrap gap-3 mb-12">
          {(['all', 'dog', 'cat'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all border shadow-sm backdrop-blur-md ${
                filter === type
                  ? 'bg-amber-600/90 text-white border-white/40 shadow-md shadow-amber-300/30'
                  : 'bg-white/40 hover:bg-white/60 text-slate-700 border-white/45'
              }`}
            >
              {type === 'all' && '顯示全部伴侶'}
              {type === 'dog' && '活潑狗狗 🐶'}
              {type === 'cat' && '優雅貓咪 🐱'}
            </button>
          ))}
        </div>

        {/* Loading 與 錯誤 顯示 */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-amber-250 border-t-amber-600 rounded-full animate-spin"></div>
            <p className="text-amber-805 font-medium animate-pulse">與毛孩連線中，請稍候...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-red-50/60 backdrop-blur-md rounded-2xl border border-red-100 p-6 max-w-lg mx-auto">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-900 font-black mb-1">{error}</p>
            <p className="text-xs text-red-500">此錯誤通常與 Firebase 設定或網路狀態有關。</p>
          </div>
        ) : filteredPets.length === 0 ? (
          <div className="text-center py-16 bg-slate-50/60 backdrop-blur-md border border-slate-100 rounded-2xl p-6">
            <p className="text-slate-500">目前沒有符合該篩選條件的毛孩。</p>
          </div>
        ) : (
          /* 寵物清單 Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPets.map((pet, index) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
                className="glass-card rounded-[32px] overflow-hidden flex flex-col group"
              >
                {/* 寵物照片、標章 */}
                <div className="relative overflow-hidden h-64 bg-amber-50/20">
                  <img
                    src={pet.imageUrl}
                    alt={pet.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute top-4 right-4 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm backdrop-blur-md border border-white/20 flex items-center gap-1 ${
                    pet.status === '待認養' ? 'bg-emerald-500/80' : 'bg-slate-400/85'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {pet.status}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/45 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1">
                    <Bone className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    {pet.breed}
                  </div>
                </div>

                {/* 寵物資訊區 */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-slate-800">{pet.name}</h3>
                      <span className={`text-sm flex items-center gap-1 font-semibold ${
                        pet.gender === '公' ? 'text-blue-500' : 'text-pink-500'
                      }`}>
                        {pet.gender === '公' ? '♂' : '♀'} {pet.gender}
                      </span>
                    </div>

                    {/* 年齡與體型特色 */}
                    <div className="flex items-center gap-4 text-xs font-bold text-amber-950 bg-white/45 backdrop-blur-sm p-2.5 rounded-xl border border-white/50 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> 年齡：{pet.age}
                      </span>
                      <span className="text-amber-200/50">|</span>
                      <span>體型：{pet.size}</span>
                    </div>

                    {/* 個性標籤 */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {pet.personality.map((tag) => (
                        <span
                          key={tag}
                          className="bg-white/55 backdrop-blur-sm text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full border border-white/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* 發源故事 */}
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                      {pet.story}
                    </p>
                  </div>

                  {/* 認養連結區 */}
                  <div className="pt-4 border-t border-white/30">
                    <button
                      type="button"
                      disabled={pet.status !== '待認養'}
                      onClick={() => onSelectPet(pet)}
                      className={`w-full font-bold py-3 px-4 rounded-xl transition-all border flex items-center justify-center gap-2 text-sm shadow-sm ${
                        pet.status === '待認養'
                          ? 'bg-amber-100/60 hover:bg-amber-600 text-amber-900 hover:text-white border-white/45 hover:border-amber-650'
                          : 'bg-white/20 border-white/20 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500 group-hover:text-white group-hover:fill-white" />
                      {pet.status === '待認養' ? `申請認養 ${pet.name.split(' ')[0]}` : '已被有緣人領養'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
