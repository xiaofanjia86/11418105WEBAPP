/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Heart, PawPrint, Sparkles, CheckCircle } from 'lucide-react';

interface HeroProps {
  scrollToSection: (id: string) => void;
}

export default function Hero({ scrollToSection }: HeroProps) {
  return (
    <header id="about" className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-amber-50/10 to-amber-100/5">
      {/* Background Decorative Shapes for active Glassmorphism depth */}
      <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-100/10 rounded-full filter blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* 左側文字區域 */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 text-center lg:text-left space-y-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/45 backdrop-blur-md text-amber-950 text-sm font-semibold tracking-wide border border-white/50 shadow-sm">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" /> 給牠一個溫暖的家
            </span>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 leading-tight">
              用領養代替購買<br />
              <span className="text-amber-600 flex items-center justify-center lg:justify-start gap-2 pt-1">
                開啟一段溫馨的陪伴 <Sparkles className="w-8 h-8 text-amber-500 fill-amber-500 inline-block" />
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              這裡的每一個眼神，都在期待一個溫暖的擁抱。我們提供完整的健康檢查與行為評估，協助您找到最合適的毛孩家人，攜手寫下幸福新篇章。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <button
                onClick={() => scrollToSection('pets')}
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-amber-300/40 hover:shadow-xl transition-all transform hover:-translate-y-1 text-center flex items-center justify-center gap-2"
              >
                <PawPrint className="w-5 h-5 fill-white text-white" /> 尋找投緣毛孩
              </button>
              
              <button
                onClick={() => scrollToSection('process')}
                className="bg-white/40 backdrop-blur-md hover:bg-white/60 text-slate-800 border border-white/50 px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:-translate-y-1 text-center shadow-sm"
              >
                瞭解認養須知
              </button>
            </div>
          </motion.div>
          
          {/* 右側精美主圖 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 relative"
          >
            <div className="absolute inset-0 bg-amber-400 rounded-3xl transform rotate-3 scale-105 opacity-25 blur-lg"></div>
            <div className="relative bg-white/35 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white/50">
              <img 
                src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1000" 
                alt="可愛的狗狗與貓咪" 
                className="rounded-2xl w-full h-[350px] object-cover shadow-inner"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute -bottom-6 -left-6 bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold">已成功媒合</p>
                  <p className="text-sm font-black text-slate-800">1,248+ 溫馨家庭</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </header>
  );
}
