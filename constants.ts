
import { Translation, Language } from './types';

export const TRANSLATIONS: Record<Language, Translation> = {
  ar: {
    title: "Sutter Tube",
    subtitle: "حمل فيديوهاتك المفضلة بضغطة واحدة",
    placeholder: "ضع رابط الفيديو هنا (يوتيوب، فيسبوك، تيك توك...)",
    downloadBtn: "تحميل الآن",
    history: "قائمة التشغيل",
    settings: "الإعدادات",
    noHistory: "قائمة التشغيل فارغة حالياً",
    langName: "English",
    themeName: "الوضع الليلي",
    copied: "تم النسخ!",
    adTitle: "إعلان ممول",
    errorUrl: "يرجى إدخال رابط صحيح"
  },
  en: {
    title: "Sutter Tube",
    subtitle: "Download your favorite videos with one click",
    placeholder: "Paste video link here (YouTube, FB, TikTok...)",
    downloadBtn: "Download Now",
    history: "Playlist",
    settings: "Settings",
    noHistory: "Your playlist is currently empty",
    langName: "العربية",
    themeName: "Dark Mode",
    copied: "Copied!",
    adTitle: "Sponsored Ad",
    errorUrl: "Please enter a valid URL"
  }
};

export const SIDEBAR_CONTENT = {
  ar: {
    aboutTitle: "عن Sutter Tube",
    aboutDesc: "تطبيق Sutter Tube هو أداة متطورة وسريعة مصممة خصيصاً لمساعدتك في تحميل مقاطع الفيديو المفضلة لديك من مختلف منصات التواصل الاجتماعي (يوتيوب، فيسبوك، تيك توك) بأعلى جودة ممكنة وبسهولة تامة.",
    contactTitle: "تواصل معنا",
    developerTitle: "المطور",
    footerCredit: "منشئ البرنامج البشهندس كريم صموئيل",
    downloadQueueTitle: "قائمة التحميل",
    searchTitle: "محرك البحث الذكي",
    searchPlaceholder: "ابحث عن أي فيديو أو موقع...",
    clipboardPrompt: "تم اكتشاف رابط في الحافظة، هل تريد تحميله؟",
    yes: "نعم، تحميل",
    no: "تجاهل",
    vaultTitle: "الخزنة السرية",
    vaultPinPrompt: "أدخل الرمز السري للدخول",
    vaultEmpty: "الخزنة فارغة، اسحب الفيديوهات هنا لحمايتها",
    pullToUnlock: "اسحب لأسفل لفتح الخزنة",
    moveToVault: "إخفاء في الخزنة",
    unvault: "إخراج من الخزنة"
  },
  en: {
    aboutTitle: "About Sutter Tube",
    aboutDesc: "Sutter Tube is a powerful and fast tool specifically designed to help you download your favorite videos from various social media platforms (YouTube, Facebook, TikTok) in the highest possible quality with ease.",
    contactTitle: "Contact Us",
    developerTitle: "Developer",
    footerCredit: "Program Creator: Eng. Kareem Samuil",
    downloadQueueTitle: "Download Queue",
    searchTitle: "Smart Search Engine",
    searchPlaceholder: "Search for any video or site...",
    clipboardPrompt: "A link was detected in your clipboard. Download it?",
    yes: "Yes, Download",
    no: "Ignore",
    vaultTitle: "Secret Vault",
    vaultPinPrompt: "Enter PIN to access",
    vaultEmpty: "Vault is empty. Hide your private videos here.",
    pullToUnlock: "Pull down to unlock Vault",
    moveToVault: "Move to Vault",
    unvault: "Move to Playlist"
  }
};

export const CONTACT_INFO = {
  whatsapp: "01284084462",
  email: "kareemsamuil590@gmail.com"
};
