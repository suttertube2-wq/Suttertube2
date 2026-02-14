
import React, { useState, useEffect, useRef } from 'react';
import { Language, Theme, VideoItem } from './types';
import { TRANSLATIONS, SIDEBAR_CONTENT, CONTACT_INFO } from './constants';
import { analyzeVideoUrl, searchForVideos } from './geminiService';
import VideoCard from './components/VideoCard';
import AdPlaceholder from './components/AdPlaceholder';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>('light');
  const [url, setUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{title: string, uri: string}[]>([]);
  const [history, setHistory] = useState<VideoItem[]>([]);
  const [vaultItems, setVaultItems] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeDownload, setActiveDownload] = useState<VideoItem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [clipboardUrl, setClipboardUrl] = useState<string | null>(null);
  const [showClipboardPrompt, setShowClipboardPrompt] = useState(false);

  // Vault state
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isVaultAuthenticated, setIsVaultAuthenticated] = useState(false);
  const [vaultPin, setVaultPin] = useState<string>('0000');
  const [pinInput, setPinInput] = useState<string>('');
  
  // Pull-to-Vault Gesture State
  const [pullY, setPullY] = useState(0);
  const startY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];
  const s = SIDEBAR_CONTENT[lang];

  const brandGradient = "bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600";
  const brandText = "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500";

  useEffect(() => {
    const savedLang = localStorage.getItem('sutter-lang') as Language;
    const savedTheme = localStorage.getItem('sutter-theme') as Theme;
    const savedHistory = localStorage.getItem('sutter-history');
    const savedVault = localStorage.getItem('sutter-vault');
    const savedPin = localStorage.getItem('sutter-vault-pin');
    
    if (savedLang) setLang(savedLang);
    if (savedTheme) setTheme(savedTheme);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedVault) setVaultItems(JSON.parse(savedVault));
    if (savedPin) setVaultPin(savedPin);

    const checkClipboard = async () => {
      try {
        if (navigator.clipboard) {
          const text = await navigator.clipboard.readText();
          if (text && text.startsWith('http') && text !== url) {
            setClipboardUrl(text);
            setShowClipboardPrompt(true);
          }
        }
      } catch (err) {
        // Silently fail if clipboard not permitted
      }
    };

    window.addEventListener('focus', checkClipboard);
    return () => window.removeEventListener('focus', checkClipboard);
  }, [url]);

  useEffect(() => {
    localStorage.setItem('sutter-lang', lang);
    localStorage.setItem('sutter-theme', theme);
    localStorage.setItem('sutter-history', JSON.stringify(history));
    localStorage.setItem('sutter-vault', JSON.stringify(vaultItems));
    localStorage.setItem('sutter-vault-pin', vaultPin);
    
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    if (theme === 'dark') {
      document.body.className = 'bg-[#050b18] text-white transition-colors duration-300';
    } else {
      document.body.className = 'bg-gray-50 text-gray-900 transition-colors duration-300';
    }
  }, [lang, theme, history, vaultItems, vaultPin]);

  const toggleLang = () => setLang(prev => prev === 'ar' ? 'en' : 'ar');
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const startDownload = async (targetUrl: string) => {
    if (!targetUrl || !targetUrl.includes('http')) {
      alert(t.errorUrl);
      return;
    }

    setLoading(true);
    const analysis = await analyzeVideoUrl(targetUrl);
    
    if (analysis) {
      const newVideo: VideoItem = {
        id: Date.now().toString(),
        title: analysis.title || "Unknown Video",
        url: targetUrl,
        thumbnail: `https://picsum.photos/seed/${analysis.thumbnailSeed || 'video'}/400/225`,
        platform: analysis.platform || 'other',
        duration: analysis.duration || '0:00',
        timestamp: Date.now(),
        status: 'downloading',
        progress: 0
      };

      setActiveDownload(newVideo);
      setUrl('');
      setLoading(false);

      let p = 0;
      const interval = setInterval(() => {
        p += Math.floor(Math.random() * 15) + 5;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
          const finishedVideo = { ...newVideo, status: 'completed' as const, progress: 100 };
          setActiveDownload(null);
          setHistory(prev => [finishedVideo, ...prev]);
        } else {
          setActiveDownload(prev => prev ? { ...prev, progress: p } : null);
        }
      }, 800);
    } else {
      setLoading(false);
      alert("Analysis failed. Try again.");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setSearchLoading(true);
    const results = await searchForVideos(searchQuery);
    if (results) {
      setSearchResults(results.sources);
    }
    setSearchLoading(false);
  };

  const useClipboardUrl = () => {
    if (clipboardUrl) {
      setUrl(clipboardUrl);
      setShowClipboardPrompt(false);
      startDownload(clipboardUrl);
    }
  };

  // Vault Management
  const moveToVault = (id: string) => {
    const video = history.find(v => v.id === id);
    if (video) {
      setVaultItems(prev => [{...video, isPrivate: true}, ...prev]);
      setHistory(prev => prev.filter(v => v.id !== id));
    }
  };

  const removeFromVault = (id: string) => {
    const video = vaultItems.find(v => v.id === id);
    if (video) {
      setHistory(prev => [{...video, isPrivate: false}, ...prev]);
      setVaultItems(prev => prev.filter(v => v.id !== id));
    }
  };

  const handlePinSubmit = (val: string) => {
    if (val === vaultPin) {
      setIsVaultAuthenticated(true);
      setPinInput('');
    } else if (val.length >= 4) {
      alert(lang === 'ar' ? 'الرمز خطأ' : 'Wrong PIN');
      setPinInput('');
    }
  };

  // Pull Down Gesture Handler
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current !== null) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      if (diff > 0) {
        setPullY(Math.min(diff * 0.5, 180));
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullY > 140) {
      setIsVaultOpen(true);
    }
    setPullY(0);
    startY.current = null;
  };

  return (
    <div 
      className={`min-h-screen font-['Cairo'] transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''} overflow-x-hidden`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* Pull down indicator */}
      <div 
        className="fixed top-0 left-0 right-0 flex flex-col items-center justify-center overflow-hidden z-[55] pointer-events-none transition-all duration-300"
        style={{ height: pullY, opacity: pullY / 150 }}
      >
        <div className="bg-gradient-to-tr from-cyan-500 to-purple-500 p-3 rounded-full shadow-lg shadow-purple-500/40">
           <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest mt-2 dark:text-cyan-400 text-cyan-600">{s.pullToUnlock}</p>
      </div>

      {/* Vault Modal Overlay */}
      {isVaultOpen && (
        <div className="fixed inset-0 z-[120] bg-[#050b18] text-white flex flex-col animate-fade-in">
          <div className="p-6 flex justify-between items-center border-b border-white/5">
            <h2 className={`text-xl font-black ${brandText}`}>{s.vaultTitle}</h2>
            <button onClick={() => { setIsVaultOpen(false); setIsVaultAuthenticated(false); setPinInput(''); }} className="p-2 bg-white/5 rounded-full">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          {!isVaultAuthenticated ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl flex items-center justify-center mb-8 border border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
                <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <p className="text-sm font-bold text-gray-400 mb-8">{s.vaultPinPrompt}</p>
              
              <div className="flex gap-4 mb-10">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-4 h-4 rounded-full border-2 border-cyan-500/50 ${pinInput.length > i ? 'bg-cyan-400 shadow-[0_0_10px_cyan]' : ''}`}></div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-6">
                {[1,2,3,4,5,6,7,8,9, 'C', 0, 'OK'].map((key) => (
                  <button 
                    key={key} 
                    onClick={() => {
                      if (key === 'C') setPinInput('');
                      else if (key === 'OK') handlePinSubmit(pinInput);
                      else if (pinInput.length < 4) {
                        const newVal = pinInput + key;
                        setPinInput(newVal);
                        if (newVal.length === 4) handlePinSubmit(newVal);
                      }
                    }}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black transition-all active:scale-90 ${key === 'OK' ? brandGradient : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              {vaultItems.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                  <div className="text-5xl mb-4">🔐</div>
                  <p className="text-sm">{s.vaultEmpty}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vaultItems.map(video => (
                    <VideoCard key={video.id} video={video} lang={lang} onVaultToggle={removeFromVault} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Clipboard Link Prompt Modal */}
      {showClipboardPrompt && (
        <div className="fixed top-20 left-4 right-4 z-[100] animate-bounce">
          <div className="bg-white dark:bg-[#0a1224] p-4 rounded-2xl shadow-2xl border border-cyan-500/30 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-full">📋</div>
              <p className="text-xs font-bold dark:text-white">{s.clipboardPrompt}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={useClipboardUrl}
                className={`flex-1 ${brandGradient} text-white py-2 rounded-xl text-xs font-black`}
              >
                {s.yes}
              </button>
              <button 
                onClick={() => setShowClipboardPrompt(false)}
                className="flex-1 bg-gray-100 dark:bg-white/5 dark:text-gray-400 py-2 rounded-xl text-xs font-bold"
              >
                {s.no}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Drawer */}
      <aside className={`fixed top-0 bottom-0 ${lang === 'ar' ? 'right-0' : 'left-0'} w-80 bg-white dark:bg-[#0a1224] z-[70] shadow-2xl transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')} border-x dark:border-white/5`}>
        <div className="p-6 h-full flex flex-col overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className={`text-xl font-black ${brandText}`}>{t.title}</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full">
              <svg className="w-6 h-6 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <button onClick={toggleLang} className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all border dark:border-white/5">
              <span className="text-xl">🌐</span>
              <span className="text-xs font-bold dark:text-white">{t.langName}</span>
            </button>
            <button onClick={toggleTheme} className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all border dark:border-white/5">
              <span className="text-xl">{theme === 'light' ? '🌙' : '☀️'}</span>
              <span className="text-xs font-bold dark:text-white">{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">{s.aboutTitle}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {s.aboutDesc}
            </p>
          </div>

          <div className="mb-8 flex-1">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">{s.contactTitle}</h3>
            <div className="space-y-3">
              <a 
                href={`https://wa.me/2${CONTACT_INFO.whatsapp}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-500/20 transition-all border border-green-500/10"
              >
                <span className="text-xl">💬</span>
                <span className="text-xs font-bold">{CONTACT_INFO.whatsapp}</span>
              </a>
              <a 
                href={`mailto:${CONTACT_INFO.email}`}
                className="flex items-center gap-3 p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-500/20 transition-all border border-blue-500/10"
              >
                <span className="text-xl">📧</span>
                <span className="text-xs font-bold truncate">{CONTACT_INFO.email}</span>
              </a>
            </div>
          </div>

          <div className="pt-6 border-t dark:border-white/5 text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{s.developerTitle}</p>
            <p className="text-sm font-black dark:text-white">{s.footerCredit}</p>
          </div>
        </div>
      </aside>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-[#0a1224]/90 backdrop-blur-md border-b border-gray-100 dark:border-white/5 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all"
          >
            <svg className="w-6 h-6 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-cyan-500/30 flex items-center justify-center bg-[#050b18] text-[8px] font-black text-cyan-400">
             SUTTER
          </div>
          <h1 className={`text-xl font-black tracking-tighter ${brandText} hidden sm:block`}>{t.title}</h1>
        </div>
        <div className="flex gap-2">
           <div className={`text-lg font-black tracking-tighter ${brandText} sm:hidden`}>{t.title}</div>
           <div className="hidden sm:flex gap-2">
              <button onClick={toggleLang} className="px-3 py-1.5 text-xs font-bold bg-gray-100 dark:bg-white/5 dark:text-gray-300 rounded-xl">{t.langName}</button>
              <button onClick={toggleTheme} className="p-2 bg-gray-100 dark:bg-white/5 rounded-xl">{theme === 'light' ? '🌙' : '☀️'}</button>
           </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-md mx-auto px-6 py-8">
        <div className="text-center mb-10">
          <div className="inline-block mb-4 p-4 rounded-full bg-gradient-to-b from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
            <svg className="w-12 h-12 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-black mb-1 dark:text-white">{t.subtitle}</h2>
          <p className="text-cyan-600 dark:text-cyan-400 text-xs font-bold tracking-widest uppercase">
            {lang === 'ar' ? 'تحميل • مشاهدة • مشاركة' : 'DOWNLOAD • WATCH • SHARE'}
          </p>
        </div>

        {/* Search Engine Section */}
        <div className="mb-10 p-6 bg-white dark:bg-[#0a1224] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
          <h3 className="text-sm font-black dark:text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            {s.searchTitle}
          </h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={s.searchPlaceholder}
              className="flex-1 bg-gray-50 dark:bg-[#050b18] border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-xs focus:outline-none dark:text-white"
            />
            <button 
              onClick={handleSearch}
              className={`p-3 rounded-xl text-white ${brandGradient} shadow-lg shadow-blue-500/20`}
            >
              {searchLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span> : "🔍"}
            </button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {searchResults.map((res, i) => (
                <button 
                  key={i} 
                  onClick={() => { setUrl(res.uri); startDownload(res.uri); }}
                  className="w-full text-right bg-gray-50 dark:bg-white/5 p-3 rounded-xl text-[10px] font-bold dark:text-gray-300 hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-transparent transition-all flex items-center justify-between"
                >
                  <span className="truncate flex-1 ml-4">{res.title}</span>
                  <span className="text-cyan-500">🔗</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input Area (Direct URL) */}
        <div className="relative mb-8 group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.placeholder}
              className="w-full bg-white dark:bg-[#0a1224] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all dark:text-white"
            />
            <button
              onClick={() => startDownload(url)}
              disabled={loading}
              className={`mt-4 w-full ${brandGradient} hover:brightness-110 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-2`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  {t.downloadBtn}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Ad Space */}
        <AdPlaceholder lang={lang} />

        {/* Download Queue Section */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg dark:text-white border-r-4 border-cyan-500 pr-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              {s.downloadQueueTitle}
            </h3>
          </div>

          {activeDownload ? (
            <div className="mb-8">
              <VideoCard video={activeDownload} lang={lang} />
            </div>
          ) : (
            <div className="mb-8 py-8 text-center rounded-3xl border border-dashed border-gray-200 dark:border-white/5 opacity-50">
               <p className="text-xs dark:text-gray-400">{lang === 'ar' ? 'لا توجد عمليات تحميل نشطة' : 'No active downloads'}</p>
            </div>
          )}
        </div>

        {/* Playlist Section (Play List) */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg dark:text-white border-r-4 border-purple-500 pr-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
              {t.history}
            </h3>
            {history.length > 0 && (
              <button 
                onClick={() => setHistory([])}
                className="text-xs text-red-400 hover:text-red-500 transition-colors"
              >
                {lang === 'ar' ? 'مسح الكل' : 'Clear All'}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-12 rounded-3xl bg-gray-100/50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/5">
                <div className="text-4xl mb-4 grayscale opacity-50">🎬</div>
                <p className="text-sm text-gray-400 dark:text-gray-500">{t.noHistory}</p>
              </div>
            ) : (
              history.map(video => (
                <VideoCard key={video.id} video={video} lang={lang} onVaultToggle={moveToVault} />
              ))
            )}
          </div>
        </div>

        {/* Footer Ad / Banner */}
        <div className="mt-12 p-1 group relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600">
          <div className="bg-[#050b18] rounded-[1.9rem] p-6 text-white relative z-10">
            <h4 className={`font-black text-lg mb-1 ${brandText}`}>Sutter Tube Pro</h4>
            <p className="text-xs text-gray-400 mb-4">بدون إعلانات، سرعة تحميل صاروخية، ودعم دقة 4K.</p>
            <button className={`${brandGradient} w-full text-white font-black py-3 rounded-2xl text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition-all`}>
              {lang === 'ar' ? 'ترقية الآن' : 'Upgrade Now'}
            </button>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full"></div>
        </div>
        
        {/* Main Footer Credit Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/5 text-center pb-20">
            <div className="inline-block p-1 mb-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-purple-600/20">
              <p className="px-4 py-2 bg-white dark:bg-[#0a1224] rounded-[0.9rem] text-sm font-black dark:text-white">
                {s.footerCredit}
              </p>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-600 uppercase tracking-widest font-bold">
              © 2024 SUTTER TUBE - ALL RIGHTS RESERVED
            </p>
        </div>
      </main>

      {/* Bottom Padding for Sticky Ad */}
      <div className="h-20"></div>

      {/* Sticky Bottom Ad */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0a1224]/95 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 p-3 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl flex items-center justify-center text-xl shadow-inner">⚡</div>
             <div>
                <p className="text-[9px] text-cyan-500 font-bold uppercase tracking-tighter">Sponsored</p>
                <p className="text-xs font-bold dark:text-white">Fastest Fiber Internet 2024</p>
             </div>
          </div>
          <button className={`${brandGradient} text-white px-5 py-2 rounded-full text-xs font-black shadow-lg shadow-blue-500/20`}>Check</button>
        </div>
      </div>
    </div>
  );
};

export default App;
