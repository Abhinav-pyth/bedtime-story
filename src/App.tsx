import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Home, BookOpen, Moon, Heart, Settings, Search, Play, Pause, 
  SkipBack, SkipForward, ChevronLeft, Volume2, VolumeX, 
  Timer, Clock, X, Minus, Plus, Star, Sparkles, 
  ChevronRight, ArrowLeft, RotateCcw, Bookmark
} from 'lucide-react';
import { stories, categories, ambientSounds, Story } from './data/stories';
import { hindiStories, melodySounds } from './data/hindiStories';
import { 
  useSpeechSynthesis, useAudioPlayer, useSleepTimer, 
  useFavorites, useReadingProgress, useTheme, useSettings, useSEO, ThemeMode 
} from './hooks/useApp';

type Language = 'en' | 'hi';

// ============ TYPES ============
type Page = 'home' | 'stories' | 'sleep' | 'favorites' | 'settings' | 'reader';

// ============ STAR BACKGROUND ============
function StarBackground() {
  const stars = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
    })), []
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-yellow-100 animate-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// ============ STORY COVER ART ============
function StoryCover({ cover, size = 'md' }: { cover: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-full h-48',
    lg: 'w-full h-64',
  };

  const getGradient = () => {
    switch (cover) {
      case 'moon': return 'from-indigo-900 via-purple-900 to-blue-900';
      case 'star': return 'from-blue-900 via-indigo-900 to-purple-900';
      case 'garden': return 'from-emerald-900 via-teal-900 to-green-900';
      case 'dragon': return 'from-red-900 via-orange-900 to-amber-900';
      case 'castle': return 'from-violet-900 via-purple-900 to-indigo-900';
      case 'fox': return 'from-amber-900 via-orange-900 to-red-900';
      case 'forest': return 'from-green-900 via-emerald-900 to-teal-900';
      case 'lantern': return 'from-yellow-900 via-amber-900 to-orange-900';
      case 'rabbit': return 'from-slate-800 via-gray-800 to-zinc-900';
      case 'ocean': return 'from-cyan-900 via-blue-900 to-indigo-900';
      case 'firefly': return 'from-lime-900 via-green-900 to-emerald-900';
      case 'cloud': return 'from-sky-900 via-blue-900 to-indigo-900';
      default: return 'from-indigo-900 via-purple-900 to-blue-900';
    }
  };

  const getIcon = () => {
    switch (cover) {
      case 'moon': return '🌙';
      case 'star': return '⭐';
      case 'garden': return '🌸';
      case 'dragon': return '🐉';
      case 'castle': return '🏰';
      case 'fox': return '🦊';
      case 'forest': return '🌲';
      case 'lantern': return '🏮';
      case 'rabbit': return '🐰';
      case 'ocean': return '🧜';
      case 'firefly': return '✨';
      case 'cloud': return '☁️';
      default: return '✨';
    }
  };

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br ${getGradient()} relative overflow-hidden flex items-center justify-center`}>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-2 right-3 w-2 h-2 bg-yellow-200 rounded-full animate-twinkle" />
        <div className="absolute top-6 left-4 w-1.5 h-1.5 bg-blue-200 rounded-full animate-twinkle" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-4 right-6 w-1 h-1 bg-purple-200 rounded-full animate-twinkle" style={{ animationDelay: '2s' }} />
      </div>
      <span className={size === 'sm' ? 'text-3xl' : size === 'lg' ? 'text-7xl' : 'text-5xl'}>
        {getIcon()}
      </span>
    </div>
  );
}

// ============ BOTTOM NAVIGATION ============
function BottomNav({ currentPage, onNavigate, language }: { currentPage: Page; onNavigate: (page: Page) => void; language: Language }) {
  const isHindi = language === 'hi';
  const navItems = [
    { id: 'home' as Page, icon: Home, label: isHindi ? 'होम' : 'Home' },
    { id: 'stories' as Page, icon: BookOpen, label: isHindi ? 'कहानियाँ' : 'Stories' },
    { id: 'sleep' as Page, icon: Moon, label: isHindi ? 'सुलाब' : 'Sleep' },
    { id: 'favorites' as Page, icon: Heart, label: isHindi ? 'पसंदीदा' : 'Favorites' },
    { id: 'settings' as Page, icon: Settings, label: isHindi ? 'सेटिंग्स' : 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-indigo-500/20 bottom-nav-safe" role="navigation" aria-label="Main navigation">
      <div className="flex justify-around items-center max-w-lg mx-auto px-2 py-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 touch-target ${
              currentPage === item.id 
                ? 'text-amber-300 bg-amber-300/10' 
                : 'text-indigo-300 hover:text-indigo-100'
            }`}
            aria-label={item.label}
            aria-current={currentPage === item.id ? 'page' : undefined}
          >
            <item.icon size={22} strokeWidth={currentPage === item.id ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ============ HOME PAGE ============
function HomePage({ onNavigate, onOpenStory, language, setLanguage, allStories }: { onNavigate: (page: Page) => void; onOpenStory: (story: Story) => void; language: Language; setLanguage: (lang: Language) => void; allStories: Story[] }) {
  const { lastRead, getProgress } = useReadingProgress();
  const lastReadStory = lastRead ? allStories.find(s => s.id === lastRead) : null;
  const lastReadProgress = lastRead ? getProgress(lastRead) : 0;
  const tonightPick = allStories[0]; // First story (Moonlight Kingdom or चंदा मामा)
  const isHindi = language === 'hi';

  return (
    <div className="pb-24 animate-fade-in">
      {/* Language Toggle */}
      <div className="flex justify-end px-6 pt-4">
        <button
          onClick={() => setLanguage(isHindi ? 'en' : 'hi')}
          className="px-3 py-1.5 rounded-full glass-light text-xs text-indigo-200 flex items-center gap-1.5 hover:bg-indigo-700/30 transition-all"
          title={isHindi ? 'Switch to English' : 'हिंदी में बदलें'}
        >
          <span>{isHindi ? '🇬🇧 English' : '🇮🇳 हिंदी'}</span>
        </button>
      </div>
      
      {/* Hero Section */}
      <div className="relative px-6 pt-8 pb-8 text-center overflow-hidden">
        {/* Background clouds */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 -left-10 w-40 h-16 bg-indigo-800/20 rounded-full blur-xl animate-float-slow" />
          <div className="absolute top-32 -right-8 w-32 h-12 bg-purple-800/20 rounded-full blur-xl animate-float-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-48 left-4 w-24 h-10 bg-indigo-700/15 rounded-full blur-lg animate-float-slow" style={{ animationDelay: '4s' }} />
        </div>
        
        <div className="relative mb-6">
          {/* Moon with glow rings */}
          <div className="relative w-28 h-28 mx-auto">
            <div className="absolute inset-0 rounded-full bg-amber-200/10 animate-moon-glow" style={{ transform: 'scale(1.5)' }} />
            <div className="absolute inset-2 rounded-full bg-amber-100/10" style={{ transform: 'scale(1.3)' }} />
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-100 via-amber-100 to-amber-200 animate-moon-glow relative shadow-2xl shadow-amber-200/30">
              <div className="absolute top-5 left-6 w-5 h-5 rounded-full bg-amber-200/40" />
              <div className="absolute top-10 right-5 w-3 h-3 rounded-full bg-amber-200/30" />
              <div className="absolute bottom-5 left-8 w-4 h-4 rounded-full bg-amber-200/25" />
            </div>
          </div>
          {/* Stars around moon */}
          <div className="absolute top-0 left-6 text-yellow-200 animate-twinkle text-lg">✨</div>
          <div className="absolute top-4 right-4 text-blue-200 animate-twinkle text-sm" style={{ animationDelay: '1s' }}>⭐</div>
          <div className="absolute bottom-2 left-2 text-purple-200 animate-twinkle text-xs" style={{ animationDelay: '2s' }}>✨</div>
          <div className="absolute top-12 right-0 text-amber-200 animate-twinkle text-xs" style={{ animationDelay: '3s' }}>✦</div>
          <div className="absolute bottom-6 right-8 text-indigo-200 animate-twinkle text-xs" style={{ animationDelay: '1.5s' }}>·</div>
        </div>
        
        <p className="text-indigo-400 text-xs font-medium uppercase tracking-widest mb-2">DreamyTales</p>
        <h1 className="text-3xl font-bold text-indigo-50 mb-2">
          {isHindi ? 'शुभ रात्रि 🌙' : 'Good Night 🌙'}
        </h1>
        <p className="text-indigo-300 text-lg leading-relaxed mb-1">
          {isHindi ? 'आज रात कौन सा जादुई' : 'What magical adventure'}
        </p>
        <p className="text-indigo-300 text-lg leading-relaxed">
          {isHindi ? 'सपना देखोगे?' : 'will you dream about tonight?'}
        </p>
        
        <button
          onClick={() => onOpenStory(tonightPick)}
          className="mt-6 px-8 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-indigo-900 font-bold rounded-full shadow-lg shadow-amber-400/30 hover:shadow-amber-400/50 transition-all duration-300 active:scale-95 text-base"
        >
          ✨ {isHindi ? 'आज की कहानी शुरू करें' : "Start Tonight's Story"}
        </button>
      </div>

      {/* Continue Reading */}
      {lastReadStory && lastReadProgress > 0 && lastReadProgress < 100 && (
        <div className="px-6 mb-6">
          <button
            onClick={() => onOpenStory(lastReadStory)}
            className="w-full p-4 rounded-2xl glass-light text-left flex items-center gap-4 hover:bg-indigo-800/30 transition-all"
          >
            <StoryCover cover={lastReadStory.cover} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-amber-300 text-xs font-medium mb-1">
                {isHindi ? 'पढ़ना जारी रखें' : 'Continue Reading'}
              </p>
              <p className="text-indigo-100 font-semibold truncate">{lastReadStory.title}</p>
              <div className="mt-2 h-1.5 bg-indigo-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${lastReadProgress}%` }} />
              </div>
              <p className="text-indigo-400 text-xs mt-1">{lastReadProgress}% {isHindi ? 'पूर्ण' : 'complete'}</p>
            </div>
            <ChevronRight size={20} className="text-indigo-400" />
          </button>
        </div>
      )}

      {/* Tonight's Pick */}
      <div className="px-6 mb-8">
        <h2 className="text-lg font-bold text-indigo-100 mb-3">
          {isHindi ? 'आज की कहानी' : "Tonight's Pick"}
        </h2>
        <button
          onClick={() => onOpenStory(tonightPick)}
          className="w-full rounded-2xl overflow-hidden glass-light hover:bg-indigo-800/30 transition-all text-left"
        >
          <StoryCover cover={tonightPick.cover} size="md" />
          <div className="p-4">
            <h3 className="text-xl font-bold text-indigo-100 mb-1">{tonightPick.title}</h3>
            <p className="text-indigo-300 text-sm mb-3 line-clamp-2">{tonightPick.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-indigo-400">
                <span className="flex items-center gap-1"><Clock size={12} /> {tonightPick.duration}</span>
                <span className="flex items-center gap-1"><Sparkles size={12} /> {tonightPick.category}</span>
              </div>
              <span className="flex items-center gap-1 text-amber-300 text-sm font-medium">
                <Play size={14} /> Listen
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-indigo-100 px-6 mb-3">
          {isHindi ? 'अपना सपना चुनें' : 'Choose Your Dream'}
        </h2>
        <div className="flex overflow-x-auto gap-3 px-6 pb-2 hide-scrollbar">
          {categories.filter(c => c.id !== 'all').map(cat => (
            <button
              key={cat.id}
              onClick={() => onNavigate('stories')}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl glass-light hover:bg-indigo-700/30 transition-all min-w-[80px]"
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-xs text-indigo-200 font-medium whitespace-nowrap">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Tonight */}
      <div className="px-6 mb-8">
        <h2 className="text-lg font-bold text-indigo-100 mb-3">{isHindi ? 'आज की लोकप्रिय' : 'Popular Tonight'}</h2>
        <div className="grid grid-cols-2 gap-3">
          {allStories.slice(1, 5).map(story => (
            <StoryCard key={story.id} story={story} onClick={() => onOpenStory(story)} />
          ))}
        </div>
      </div>

      {/* Sleep Sounds Preview */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-indigo-100">
            {isHindi ? 'सुलाब ध्वनियाँ' : 'Sleep Sounds'}
          </h2>
          <button onClick={() => onNavigate('sleep')} className="text-xs text-amber-300 flex items-center gap-1">
            {isHindi ? 'सभी देखें' : 'See all'} <ChevronRight size={12} />
          </button>
        </div>
        <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
          {ambientSounds.slice(0, 5).map(sound => (
            <button
              key={sound.id}
              onClick={() => onNavigate('sleep')}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl glass-light hover:bg-indigo-700/30 transition-all min-w-[100px] active:scale-95"
            >
              <span className="text-3xl">{sound.emoji}</span>
              <span className="text-xs text-indigo-200 font-medium text-center">{sound.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer quote */}
      <div className="px-6 text-center pb-4">
        <p className="text-indigo-600 text-xs italic">
          "Close your eyes. Let the story begin." ✨
        </p>
      </div>
    </div>
  );
}

// ============ STORY CARD ============
function StoryCard({ story, onClick, showFavorite = true, isFavorite, onToggleFavorite }: {
  story: Story;
  onClick: () => void;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl overflow-hidden glass-light hover:bg-indigo-700/30 transition-all text-left w-full"
    >
      <div className="relative">
        <StoryCover cover={story.cover} size="md" />
        {showFavorite && onToggleFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className="absolute top-2 right-2 p-2 rounded-full bg-black/30 backdrop-blur-sm touch-target"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={16} className={isFavorite ? 'text-red-400 fill-red-400' : 'text-white/70'} />
          </button>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold text-indigo-100 mb-1 line-clamp-2">{story.title}</h3>
        <p className="text-xs text-indigo-400 line-clamp-2 mb-2">{story.description}</p>
        <div className="flex items-center gap-2 text-[10px] text-indigo-500">
          <span>{story.duration}</span>
          <span>•</span>
          <span>Ages {story.ageRange}</span>
        </div>
      </div>
    </button>
  );
}

// ============ STORIES PAGE ============
function StoriesPage({ onOpenStory, language, allStories }: { onOpenStory: (story: Story) => void; language: Language; allStories: Story[] }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const { isFavorite, toggleFavorite } = useFavorites();
  const isHindi = language === 'hi';

  const ageRanges = ['all', '3-6', '4-8', '5-9', '6-10'];

  const filteredStories = useMemo(() => {
    return allStories.filter(story => {
      const matchesSearch = search === '' || 
        story.title.toLowerCase().includes(search.toLowerCase()) ||
        story.description.toLowerCase().includes(search.toLowerCase()) ||
        story.category.toLowerCase().includes(search.toLowerCase()) ||
        story.story.some(p => p.toLowerCase().includes(search.toLowerCase()));
      
      const matchesCategory = activeCategory === 'all' || 
        story.category.toLowerCase().includes(activeCategory.replace('-', ' '));
      
      const matchesAge = ageFilter === 'all' || story.ageRange === ageFilter;
      
      return matchesSearch && matchesCategory && matchesAge;
    });
  }, [search, activeCategory, ageFilter, allStories]);

  return (
    <div className="pb-24 animate-fade-in">
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-indigo-100 mb-1">Story Library</h1>
        <p className="text-indigo-400 text-sm">Find your next magical adventure...</p>
      </div>

      {/* Search */}
      <div className="px-6 mb-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories..."
            className="w-full pl-11 pr-4 py-3 rounded-xl glass-light text-indigo-100 placeholder-indigo-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            aria-label="Search stories"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-indigo-400 hover:text-indigo-200"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex overflow-x-auto gap-2 px-6 mb-3 hide-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-amber-400 text-indigo-900'
                : 'glass-light text-indigo-300 hover:text-indigo-100'
            }`}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Age Filters */}
      <div className="flex overflow-x-auto gap-2 px-6 mb-6 hide-scrollbar">
        {ageRanges.map(age => (
          <button
            key={age}
            onClick={() => setAgeFilter(age)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              ageFilter === age
                ? 'bg-purple-500 text-white'
                : 'glass-light text-indigo-300 hover:text-indigo-100'
            }`}
          >
            {age === 'all' ? 'All Ages' : `${age} years`}
          </button>
        ))}
      </div>

      {/* Stories Grid */}
      <div className="px-6">
        {filteredStories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-indigo-300">No stories found</p>
            <p className="text-indigo-500 text-sm mt-1">Try a different search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredStories.map(story => (
              <StoryCard
                key={story.id}
                story={story}
                onClick={() => onOpenStory(story)}
                isFavorite={isFavorite(story.id)}
                onToggleFavorite={() => toggleFavorite(story.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ STORY READER ============
function StoryReader({ story, onBack, language }: { story: Story; onBack: () => void; language: Language }) {
  const { 
    isPlaying, isPaused, currentParagraph, voices, selectedVoice, 
    setSelectedVoice, rate, setRate, play, pause, resume, stop, 
    nextParagraph, prevParagraph, isSupported, totalParagraphs 
  } = useSpeechSynthesis();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { updateProgress } = useReadingProgress();
  const { settings } = useSettings();
  const [showControls, setShowControls] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [storyComplete, setStoryComplete] = useState(false);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isHindi = language === 'hi';

  useEffect(() => {
    if (isPlaying && totalParagraphs > 0) {
      updateProgress(story.id, currentParagraph, story.story.length);
    }
    // Detect story completion
    if (isPlaying && currentParagraph >= story.story.length - 1) {
      const checkComplete = setTimeout(() => {
        setStoryComplete(true);
      }, 5000); // Give time for last paragraph to finish
      return () => clearTimeout(checkComplete);
    }
  }, [currentParagraph, isPlaying, story.id, story.story.length, totalParagraphs, updateProgress]);

  const handlePlay = () => {
    if (isPlaying && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      play(story.story, 0);
    }
  };

  const handleStop = () => {
    stop();
    setStoryComplete(false);
  };

  // Scroll to current paragraph when narrating
  useEffect(() => {
    if (isPlaying && contentRef.current) {
      const el = contentRef.current.querySelector(`[data-paragraph="${currentParagraph}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentParagraph, isPlaying]);

  // Recommendations
  const recommendations = useMemo(() => {
    return stories
      .filter(s => s.id !== story.id && s.category === story.category)
      .slice(0, 3);
  }, [story]);

  if (immersiveMode) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex flex-col">
        <div className="flex justify-between items-center p-4">
          <button onClick={() => setImmersiveMode(false)} className="p-2 text-indigo-300 touch-target" aria-label="Exit immersive mode">
            <X size={24} />
          </button>
          {isPlaying && (
            <div className="text-amber-300 text-sm">
              {currentParagraph + 1} / {story.story.length}
            </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="text-6xl mb-6 animate-float">🌙</div>
          <h2 className="text-2xl font-bold text-indigo-100 mb-8">{story.title}</h2>
          
          <div className="max-w-md">
            <p className="text-lg text-indigo-200 leading-relaxed italic">
              "{story.story[currentParagraph] || story.story[0]}"
            </p>
          </div>
        </div>

        <div className="p-6 flex flex-col items-center gap-4">
          {/* Progress bar */}
          <div className="w-full max-w-sm h-1 bg-indigo-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${((currentParagraph + 1) / story.story.length) * 100}%` }}
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={prevParagraph} className="p-3 text-indigo-300 touch-target" aria-label="Previous paragraph">
              <SkipBack size={24} />
            </button>
            <button onClick={handlePlay} className="p-4 bg-amber-400 rounded-full text-indigo-900 touch-target" aria-label={isPlaying && !isPaused ? 'Pause' : 'Play'}>
              {isPlaying && !isPaused ? <Pause size={28} /> : <Play size={28} />}
            </button>
            <button onClick={nextParagraph} className="p-3 text-indigo-300 touch-target" aria-label="Next paragraph">
              <SkipForward size={24} />
            </button>
          </div>
          
          <button onClick={handleStop} className="text-indigo-400 text-sm touch-target">Stop Narration</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-40 glass px-4 py-3 flex items-center justify-between safe-top">
        <button onClick={() => { handleStop(); onBack(); }} className="flex items-center gap-1 text-indigo-300 touch-target p-2" aria-label="Go back">
          <ArrowLeft size={20} />
          <span className="text-sm">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(story.id)}
            className="p-2 touch-target"
            aria-label={isFavorite(story.id) ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={20} className={isFavorite(story.id) ? 'text-red-400 fill-red-400' : 'text-indigo-300'} />
          </button>
          <button
            onClick={() => setImmersiveMode(true)}
            className="p-2 text-indigo-300 touch-target"
            aria-label="Immersive storytelling mode"
          >
            <Moon size={20} />
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="px-6 pt-6 pb-4">
        <StoryCover cover={story.cover} size="lg" />
      </div>

      {/* Title & Meta */}
      <div className="px-6 mb-6">
        <h1 className="text-2xl font-bold text-indigo-100 mb-2">{story.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-indigo-400">
          <span className="flex items-center gap-1"><Sparkles size={14} /> {story.category}</span>
          <span className="flex items-center gap-1"><Clock size={14} /> {story.duration}</span>
          <span className="flex items-center gap-1"><Star size={14} /> Ages {story.ageRange}</span>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="px-6 mb-6">
        <div className="p-4 rounded-2xl glass-light">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-indigo-200">
              {isPlaying ? (isPaused ? 'Paused' : 'Now Playing...') : 'Listen to Story'}
            </span>
            <button 
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className="text-xs text-amber-300 touch-target p-1"
            >
              Voice Settings
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <button onClick={prevParagraph} className="p-3 text-indigo-300 hover:text-indigo-100 touch-target" aria-label="Previous paragraph">
              <SkipBack size={22} />
            </button>
            <button 
              onClick={handlePlay}
              className="p-4 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full text-indigo-900 shadow-lg shadow-amber-400/20 touch-target active:scale-95 transition-transform"
              aria-label={isPlaying && !isPaused ? 'Pause' : 'Play'}
            >
              {isPlaying && !isPaused ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button onClick={nextParagraph} className="p-3 text-indigo-300 hover:text-indigo-100 touch-target" aria-label="Next paragraph">
              <SkipForward size={22} />
            </button>
            {isPlaying && (
              <button onClick={handleStop} className="p-3 text-red-400 hover:text-red-300 touch-target" aria-label="Stop">
                <X size={22} />
              </button>
            )}
          </div>

          {/* Progress */}
          {isPlaying && (
            <div className="mt-3">
              <div className="h-1 bg-indigo-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${((currentParagraph + 1) / story.story.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-indigo-500 mt-1 text-center">
                Paragraph {currentParagraph + 1} of {story.story.length}
              </p>
            </div>
          )}

          {/* Voice Settings Panel */}
          {showVoiceSettings && (
            <div className="mt-4 pt-4 border-t border-indigo-700/50 space-y-4 animate-slide-up">
              <div>
                <label className="text-xs text-indigo-400 mb-2 block">Narrator Voice</label>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = voices.find(v => v.name === e.target.value);
                    if (voice) setSelectedVoice(voice);
                  }}
                  className="w-full p-2 rounded-lg bg-indigo-900/50 text-indigo-200 text-sm border border-indigo-700/50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                >
                  {voices.length === 0 && <option>Default Voice</option>}
                  {voices.map(v => (
                    <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-indigo-400 mb-2 block">Speaking Speed: {rate.toFixed(2)}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                  aria-label="Speaking speed"
                />
                <div className="flex justify-between text-[10px] text-indigo-500 mt-1">
                  <span>0.5x</span>
                  <span>0.85x</span>
                  <span>1.0x</span>
                  <span>1.5x</span>
                </div>
              </div>
            </div>
          )}

          {!isSupported && (
            <p className="mt-3 text-xs text-indigo-500 text-center">
              Your browser doesn't support voice storytelling. You can still enjoy reading the story.
            </p>
          )}
        </div>
      </div>

      {/* Story Content */}
      <div ref={contentRef} className="px-6 mb-8">
        <div className="space-y-4">
          {story.story.map((paragraph, index) => (
            <p
              key={index}
              data-paragraph={index}
              className={`story-text transition-all duration-500 rounded-lg px-2 py-1 ${
                isPlaying && currentParagraph === index
                  ? 'text-indigo-100 animate-paragraph-glow bg-amber-400/5'
                  : 'text-indigo-300'
              }`}
              style={{ fontSize: `${settings.fontSize}px` }}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Moral */}
      {story.moral && settings.showMoral && (
        <div className="px-6 mb-8">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-900/20 to-yellow-900/20 border border-amber-500/20">
            <p className="text-amber-300 text-sm font-medium mb-2">💛 Tonight's Little Lesson</p>
            <p className="text-amber-100/90 italic">{story.moral}</p>
          </div>
        </div>
      )}

      {/* Story Complete */}
      {storyComplete && (
        <div className="px-6 mb-8 text-center animate-slide-up">
          <div className="p-6 rounded-2xl glass-light">
            <p className="text-3xl mb-3">✨</p>
            <h3 className="text-xl font-bold text-indigo-100 mb-2">Sweet Dreams</h3>
            <p className="text-indigo-300 text-sm mb-4">You reached the end of the story.<br />Sleep peacefully, little dreamer. 🌙</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => { handleStop(); play(story.story, 0); }} className="px-4 py-2 bg-amber-400/20 text-amber-300 rounded-xl text-sm touch-target">
                <RotateCcw size={14} className="inline mr-1" /> Play Again
              </button>
              <button onClick={onBack} className="px-4 py-2 bg-indigo-800/50 text-indigo-300 rounded-xl text-sm touch-target">
                Choose Another Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="px-6 mb-8">
          <h3 className="text-lg font-bold text-indigo-100 mb-3">You might also like</h3>
          <div className="space-y-3">
            {recommendations.map(rec => (
              <button
                key={rec.id}
                onClick={() => { handleStop(); window.scrollTo(0, 0); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl glass-light hover:bg-indigo-700/30 transition-all text-left"
              >
                <StoryCover cover={rec.cover} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-indigo-100 truncate">{rec.title}</p>
                  <p className="text-xs text-indigo-400">{rec.duration} • {rec.category}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============ SLEEP PAGE ============
function SleepPage({ language }: { language: Language }) {
  const audioPlayer = useAudioPlayer();
  const sleepTimer = useSleepTimer(() => {
    audioPlayer.stop();
  });
  const [showTimerOptions, setShowTimerOptions] = useState(false);
  const [soundTab, setSoundTab] = useState<'ambient' | 'melody'>('ambient');
  const isHindi = language === 'hi';
  const timerOptions = [
    { label: isHindi ? 'बंद' : 'Off', value: 0 },
    { label: '10 min', value: 10 },
    { label: '20 min', value: 20 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '60 min', value: 60 },
  ];
  const allSounds = [...ambientSounds, ...melodySounds];

  return (
    <div className="pb-24 animate-fade-in">
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-indigo-100 mb-1">Sleep Sounds</h1>
        <p className="text-indigo-400 text-sm">Drift off to peaceful slumber...</p>
      </div>

      {/* Active Sound Display */}
      {audioPlayer.isPlaying && (
        <div className="px-6 mb-6">
          <div className="p-4 rounded-2xl glass-light text-center">
            <div className="text-3xl mb-2 animate-float">
              {ambientSounds.find(s => s.file === audioPlayer.currentSound)?.emoji || '🎵'}
            </div>
            <p className="text-indigo-200 font-medium">
              {ambientSounds.find(s => s.file === audioPlayer.currentSound)?.name || 'Playing...'}
            </p>
            <div className="mt-3 flex items-center justify-center gap-4">
              <button 
                onClick={audioPlayer.pause}
                className="p-3 rounded-full bg-indigo-800/50 text-indigo-200 touch-target"
                aria-label="Pause"
              >
                <Pause size={20} />
              </button>
              <button 
                onClick={audioPlayer.stop}
                className="p-3 rounded-full bg-red-900/30 text-red-300 touch-target"
                aria-label="Stop"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-3">
              <label className="text-xs text-indigo-400 block mb-1">Volume</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioPlayer.volume}
                onChange={(e) => audioPlayer.changeVolume(parseFloat(e.target.value))}
                className="w-full accent-amber-400"
                aria-label="Volume"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sleep Timer */}
      <div className="px-6 mb-6">
        <button
          onClick={() => setShowTimerOptions(!showTimerOptions)}
          className="w-full p-4 rounded-2xl glass-light flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Timer size={20} className="text-amber-300" />
            <div className="text-left">
              <p className="text-sm font-medium text-indigo-200">Sleep Timer</p>
              {sleepTimer.isActive ? (
                <p className="text-xs text-amber-300">{sleepTimer.formatTime(sleepTimer.timeLeft)} remaining</p>
              ) : (
                <p className="text-xs text-indigo-500">Set a timer</p>
              )}
            </div>
          </div>
          {sleepTimer.isActive ? (
            <button onClick={(e) => { e.stopPropagation(); sleepTimer.cancel(); }} className="text-xs text-red-400 touch-target p-2">
              Cancel
            </button>
          ) : (
            <ChevronRight size={18} className="text-indigo-400" />
          )}
        </button>

        {showTimerOptions && (
          <div className="mt-2 p-3 rounded-xl glass-light animate-slide-up">
            <div className="grid grid-cols-3 gap-2">
              {timerOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (opt.value > 0) {
                      sleepTimer.start(opt.value);
                    } else {
                      sleepTimer.cancel();
                    }
                    setShowTimerOptions(false);
                  }}
                  className="p-2 rounded-lg bg-indigo-800/50 text-indigo-200 text-sm hover:bg-indigo-700/50 transition-all touch-target"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sound Tabs */}
      <div className="px-6 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setSoundTab('ambient')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              soundTab === 'ambient'
                ? 'bg-amber-400 text-indigo-900'
                : 'glass-light text-indigo-300'
            }`}
          >
            {isHindi ? 'वातावरण ध्वनियाँ' : 'Ambient Sounds'}
          </button>
          <button
            onClick={() => setSoundTab('melody')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              soundTab === 'melody'
                ? 'bg-amber-400 text-indigo-900'
                : 'glass-light text-indigo-300'
            }`}
          >
            {isHindi ? 'संगीत धुन' : 'Melody Sounds'} 🎵
          </button>
        </div>
      </div>

      {/* Sound Grid */}
      <div className="px-6">
        <h2 className="text-lg font-bold text-indigo-100 mb-4">
          {soundTab === 'ambient' 
            ? (isHindi ? 'प्रकृति की ध्वनियाँ' : 'Nature Sounds')
            : (isHindi ? 'संगीत की धुन' : 'Musical Melodies')}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {(soundTab === 'ambient' ? ambientSounds : melodySounds).map(sound => (
            <button
              key={sound.id}
              onClick={() => {
                if (audioPlayer.currentSound === sound.file && audioPlayer.isPlaying) {
                  audioPlayer.stop();
                } else {
                  audioPlayer.play(sound.file);
                }
              }}
              className={`p-5 rounded-2xl text-center transition-all touch-target ${
                audioPlayer.currentSound === sound.file && audioPlayer.isPlaying
                  ? 'bg-amber-400/20 border-2 border-amber-400/50'
                  : 'glass-light hover:bg-indigo-700/30'
              }`}
            >
              <span className="text-4xl block mb-2">{sound.emoji}</span>
              <span className="text-sm font-medium text-indigo-200">{sound.name}</span>
              {audioPlayer.currentSound === sound.file && audioPlayer.isPlaying && (
                <div className="mt-2 flex justify-center gap-1">
                  <div className="w-1 h-3 bg-amber-400 rounded-full animate-pulse" />
                  <div className="w-1 h-4 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Calm message */}
      <div className="px-6 mt-8 text-center">
        <p className="text-indigo-500 text-sm italic">
          Close your eyes. Let the sounds carry you to dreamland. 🌙
        </p>
      </div>
    </div>
  );
}

// ============ FAVORITES PAGE ============
function FavoritesPage({ onOpenStory, language, allStories }: { onOpenStory: (story: Story) => void; language: Language; allStories: Story[] }) {
  const { favorites, toggleFavorite } = useFavorites();
  const favoriteStories = allStories.filter(s => favorites.includes(s.id));
  const isHindi = language === 'hi';

  return (
    <div className="pb-24 animate-fade-in">
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-indigo-100 mb-1">My Favorite Stories</h1>
        <p className="text-indigo-400 text-sm">Your dream shelf</p>
      </div>

      {favoriteStories.length === 0 ? (
        <div className="px-6 text-center py-16">
          <p className="text-5xl mb-4">🌙</p>
          <h2 className="text-xl font-bold text-indigo-200 mb-2">Your dream shelf is empty</h2>
          <p className="text-indigo-400 text-sm mb-6">
            Save your favorite stories<br />and find them here tonight.
          </p>
        </div>
      ) : (
        <div className="px-6 space-y-3">
          {favoriteStories.map(story => (
            <div key={story.id} className="flex items-center gap-3 p-3 rounded-2xl glass-light">
              <button onClick={() => onOpenStory(story)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                <StoryCover cover={story.cover} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-indigo-100 truncate">{story.title}</p>
                  <p className="text-xs text-indigo-400">{story.duration} • {story.category}</p>
                </div>
              </button>
              <button
                onClick={() => toggleFavorite(story.id)}
                className="p-2 touch-target"
                aria-label="Remove from favorites"
              >
                <Heart size={18} className="text-red-400 fill-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ SETTINGS PAGE ============
function SettingsPage({ language, setLanguage }: { language: Language; setLanguage: (lang: Language) => void }) {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const isHindi = language === 'hi';

  const themes: { id: ThemeMode; name: string; desc: string; color: string }[] = [
    { id: 'midnight', name: 'Midnight', desc: 'Deep navy background', color: 'bg-slate-900' },
    { id: 'purple-dream', name: 'Purple Dream', desc: 'Dark purple background', color: 'bg-purple-950' },
    { id: 'moonlight', name: 'Moonlight', desc: 'Dark blue with warm glow', color: 'bg-indigo-950' },
  ];

  return (
    <div className="pb-24 animate-fade-in">
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-indigo-100 mb-1">Settings</h1>
        <p className="text-indigo-400 text-sm">Customize your experience</p>
      </div>

      {/* Language */}
      <div className="px-6 mb-6">
        <h2 className="text-sm font-semibold text-indigo-300 mb-3 uppercase tracking-wide">
          {isHindi ? 'भाषा / Language' : 'Language / भाषा'}
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 p-4 rounded-xl text-center transition-all ${
              language === 'en'
                ? 'bg-amber-400/20 border-2 border-amber-400/50'
                : 'glass-light hover:bg-indigo-700/30'
            }`}
          >
            <span className="text-2xl block mb-1">🇬🇧</span>
            <span className="text-sm font-medium text-indigo-200">English</span>
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`flex-1 p-4 rounded-xl text-center transition-all ${
              language === 'hi'
                ? 'bg-amber-400/20 border-2 border-amber-400/50'
                : 'glass-light hover:bg-indigo-700/30'
            }`}
          >
            <span className="text-2xl block mb-1">🇮🇳</span>
            <span className="text-sm font-medium text-indigo-200">हिंदी</span>
          </button>
        </div>
      </div>

      {/* Theme */}
      <div className="px-6 mb-6">
        <h2 className="text-sm font-semibold text-indigo-300 mb-3 uppercase tracking-wide">Night Mode Theme</h2>
        <div className="space-y-2">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                theme === t.id ? 'bg-amber-400/10 border border-amber-400/30' : 'glass-light'
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${t.color} border border-indigo-500/30`} />
              <div className="text-left flex-1">
                <p className="text-sm font-medium text-indigo-100">{t.name}</p>
                <p className="text-xs text-indigo-400">{t.desc}</p>
              </div>
              {theme === t.id && <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                <span className="text-indigo-900 text-xs">✓</span>
              </div>}
            </button>
          ))}
        </div>
      </div>

      {/* Parent Settings */}
      <div className="px-6 mb-6">
        <h2 className="text-sm font-semibold text-indigo-300 mb-3 uppercase tracking-wide">Parent Settings</h2>
        <div className="space-y-3">
          <ToggleSetting
            label="Auto-play next story"
            checked={settings.autoPlayNext}
            onChange={(v) => updateSettings({ autoPlayNext: v })}
          />
          <ToggleSetting
            label="Show moral at end"
            checked={settings.showMoral}
            onChange={(v) => updateSettings({ showMoral: v })}
          />
          <ToggleSetting
            label="Remember reading position"
            checked={settings.rememberPosition}
            onChange={(v) => updateSettings({ rememberPosition: v })}
          />
          <ToggleSetting
            label="Reduce animations"
            checked={settings.reduceAnimations}
            onChange={(v) => updateSettings({ reduceAnimations: v })}
          />
        </div>
      </div>

      {/* Font Size */}
      <div className="px-6 mb-6">
        <h2 className="text-sm font-semibold text-indigo-300 mb-3 uppercase tracking-wide">Reading</h2>
        <div className="p-4 rounded-xl glass-light">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-indigo-200">Font Size</span>
            <span className="text-sm text-amber-300">{settings.fontSize}px</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => updateSettings({ fontSize: Math.max(14, settings.fontSize - 2) })}
              className="p-2 rounded-lg bg-indigo-800/50 text-indigo-200 touch-target"
              aria-label="Decrease font size"
            >
              <Minus size={16} />
            </button>
            <input
              type="range"
              min="14"
              max="28"
              step="2"
              value={settings.fontSize}
              onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
              className="flex-1 accent-amber-400"
              aria-label="Font size"
            />
            <button 
              onClick={() => updateSettings({ fontSize: Math.min(28, settings.fontSize + 2) })}
              className="p-2 rounded-lg bg-indigo-800/50 text-indigo-200 touch-target"
              aria-label="Increase font size"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Default Speed */}
      <div className="px-6 mb-6">
        <div className="p-4 rounded-xl glass-light">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-indigo-200">Default Narration Speed</span>
            <span className="text-sm text-amber-300">{settings.defaultSpeed.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={settings.defaultSpeed}
            onChange={(e) => updateSettings({ defaultSpeed: parseFloat(e.target.value) })}
            className="w-full accent-amber-400"
            aria-label="Default narration speed"
          />
        </div>
      </div>

      {/* About */}
      <div className="px-6 text-center py-8">
        <p className="text-2xl mb-2">🌙</p>
        <p className="text-indigo-300 font-medium">DreamyTales</p>
        <p className="text-indigo-500 text-xs mt-1">Magical Bedtime Stories for Kids</p>
        <p className="text-indigo-600 text-xs mt-2">v1.0.0</p>
      </div>
    </div>
  );
}

function ToggleSetting({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between p-4 rounded-xl glass-light"
      role="switch"
      aria-checked={checked}
    >
      <span className="text-sm text-indigo-200">{label}</span>
      <div className={`w-11 h-6 rounded-full transition-all relative ${checked ? 'bg-amber-400' : 'bg-indigo-700'}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? 'left-5.5' : 'left-0.5'}`} 
          style={{ left: checked ? '22px' : '2px' }}
        />
      </div>
    </button>
  );
}

// ============ SEO DATA HELPER ============
function getSEOData(page: Page, story: Story | null, language: Language = 'en') {
  const baseUrl = 'https://dreamytales.app';
  const isHindi = language === 'hi';
  
  if (page === 'reader' && story) {
    return {
      title: isHindi 
        ? `${story.title} – DreamyTales हिंदी कहानी`
        : `${story.title} – DreamyTales Bedtime Story`,
      description: isHindi
        ? `${story.description} ${story.category} कहानी, उम्र ${story.ageRange} के लिए। अवधि: ${story.duration}। पढ़ें या सुनें।`
        : `${story.description} A ${story.category.toLowerCase()} bedtime story for ages ${story.ageRange}. Duration: ${story.duration}. Read or listen with calming narration.`,
      url: `${baseUrl}/stories/${story.id}`,
      type: 'article' as const,
    };
  }
  
  switch (page) {
    case 'stories':
      return {
        title: isHindi ? 'कहानी संग्रह – DreamyTales' : 'Story Library – DreamyTales',
        description: isHindi 
          ? '20 जादुई कहानियाँ देखें। श्रेणी, उम्र के अनुसार खोजें या खोज बार का उपयोग करें।'
          : 'Browse 20 magical bedtime stories for children ages 3-10. Filter by category, age, or search for your perfect bedtime adventure.',
        url: `${baseUrl}/stories`,
      };
    case 'sleep':
      return {
        title: isHindi ? 'सुलाब ध्वनियाँ – DreamyTales' : 'Sleep Sounds & Timer – DreamyTales',
        description: isHindi
          ? 'शांत ध्वनियों के साथ सो जाएँ - बारिश, समुद्र, जंगल, आग की अंगीठी। सुलाब टाइमर से शांति से सोएँ।'
          : 'Drift off to sleep with calming ambient sounds including gentle rain, ocean waves, forest night, and fireplace. Set a sleep timer for peaceful rest.',
        url: `${baseUrl}/sleep`,
      };
    case 'favorites':
      return {
        title: isHindi ? 'मेरी पसंदीदा कहानियाँ – DreamyTales' : 'My Favorite Stories – DreamyTales',
        description: isHindi
          ? 'आपकी पसंदीदा कहानियों का संग्रह। सुंदर सपने लाने वाली कहानियों को सहेजें।'
          : 'Your collection of favorite bedtime stories. Save and revisit magical tales that bring sweet dreams.',
        url: `${baseUrl}/favorites`,
      };
    case 'settings':
      return {
        title: isHindi ? 'सेटिंग्स – DreamyTales' : 'Settings – DreamyTales',
        description: isHindi
          ? 'अपना अनुभव अनुकूलित करें। थीम, आवाज़ गति, फ़ॉन्ट आकार, और माता-पिता नियंत्रण बदलें।'
          : 'Customize your DreamyTales experience. Adjust themes, narration speed, font size, and parent controls for the perfect bedtime routine.',
        url: `${baseUrl}/settings`,
      };
    default:
      return {
        title: isHindi 
          ? 'DreamyTales – बच्चों के लिए जादुई कहानियाँ'
          : 'DreamyTales – Magical Bedtime Stories for Kids',
        description: isHindi
          ? '20 जादुई कहानियाँ, शांत आवाज़, सुलाब ध्वनियाँ, और नाइट मोड। 3-10 साल के बच्चों के लिए। मीठे सपने!'
          : 'Discover 20 magical bedtime stories with calming narration, sleep sounds, and night mode. Perfect for children ages 3-10. Sweet dreams await!',
        url: baseUrl,
      };
  }
}

// ============ MAIN APP ============
export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en';
  });
  const { theme } = useTheme();
  
  // Save language preference
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  
  // Get stories based on language
  const allStories = language === 'en' ? stories : hindiStories;
  
  // SEO
  const seoData = getSEOData(currentPage, currentStory, language);
  useSEO(seoData);

  const openStory = useCallback((story: Story) => {
    setCurrentStory(story);
    setCurrentPage('reader');
    window.scrollTo(0, 0);
  }, []);

  const navigate = useCallback((page: Page) => {
    setCurrentPage(page);
    setCurrentStory(null);
    window.scrollTo(0, 0);
  }, []);

  const goBack = useCallback(() => {
    setCurrentStory(null);
    setCurrentPage('stories');
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} onOpenStory={openStory} language={language} setLanguage={setLanguage} allStories={allStories} />;
      case 'stories':
        return <StoriesPage onOpenStory={openStory} language={language} allStories={allStories} />;
      case 'sleep':
        return <SleepPage language={language} />;
      case 'favorites':
        return <FavoritesPage onOpenStory={openStory} language={language} allStories={allStories} />;
      case 'settings':
        return <SettingsPage language={language} setLanguage={setLanguage} />;
      case 'reader':
        return currentStory ? <StoryReader story={currentStory} onBack={goBack} language={language} /> : null;
      default:
        return <HomePage onNavigate={navigate} onOpenStory={openStory} language={language} setLanguage={setLanguage} allStories={allStories} />;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 relative`}>
      <StarBackground />
      <div className="relative z-10 max-w-lg mx-auto">
        {renderPage()}
      </div>
      {currentPage !== 'reader' && (
        <BottomNav currentPage={currentPage} onNavigate={navigate} language={language} />
      )}
    </div>
  );
}
