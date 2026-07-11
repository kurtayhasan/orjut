import { useState, useCallback, useEffect } from 'react';
import { Language, translations } from '@/lib/translations';

export function useUILogic() {
  const [lang, setLang] = useState<Language>('tr');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const t = useCallback((key: keyof typeof translations['en']) => translations[lang][key] || key, [lang]);
  const triggerUpsell = useCallback(() => setShowUpsell(true), []);
  const closeUpsell = useCallback(() => setShowUpsell(false), []);
  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), []);

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    setIsDarkMode(savedTheme === 'dark');
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', 'dark');
      }
    } else {
      document.documentElement.classList.remove('dark');
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', 'light');
      }
    }
  }, [isDarkMode]);

  return {
    lang, setLang, t,
    isSidebarOpen, setIsSidebarOpen,
    isDarkMode, toggleDarkMode,
    showUpsell, triggerUpsell, closeUpsell,
    isExpenseModalOpen, setIsExpenseModalOpen
  };
}
