import { useState, useEffect, useCallback, useRef } from 'react';

// ============ useSpeechSynthesis ============
export function useSpeechSynthesis() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(0.85);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const paragraphsRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis?.getVoices() || [];
      setVoices(availableVoices);
      // Try to find a good default voice
      const preferred = availableVoices.find(v => 
        v.name.includes('Samantha') || 
        v.name.includes('Google UK English Female') ||
        v.name.includes('Microsoft Zira') ||
        v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
      ) || availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
      if (preferred) setSelectedVoice(preferred);
    };

    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakParagraph = useCallback((index: number, paragraphs: string[]) => {
    if (!window.speechSynthesis || index >= paragraphs.length) {
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(paragraphs[index]);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = 0.9;
    utterance.volume = 1;

    utterance.onend = () => {
      if (isPlayingRef.current) {
        const nextIndex = index + 1;
        setCurrentParagraph(nextIndex);
        if (nextIndex < paragraphs.length) {
          speakParagraph(nextIndex, paragraphs);
        } else {
          setIsPlaying(false);
          setIsPaused(false);
        }
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [selectedVoice, rate]);

  const play = useCallback((paragraphs: string[], startIndex = 0) => {
    if (!window.speechSynthesis) return;
    paragraphsRef.current = paragraphs;
    isPlayingRef.current = true;
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentParagraph(startIndex);
    speakParagraph(startIndex, paragraphs);
  }, [speakParagraph]);

  const pause = useCallback(() => {
    window.speechSynthesis?.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis?.resume();
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentParagraph(0);
  }, []);

  const nextParagraph = useCallback(() => {
    const next = currentParagraph + 1;
    if (next < paragraphsRef.current.length) {
      setCurrentParagraph(next);
      if (isPlayingRef.current) {
        speakParagraph(next, paragraphsRef.current);
      }
    }
  }, [currentParagraph, speakParagraph]);

  const prevParagraph = useCallback(() => {
    const prev = Math.max(0, currentParagraph - 1);
    setCurrentParagraph(prev);
    if (isPlayingRef.current) {
      speakParagraph(prev, paragraphsRef.current);
    }
  }, [currentParagraph, speakParagraph]);

  const goToParagraph = useCallback((index: number) => {
    setCurrentParagraph(index);
    if (isPlayingRef.current) {
      speakParagraph(index, paragraphsRef.current);
    }
  }, [speakParagraph]);

  return {
    isPlaying,
    isPaused,
    currentParagraph,
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    play,
    pause,
    resume,
    stop,
    nextParagraph,
    prevParagraph,
    goToParagraph,
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
    totalParagraphs: paragraphsRef.current.length,
  };
}

// ============ useAudioPlayer ============
export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentSound, setCurrentSound] = useState<string | null>(null);

  const play = useCallback((src: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    audio.addEventListener('canplay', () => {
      // Fade in
      let vol = 0;
      const fadeIn = setInterval(() => {
        vol += 0.05;
        if (vol >= volume) {
          vol = volume;
          clearInterval(fadeIn);
        }
        if (audioRef.current) audioRef.current.volume = vol;
      }, 100);
      audio.play().catch(() => {});
      setIsPlaying(true);
    });

    audio.addEventListener('error', () => {
      setIsPlaying(false);
      setCurrentSound(null);
    });

    setCurrentSound(src);
  }, [volume]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {});
    setIsPlaying(true);
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      // Fade out
      const audio = audioRef.current;
      let vol = audio.volume;
      const fadeOut = setInterval(() => {
        vol -= 0.05;
        if (vol <= 0) {
          vol = 0;
          clearInterval(fadeOut);
          audio.pause();
          audioRef.current = null;
        }
        audio.volume = vol;
      }, 100);
    }
    setIsPlaying(false);
    setCurrentSound(null);
  }, []);

  const changeVolume = useCallback((newVol: number) => {
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  }, []);

  return { isPlaying, volume, currentSound, play, pause, resume, stop, changeVolume };
}

// ============ useSleepTimer ============
export function useSleepTimer(onExpire: () => void) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const start = useCallback((minutes: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const seconds = minutes * 60;
    setTimeLeft(seconds);
    setIsActive(true);

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsActive(false);
          onExpireRef.current();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const cancel = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeLeft(null);
    setIsActive(false);
  }, []);

  const formatTime = useCallback((seconds: number | null) => {
    if (seconds === null) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { timeLeft, isActive, start, cancel, formatTime };
}

// ============ useFavorites ============
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('favoriteStories');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = useCallback((storyId: string) => {
    setFavorites(prev => {
      const next = prev.includes(storyId)
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId];
      try {
        localStorage.setItem('favoriteStories', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const isFavorite = useCallback((storyId: string) => {
    return favorites.includes(storyId);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}

// ============ useReadingProgress ============
export function useReadingProgress() {
  const [progress, setProgress] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('readingProgress');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [lastRead, setLastRead] = useState<string | null>(() => {
    try {
      return localStorage.getItem('lastReadStory');
    } catch {
      return null;
    }
  });

  const updateProgress = useCallback((storyId: string, paragraphIndex: number, totalParagraphs: number) => {
    const pct = Math.round(((paragraphIndex + 1) / totalParagraphs) * 100);
    setProgress(prev => {
      const next = { ...prev, [storyId]: pct };
      try {
        localStorage.setItem('readingProgress', JSON.stringify(next));
      } catch {}
      return next;
    });
    try {
      localStorage.setItem('lastReadStory', storyId);
    } catch {}
    setLastRead(storyId);
  }, []);

  const getProgress = useCallback((storyId: string) => {
    return progress[storyId] || 0;
  }, [progress]);

  return { progress, lastRead, updateProgress, getProgress };
}

// ============ useTheme ============
export type ThemeMode = 'midnight' | 'purple-dream' | 'moonlight';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      return (localStorage.getItem('theme') as ThemeMode) || 'midnight';
    } catch {
      return 'midnight';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
    } catch {}
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  return { theme, setTheme };
}

// ============ useSEO ============
export interface SEOData {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: 'website' | 'article';
}

export function useSEO(data: SEOData) {
  useEffect(() => {
    // Update title
    document.title = data.title;
    
    // Update meta description
    const metaDesc = document.getElementById('meta-description') as HTMLMetaElement;
    if (metaDesc) metaDesc.content = data.description;
    
    // Update Open Graph tags
    const ogTitle = document.getElementById('og-title') as HTMLMetaElement;
    if (ogTitle) ogTitle.content = data.title;
    
    const ogDesc = document.getElementById('og-description') as HTMLMetaElement;
    if (ogDesc) ogDesc.content = data.description;
    
    // Update Twitter tags
    const twitterTitle = document.getElementById('twitter-title') as HTMLMetaElement;
    if (twitterTitle) twitterTitle.content = data.title;
    
    const twitterDesc = document.getElementById('twitter-description') as HTMLMetaElement;
    if (twitterDesc) twitterDesc.content = data.description;
    
    // Update canonical URL if provided
    if (data.url) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = data.url;
    }
    
    // Add structured data for stories
    if (data.type === 'article' && data.url) {
      const existingScript = document.getElementById('story-jsonld');
      if (existingScript) existingScript.remove();
      
      const script = document.createElement('script');
      script.id = 'story-jsonld';
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": data.title,
        "description": data.description,
        "url": data.url,
        "image": data.image || "https://dreamytales.app/og-image.jpg",
        "author": {
          "@type": "Organization",
          "name": "DreamyTales"
        },
        "publisher": {
          "@type": "Organization",
          "name": "DreamyTales",
          "logo": {
            "@type": "ImageObject",
            "url": "https://dreamytales.app/icon-512.png"
          }
        },
        "datePublished": "2024-01-01",
        "dateModified": new Date().toISOString().split('T')[0],
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": data.url
        },
        "isFamilyFriendly": true,
        "genre": "Bedtime Story",
        "audience": {
          "@type": "PeopleAudience",
          "suggestedMinAge": 3,
          "suggestedMaxAge": 10
        }
      });
      document.head.appendChild(script);
    }
    
    return () => {
      const storyScript = document.getElementById('story-jsonld');
      if (storyScript) storyScript.remove();
    };
  }, [data.title, data.description, data.url, data.image, data.type]);
}

// ============ useSettings ============
export interface AppSettings {
  autoPlayNext: boolean;
  showMoral: boolean;
  rememberPosition: boolean;
  reduceAnimations: boolean;
  defaultDuration: number;
  defaultSpeed: number;
  fontSize: number;
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem('appSettings');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      autoPlayNext: true,
      showMoral: true,
      rememberPosition: true,
      reduceAnimations: false,
      defaultDuration: 20,
      defaultSpeed: 0.85,
      fontSize: 20,
    };
  });

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('appSettings', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return { settings, updateSettings };
}
