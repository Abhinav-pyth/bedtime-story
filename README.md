# DreamyTales – Magical Bedtime Stories for Kids

A premium mobile-first bedtime story web application designed for children and parents. Features magical stories with calming narration, sleep sounds, night mode, and a beautiful dreamy aesthetic.

## ✨ Features

- **20 Original Bedtime Stories** - Complete, magical stories written for children
- **Text-to-Speech Narration** - Browser-based storytelling using Web Speech API
- **Ambient Sleep Sounds** - Rain, ocean, forest, fireplace and more
- **Sleep Timer** - Auto-stop with fade-out (10/20/30/45/60 minutes)
- **Night Mode Themes** - Midnight, Purple Dream, Moonlight
- **Story Categories** - Magical, Fantasy, Animals, Adventure, Fairy Tales, Nature, Friendship, Sleep, Moral
- **Search & Filter** - Find stories by title, content, category, or age range
- **Favorites** - Save stories to your dream shelf (localStorage)
- **Reading Progress** - Resume where you left off
- **Immersive Storytelling Mode** - Full-screen narration experience
- **Parent Settings** - Font size, narration speed, animation preferences
- **PWA Support** - Installable as a mobile app
- **Mobile-First Design** - Optimized for phones, responsive for all devices
- **Accessibility** - ARIA labels, keyboard navigation, reduced motion support

## 🚀 Installation

```bash
npm install
```

## 💻 Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📦 Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🎵 Audio File Setup

Ambient sounds are loaded from `/public/audio/`. Place your audio files there:

```
public/audio/
├── rain.mp3
├── heavy-rain.mp3
├── ocean.mp3
├── forest.mp3
├── fireplace.mp3
├── crickets.mp3
├── wind.mp3
└── sparkles.mp3
```

If audio files are not present, the corresponding sounds will be gracefully disabled without breaking the app.

## 🗣️ Browser Speech Synthesis

The app uses the Web Speech API (`window.speechSynthesis`) for narration.

### Limitations:
- Voice availability varies by browser and operating system
- Some browsers may require user interaction before speech starts
- Quality and naturalness of voices depends on the OS
- Mobile browsers may have limited voice options
- Speech may stop when the browser tab is in the background

### Recommended Browsers:
- Chrome/Edge (best voice selection on desktop)
- Safari (good natural voices on macOS/iOS)
- Firefox (basic support)

## 📱 PWA Setup

The app includes a `manifest.json` for PWA installation. To enable full PWA support:

1. Add app icons (192x192 and 512x512 PNG) to `/public/`
2. The manifest is already configured for standalone display
3. Users can install the app from their browser's "Add to Home Screen" option

## 🌐 Deployment

### Vercel (Recommended)

The app includes a `vercel.json` configuration file for seamless deployment.

**Option 1: Vercel CLI**
```bash
npm install -g vercel
vercel
```

**Option 2: Git Integration**
1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository at [vercel.com/new](https://vercel.com/new)
3. Vercel will automatically detect the Vite configuration
4. Click "Deploy"

**Option 3: Vercel Dashboard**
```bash
npm run build
vercel --prod
```

The `vercel.json` includes:
- SPA rewrites for client-side routing
- Optimized caching headers for assets
- Security headers (X-Frame-Options, X-Content-Type-Options)
- Audio file range request support

### Netlify
```bash
npm run build
# Set publish directory to dist/
# Add redirect rule: /* /index.html 200
```

### Any Static Host
The app is a static site - just serve the `dist/` folder. Ensure your server redirects all routes to `index.html` for client-side routing.

## 🔍 SEO

The app is optimized for search engines with:

- **Dynamic Meta Tags**: Title, description, and Open Graph tags update based on current page/story
- **Structured Data**: JSON-LD markup for WebApplication, Organization, and FAQ
- **Sitemap**: Static `sitemap.xml` listing all 20 story URLs
- **Robots.txt**: Crawl instructions for search engines
- **Semantic HTML**: Proper heading hierarchy and ARIA labels
- **Performance**: Fast load times with optimized assets

### Meta Tags by Page

Each page has unique SEO-optimized meta tags:

- **Home**: "DreamyTales – Magical Bedtime Stories for Kids"
- **Stories**: "Story Library – DreamyTales"
- **Sleep**: "Sleep Sounds & Timer – DreamyTales"
- **Favorites**: "My Favorite Stories – DreamyTales"
- **Settings**: "Settings – DreamyTales"
- **Each Story**: "{Story Title} – DreamyTales Bedtime Story"

### Open Graph & Twitter Cards

All pages include Open Graph and Twitter Card meta tags for rich social media sharing.

### Structured Data

The app includes JSON-LD structured data for:
- WebApplication schema (app information)
- Organization schema (company info)
- FAQ schema (common questions)
- Article schema (individual stories)

## 🏗️ Technology Stack

- React 18
- TypeScript
- Tailwind CSS v4
- Vite
- Lucide React (icons)
- Web Speech API (narration)
- HTML5 Audio API (ambient sounds)
- LocalStorage (preferences)

## 📁 Project Structure

```
src/
├── App.tsx          # Main app with all pages and components
├── main.tsx         # Entry point
├── index.css        # Global styles and animations
├── data/
│   └── stories.ts   # 20 original stories + categories + sounds
└── hooks/
    └── useApp.ts    # Custom hooks (speech, audio, timer, etc.)
public/
├── manifest.json    # PWA manifest
└── audio/           # Ambient sound files (user-provided)
```

## 🎨 Design

The app features a magical bedtime aesthetic with:
- Deep navy/midnight blue backgrounds
- Soft purple and lavender accents
- Golden star highlights
- Animated twinkling stars
- Glowing moon elements
- Glass morphism cards
- Smooth transitions and animations

All animations respect `prefers-reduced-motion` for accessibility.

## 📄 License

MIT
