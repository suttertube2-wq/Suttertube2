
import React from 'react';
import { VideoItem, Language } from '../types';
import { SIDEBAR_CONTENT } from '../constants';

interface VideoCardProps {
  video: VideoItem;
  lang: Language;
  onVaultToggle?: (id: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, lang, onVaultToggle }) => {
  const s = SIDEBAR_CONTENT[lang];
  
  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-[2rem] shadow-sm p-4 mb-4 flex gap-4 items-center border border-gray-100 dark:border-white/5 transition-all hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-0.5 group">
      <div className="relative w-24 h-24 flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover rounded-2xl" 
        />
        <span className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-md text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
          {video.duration}
        </span>
        {video.isPrivate && (
          <div className="absolute top-1.5 left-1.5 bg-yellow-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg">
            PRIVATE
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate mb-1 flex-1">
            {video.title}
          </h3>
          {onVaultToggle && (
            <button 
              onClick={() => onVaultToggle(video.id)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors ml-2"
              title={video.isPrivate ? s.unvault : s.moveToVault}
            >
              {video.isPrivate ? (
                <svg className="w-4 h-4 text-cyan-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z"/></svg>
              ) : (
                <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              )}
            </button>
          )}
        </div>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize flex items-center gap-1.5 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
          {video.platform}
        </p>
        
        {video.status === 'downloading' && (
          <div className="mt-3">
            <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-blue-600 h-full transition-all duration-300 rounded-full" 
                style={{ width: `${video.progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-1.5">
               <p className="text-[9px] text-gray-400 font-bold uppercase">Downloading...</p>
               <p className="text-[10px] text-cyan-500 font-black">{video.progress}%</p>
            </div>
          </div>
        )}
        
        {video.status === 'completed' && (
          <div className="mt-3 flex gap-2">
            <button className="flex-1 text-[10px] bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400 py-2 rounded-xl font-black hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors border border-cyan-200 dark:border-cyan-500/20">
              {lang === 'ar' ? 'تشغيل' : 'PLAY'}
            </button>
            <button className="flex-1 text-[10px] bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 py-2 rounded-xl font-black hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors border border-purple-200 dark:border-purple-500/20">
              {lang === 'ar' ? 'مشاركة' : 'SHARE'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
