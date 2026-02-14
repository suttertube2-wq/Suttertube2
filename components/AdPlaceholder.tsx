
import React from 'react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface AdPlaceholderProps {
  lang: Language;
}

const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  
  return (
    <div className="w-full my-6 bg-gray-100 dark:bg-zinc-800 rounded-xl overflow-hidden border border-dashed border-gray-300 dark:border-zinc-700 p-2">
      <div className="flex justify-between items-center mb-2 px-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t.adTitle}</span>
        <button className="text-[10px] text-blue-500 underline">Remove Ads</button>
      </div>
      <div className="flex gap-3 items-center">
        <img 
          src={`https://picsum.photos/seed/${Math.random()}/100/100`} 
          alt="Ad" 
          className="w-16 h-16 rounded-lg object-cover" 
        />
        <div>
          <h4 className="font-bold text-sm dark:text-white">Sutter Premium VPN</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Protect your data and browse anonymously today!</p>
        </div>
      </div>
    </div>
  );
};

export default AdPlaceholder;
