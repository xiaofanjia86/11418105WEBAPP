/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Check, Clipboard, PhoneCall, Star, Smile } from 'lucide-react';

export default function AdoptionProcess() {
  const steps = [
    {
      num: 1,
      title: '線上申請',
      desc: '填寫下方的領養人基本資訊與家庭狀況調查表。',
      icon: <Clipboard className="w-6 h-6" />
    },
    {
      num: 2,
      title: '電話訪談',
      desc: '志工將與您聯繫，初步確認領養意願與環境細節。',
      icon: <PhoneCall className="w-6 h-6" />
    },
    {
      num: 3,
      title: '現場互動',
      desc: '親自到機構與毛孩進行面對面相處與互動測試。',
      icon: <Smile className="w-6 h-6" />
    },
    {
      num: 4,
      title: '正式領養',
      desc: '辦理登記、晶片轉移，開啟你們的幸福新生活！',
      icon: <Check className="w-6 h-6 text-white" />
    }
  ];

  return (
    <section id="process" className="py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-600 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-1">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} /> Adoption Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-2">簡單四步驟，帶牠回家</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto my-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div 
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-8 rounded-[28px] text-center relative group"
            >
              <div className="w-16 h-16 bg-white/50 border border-white/60 text-amber-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-600 group-hover:border-amber-655 group-hover:text-white transition-all duration-300 shadow-sm">
                <span className="text-lg font-black">{step.num}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
