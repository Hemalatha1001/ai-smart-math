import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "te" | "hi";

export const LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
];

type Dict = Record<string, { en: string; te: string; hi: string }>;

export const STRINGS: Dict = {
  // header / nav
  tagline: {
    en: "Smart calculations for everything in life",
    te: "జీవితంలోని ప్రతిదానికీ స్మార్ట్ లెక్కలు",
    hi: "जीवन की हर चीज़ के लिए स्मार्ट गणनाएँ",
  },
  meta: { en: "10 calculators · AI-enhanced", te: "10 కాలిక్యులేటర్లు · AI ఆధారిత", hi: "10 कैलकुलेटर · AI-संवर्धित" },
  dashboard: { en: "Dashboard", te: "డాష్‌బోర్డ్", hi: "डैशबोर्ड" },
  language: { en: "Language", te: "భాష", hi: "भाषा" },
  // categories
  Basic: { en: "Basic", te: "ప్రాథమిక", hi: "मूल" },
  Scientific: { en: "Scientific", te: "శాస్త్రీయ", hi: "वैज्ञानिक" },
  Health: { en: "Health", te: "ఆరోగ్యం", hi: "स्वास्थ्य" },
  Financial: { en: "Financial", te: "ఆర్థిక", hi: "वित्तीय" },
  Academic: { en: "Academic", te: "విద్యా", hi: "शैक्षिक" },
  Utility: { en: "Utility", te: "ఉపయోగితా", hi: "उपयोगिता" },
  AI: { en: "AI", te: "AI", hi: "AI" },
  Learn: { en: "Learn", te: "నేర్చుకోండి", hi: "सीखें" },
  // tutor
  tutor_title: { en: "AI Math Tutor", te: "AI గణిత ట్యూటర్", hi: "AI गणित ट्यूटर" },
  tutor_desc: { en: "Chat with a friendly tutor — get step-by-step explanations", te: "ఒక మిత్రపూరిత ట్యూటర్‌తో చాట్ చేయండి — దశలవారీ వివరణలు పొందండి", hi: "एक मित्रवत ट्यूटर से चैट करें — चरण-दर-चरण व्याख्या पाएं" },
  tutor_placeholder: { en: "Ask anything about math…", te: "గణితం గురించి ఏదైనా అడగండి…", hi: "गणित के बारे में कुछ भी पूछें…" },
  tutor_empty: { en: "Hi! I'm your math tutor. What would you like to learn today?", te: "హాయ్! నేను మీ గణిత ట్యూటర్‌ని. ఈరోజు మీరు ఏమి నేర్చుకోవాలనుకుంటున్నారు?", hi: "नमस्ते! मैं आपका गणित ट्यूटर हूँ। आज आप क्या सीखना चाहेंगे?" },
  send: { en: "Send", te: "పంపండి", hi: "भेजें" },
  thinking: { en: "Thinking…", te: "ఆలోచిస్తున్నాను…", hi: "सोच रहा हूँ…" },
  clear_chat: { en: "Clear chat", te: "చాట్ తొలగించండి", hi: "चैट साफ़ करें" },
  // quiz
  quiz_title: { en: "Quiz & Practice", te: "క్విజ్ & అభ్యాసం", hi: "क्विज़ और अभ्यास" },
  quiz_desc: { en: "Test yourself with quick math challenges", te: "శీఘ్ర గణిత సవాళ్లతో మిమ్మల్ని పరీక్షించుకోండి", hi: "त्वरित गणित चुनौतियों से स्वयं को परखें" },
  topic: { en: "Topic", te: "విషయం", hi: "विषय" },
  difficulty: { en: "Difficulty", te: "కష్టత", hi: "कठिनाई" },
  start: { en: "Start", te: "ప్రారంభించండి", hi: "शुरू करें" },
  next: { en: "Next question", te: "తదుపరి ప్రశ్న", hi: "अगला प्रश्न" },
  finish: { en: "Finish", te: "ముగించండి", hi: "समाप्त" },
  restart: { en: "Restart", te: "మళ్లీ ప్రారంభించండి", hi: "पुनः प्रारंभ" },
  correct: { en: "Correct!", te: "సరైనది!", hi: "सही!" },
  wrong: { en: "Not quite. Answer:", te: "సరికాదు. సమాధానం:", hi: "गलत। उत्तर:" },
  score: { en: "Score", te: "స్కోర్", hi: "स्कोर" },
  streak: { en: "Streak", te: "స్ట్రీక్", hi: "स्ट्रीक" },
  question: { en: "Question", te: "ప్రశ్న", hi: "प्रश्न" },
  of: { en: "of", te: "లో", hi: "में से" },
  results: { en: "Quiz complete!", te: "క్విజ్ పూర్తయింది!", hi: "क्विज़ पूर्ण!" },
  easy: { en: "Easy", te: "సులభం", hi: "आसान" },
  medium: { en: "Medium", te: "మధ్యమ", hi: "मध्यम" },
  hard: { en: "Hard", te: "కష్టం", hi: "कठिन" },
  arithmetic: { en: "Arithmetic", te: "అంకగణితం", hi: "अंकगणित" },
  algebra: { en: "Algebra", te: "బీజగణితం", hi: "बीजगणित" },
  geometry: { en: "Geometry", te: "జ్యామితి", hi: "ज्यामिति" },
};

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (stored && ["en", "te", "hi"].includes(stored)) setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };

  const t = (key: string) => {
    const entry = STRINGS[key];
    if (!entry) return key;
    return entry[lang] ?? entry.en;
  };

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export const useT = () => useContext(LangContext);
