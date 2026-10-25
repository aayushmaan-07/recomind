// ========================================================
// RecoMind — Vision Edition (Voice Input + Watchlist + Motion)
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  let currentCategory = 'Movies';
  let activeWatchlistFilter = 'All';

  // LocalStorage Key for Watchlist
  const WATCHLIST_KEY = 'recomind_watchlist_items';

  // Category Inspiration Chips
  const categoryChips = {
    Movies: [
      'Mind bending Sci Fi',
      'Rainy Day Noir Mystery',
      'High Stakes Heist',
      'Emotional Heartfelt Drama',
      'Aesthetic Studio Ghibli Vibe',
      'Fast paced Cyberpunk Action'
    ],
    Music: [
      'Late Night Coding / Lo-Fi',
      'Euphoric 80s Synthwave',
      'Calm Acoustic Coffee Shop',
      'Melancholic Indie Folk',
      'High-Adrenaline Workout Beats',
      'Deep Ambient Space Odyssey'
    ],
    Books: [
      'Fast-paced Whodunit Mystery',
      'Deep Mindset & Stoicism',
      'Cozy High Fantasy & Lore',
      'Hard Sci-Fi Space Opera',
      'Psychological Thriller Novel',
      'Bite-sized Human Psychology'
    ]
  };

  // Iconic Title Chips for Direct Search Mode
  const categoryTitleChips = {
    Movies: [
      'Interstellar',
      'Inception',
      'The Dark Knight',
      'Fight Club',
      'Spirited Away',
      'Parasite'
    ],
    Music: [
      'Bohemian Rhapsody',
      'Blinding Lights',
      'Hotel California',
      'Get Lucky (Daft Punk)',
      'Starboy',
      'Smells Like Teen Spirit'
    ],
    Books: [
      'Atomic Habits',
      'Sapiens',
      '1984 (George Orwell)',
      'Dune (Frank Herbert)',
      'The Great Gatsby',
      'To Kill a Mockingbird'
    ]
  };

  // Ambient Lighting by Category
  const ambientGlowThemes = {
    Movies: {
      left: '#3b82f6',  // Blue / Indigo
      right: '#9333ea'  // Violet / Purple
    },
    Music: {
      left: '#059669',  // Emerald
      right: '#0284c7'  // Sky Blue
    },
    Books: {
      left: '#d97706',  // Warm Amber
      right: '#7c3aed'  // Amethyst
    }
  };

  // DOM Elements
  const sliderTrack = document.getElementById('categorySliderTrack');
  const sliderPill = document.getElementById('sliderPill');
  const segmentTabs = document.querySelectorAll('.segment-tab');
  const ambientLeft = document.getElementById('ambientLeft');
  const ambientRight = document.getElementById('ambientRight');
  const moodInput = document.getElementById('moodInput');
  const favoritesInput = document.getElementById('favoritesInput');
  const moodCounter = document.getElementById('moodCounter');
  const vibeChipsContainer = document.getElementById('vibeChips');
  const form = document.getElementById('recommendForm');
  const submitBtn = document.getElementById('submitBtn');
  const loadingState = document.getElementById('loadingState');
  const loadingMessage = document.getElementById('loadingMessage');
  const errorBox = document.getElementById('errorBox');
  const errorTitle = document.getElementById('errorTitle');
  const errorMessage = document.getElementById('errorMessage');
  const closeErrorBtn = document.getElementById('closeErrorBtn');
  const resultsSection = document.getElementById('resultsSection');
  const resultsHeading = document.getElementById('resultsHeading');
  const resultsBadge = document.getElementById('resultsBadge');
  const cardsGrid = document.getElementById('cardsGrid');
  const newSearchBtn = document.getElementById('newSearchBtn');
  const copyToast = document.getElementById('copyToast');
  const toastMsg = document.getElementById('toastMsg');

  // Voice Input Element
  const voiceBtn = document.getElementById('voiceBtn');

  // Watchlist Elements
  const watchlistBtn = document.getElementById('watchlistBtn');
  const watchlistBadge = document.getElementById('watchlistBadge');
  const watchlistModal = document.getElementById('watchlistModal');
  const closeWatchlistBtn = document.getElementById('closeWatchlistBtn');
  const doneWatchlistBtn = document.getElementById('doneWatchlistBtn');
  const watchlistBackdrop = document.getElementById('watchlistBackdrop');
  const watchlistBody = document.getElementById('watchlistBody');
  const clearWatchlistBtn = document.getElementById('clearWatchlistBtn');
  const watchlistFilterPills = document.querySelectorAll('.watchlist-filter-pill');

  // History Elements
  const historyBtn = document.getElementById('historyBtn');
  const historyBadge = document.getElementById('historyBadge');
  const historyModal = document.getElementById('historyModal');
  const closeHistoryBtn = document.getElementById('closeHistoryBtn');
  const doneHistoryBtn = document.getElementById('doneHistoryBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const historyBody = document.getElementById('historyBody');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  // ========================================================
  // 📸 Feature 3: Export Aesthetic Bento Card Elements
  // ========================================================
  const exportCardBtn = document.getElementById('exportCardBtn');
  const exportBtnTxt = document.getElementById('exportBtnTxt');
  const exportCardContainer = document.getElementById('exportCardContainer');
  const bentoExportCard = document.getElementById('bentoExportCard');
  const exportMoodTxt = document.getElementById('exportMoodTxt');
  const exportDateTxt = document.getElementById('exportDateTxt');
  const exportItemsGrid = document.getElementById('exportItemsGrid');

  // ========================================================
  // 🎛️ Feature 4: AI Vibe Tweak & Custom Prompt Dock Elements
  // ========================================================
  const vibeTweakDock = document.getElementById('vibeTweakDock');
  const tweakPillsRow = document.getElementById('tweakPillsRow');
  const tweakActionPills = document.querySelectorAll('.tweak-action-pill');
  const customTweakInput = document.getElementById('customTweakInput');
  const applyCustomTweakBtn = document.getElementById('applyCustomTweakBtn');

  // ========================================================
  // 🎯 Feature 6: Direct Title Search & Discovery Mode Switcher
  // ========================================================
  const modePillBtns = document.querySelectorAll('.mode-pill-btn');
  const step02Block = document.getElementById('step02Block');
  const step02Label = document.getElementById('step02Label');
  const step03Block = document.getElementById('step03Block');
  const submitBtnTxt = document.getElementById('submitBtnTxt');
  const suggestionsLabel = document.getElementById('suggestionsLabel');

  // Active Curated Session State
  let currentDiscoveryMode = 'mood'; // 'mood' or 'title'
  let currentRecommendations = [];
  let currentMood = '';
  let currentFavorites = '';
  let currentActiveTweak = null;
  const sessionRejectedTitles = new Set();

  // ========================================================
  // User Authentication, Community Reviews & Admin Elements
  // ========================================================
  const AUTH_STORAGE_KEY = 'recomind_auth_user';
  let currentUser = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null');

  // Header Nav & Profile Dropdown Elements
  const adminNavBtn = document.getElementById('adminNavBtn');
  const authNavBtn = document.getElementById('authNavBtn');
  const authBtnAvatar = document.getElementById('authBtnAvatar');
  const authBtnName = document.getElementById('authBtnName');
  const profileDropdown = document.getElementById('profileDropdown');
  const menuAvatar = document.getElementById('menuAvatar');
  const menuFullName = document.getElementById('menuFullName');
  const menuHandle = document.getElementById('menuHandle');
  const menuRoleBadge = document.getElementById('menuRoleBadge');
  const menuProviderBadge = document.getElementById('menuProviderBadge');
  const menuAdminBtn = document.getElementById('menuAdminBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  // Auth Modal Elements
  const authModal = document.getElementById('authModal');
  const authBackdrop = document.getElementById('authBackdrop');
  const closeAuthBtn = document.getElementById('closeAuthBtn');
  const authModalTitle = document.getElementById('authModalTitle');
  const googleAuthBtn = document.getElementById('googleAuthBtn');
  const tabSignIn = document.getElementById('tabSignIn');
  const tabRegister = document.getElementById('tabRegister');
  const authAlert = document.getElementById('authAlert');
  const authForm = document.getElementById('authForm');
  const fullNameGroup = document.getElementById('fullNameGroup');
  const authFullName = document.getElementById('authFullName');
  const avatarPickerGroup = document.getElementById('avatarPickerGroup');
  const avatarPills = document.querySelectorAll('.avatar-pick-pill');
  const authUsername = document.getElementById('authUsername');
  const authPassword = document.getElementById('authPassword');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const authSubmitTxt = document.getElementById('authSubmitTxt');
  let authMode = 'signin'; // 'signin' or 'register'
  let selectedAvatar = '⚡';

  // Community Reviews Elements
  const reviewsModal = document.getElementById('reviewsModal');
  const reviewsBackdrop = document.getElementById('reviewsBackdrop');
  const closeReviewsBtn = document.getElementById('closeReviewsBtn');
  const reviewModalItemTitle = document.getElementById('reviewModalItemTitle');
  const reviewItemPoster = document.getElementById('reviewItemPoster');
  const reviewItemCategory = document.getElementById('reviewItemCategory');
  const reviewItemCreator = document.getElementById('reviewItemCreator');
  const reviewAverageScore = document.getElementById('reviewAverageScore');
  const reviewCountTxt = document.getElementById('reviewCountTxt');
  const communityReviewsList = document.getElementById('communityReviewsList');
  const writeReviewUserBadge = document.getElementById('writeReviewUserBadge');
  const reviewAuthPrompt = document.getElementById('reviewAuthPrompt');
  const promptLoginBtn = document.getElementById('promptLoginBtn');
  const writeReviewForm = document.getElementById('writeReviewForm');
  const starPicker = document.getElementById('starPicker');
  const starButtons = document.querySelectorAll('.star-btn');
  const selectedRatingText = document.getElementById('selectedRatingText');
  const reviewMoodMatch = document.getElementById('reviewMoodMatch');
  const reviewCommentInput = document.getElementById('reviewCommentInput');
  const reviewCharCounter = document.getElementById('reviewCharCounter');
  let currentReviewItem = null;
  let activeStarRating = 5;

  // Admin Dashboard Elements
  const adminModal = document.getElementById('adminModal');
  const adminBackdrop = document.getElementById('adminBackdrop');
  const closeAdminBtn = document.getElementById('closeAdminBtn');
  const doneAdminBtn = document.getElementById('doneAdminBtn');
  const statUsers = document.getElementById('statUsers');
  const statReviews = document.getElementById('statReviews');
  const statSessions = document.getElementById('statSessions');
  const statAiStatus = document.getElementById('statAiStatus');
  const adminTabUsers = document.getElementById('adminTabUsers');
  const adminTabReviews = document.getElementById('adminTabReviews');
  const adminUserCountPill = document.getElementById('adminUserCountPill');
  const adminReviewCountPill = document.getElementById('adminReviewCountPill');
  const adminUsersChamber = document.getElementById('adminUsersChamber');
  const adminReviewsChamber = document.getElementById('adminReviewsChamber');
  const adminUsersTableBody = document.getElementById('adminUsersTableBody');
  const adminReviewsTableBody = document.getElementById('adminReviewsTableBody');

  // 🎬 Trailer / Cinema Player Elements (Feature 1)
  const trailerModal = document.getElementById('trailerModal');
  const trailerBackdrop = document.getElementById('trailerBackdrop');
  const closeTrailerBtn = document.getElementById('closeTrailerBtn');
  const trailerIframe = document.getElementById('trailerIframe');
  const trailerLoadingOverlay = document.getElementById('trailerLoadingOverlay');
  const trailerLoadStatus = document.getElementById('trailerLoadStatus');
  const trailerModalTitle = document.getElementById('trailerModalTitle');
  const trailerMetaCreator = document.getElementById('trailerMetaCreator');
  const trailerMetaYear = document.getElementById('trailerMetaYear');
  const trailerMetaTag = document.getElementById('trailerMetaTag');
  const trailerMetaWhy = document.getElementById('trailerMetaWhy');
  const trailerExternalLink = document.getElementById('trailerExternalLink');
  const videoIdCache = new Map();
  let currentModalSession = 0;

  // ========================================================
  // Real Official Posters & Cover Art Fetcher (Feature 5)
  // ========================================================
  const artworkCache = new Map();

  async function fetchArtwork(title, creator, category) {
    if (!title) return null;
    const cacheKey = `${category}_${title}`.toLowerCase();
    if (artworkCache.has(cacheKey)) {
      return artworkCache.get(cacheKey);
    }

    // Try Wikipedia Generator Search (Official high-res posters/covers, zero-key, origin=*)
    let queries = [];
    if (category === 'Movies') {
      queries = [
        `${title} film`,
        `${title} ${creator || ''} film poster`,
        `${title}`
      ];
    } else if (category === 'Music') {
      queries = [
        `${title} album ${creator || ''}`,
        `${title} ${creator || ''} single`,
        `${title} ${creator || ''}`
      ];
    } else if (category === 'Books') {
      queries = [
        `${title} novel ${creator || ''}`,
        `${title} book ${creator || ''}`,
        `${title} ${creator || ''}`
      ];
    }

    for (const q of queries) {
      try {
        const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=600&pilicense=any&origin=*`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        const pages = data.query?.pages;
        if (pages) {
          const firstKey = Object.keys(pages)[0];
          const src = pages[firstKey]?.thumbnail?.source;
          if (src) {
            artworkCache.set(cacheKey, src);
            return src;
          }
        }
      } catch (_) {}
    }

    // Secondary Fallback for Music via iTunes API
    if (category === 'Music') {
      try {
        const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(title + ' ' + (creator || ''))}&entity=album&limit=1`;
        const res = await fetch(itunesUrl);
        const data = await res.json();
        if (data.results && data.results.length > 0 && data.results[0].artworkUrl100) {
          const highRes = data.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
          artworkCache.set(cacheKey, highRes);
          return highRes;
        }
      } catch (_) {}
    }

    // Secondary Fallback for Books via OpenLibrary API
    if (category === 'Books') {
      try {
        const olUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=1`;
        const res = await fetch(olUrl);
        const data = await res.json();
        if (data.docs && data.docs[0]?.cover_i) {
          const coverUrl = `https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-L.jpg`;
          artworkCache.set(cacheKey, coverUrl);
          return coverUrl;
        }
      } catch (_) {}
    }

    artworkCache.set(cacheKey, null);
    return null;
  }

  // ========================================================
  // Inline YouTube Trailer / Cinema Player Controller (Feature 1)
  // Resolves actual YouTube videoId to eliminate "This video is unavailable"
  // ========================================================
  async function openTrailerModal(item, category) {
    if (!item) return;

    currentModalSession++;
    const thisSession = currentModalSession;

    let creatorLabel = 'Directed by';
    let querySuffix = 'official trailer';
    let linkLabel = 'Open Trailer on YouTube';

    if (category === 'Music') {
      creatorLabel = 'Artist';
      querySuffix = 'official audio video';
      linkLabel = 'Open Music Video on YouTube';
    } else if (category === 'Books') {
      creatorLabel = 'Author';
      querySuffix = 'book summary discussion';
      linkLabel = 'Search Book Discussions on YouTube';
    }

    const searchQuery = `${item.title} ${item.creator || ''} ${querySuffix}`.trim();

    if (trailerModalTitle) trailerModalTitle.textContent = item.title || 'Untitled';
    if (trailerMetaCreator) trailerMetaCreator.textContent = `${creatorLabel}: ${item.creator || 'Unknown'}`;
    if (trailerMetaYear) trailerMetaYear.textContent = item.year ? String(item.year) : '';
    if (trailerMetaTag) trailerMetaTag.textContent = item.tag || category;
    if (trailerMetaWhy) trailerMetaWhy.textContent = item.why || 'Curated especially for your vibe.';

    const externalUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    if (trailerExternalLink) {
      trailerExternalLink.href = externalUrl;
      const linkSpan = trailerExternalLink.querySelector('span:first-child');
      if (linkSpan) linkSpan.textContent = linkLabel;
    }

    // Reset iframe and show loading overlay
    if (trailerIframe) {
      trailerIframe.src = '';
      trailerIframe.style.opacity = '0';
    }
    if (trailerLoadingOverlay) {
      trailerLoadingOverlay.innerHTML = `
        <div class="video-loader-spinner"></div>
        <p id="trailerLoadStatus">Loading cinema player...</p>
      `;
      trailerLoadingOverlay.classList.remove('hidden');
    }

    if (trailerModal) trailerModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Check client videoIdCache or query backend endpoint
    const cacheKey = searchQuery.toLowerCase();
    let videoId = videoIdCache.get(cacheKey);

    if (!videoId) {
      try {
        const res = await fetch(`/api/trailer?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data && data.success && data.videoId) {
          videoId = data.videoId;
          videoIdCache.set(cacheKey, videoId);
        }
      } catch (err) {
        console.warn('Error resolving trailer videoId:', err);
      }
    }

    // Prevent race condition if user closed or opened another modal
    if (thisSession !== currentModalSession) return;

    if (videoId && trailerIframe) {
      trailerIframe.onload = () => {
        if (thisSession === currentModalSession) {
          trailerIframe.style.opacity = '1';
          if (trailerLoadingOverlay) trailerLoadingOverlay.classList.add('hidden');
        }
      };
      // Standard official YouTube embed with video ID
      trailerIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    } else {
      // Fallback message if video ID couldn't be resolved
      if (trailerLoadingOverlay) {
        trailerLoadingOverlay.classList.remove('hidden');
        trailerLoadingOverlay.innerHTML = `
          <p style="color:#cbd5e1; font-size:14px; margin-bottom:12px;">Direct video preview couldn't be embedded.</p>
          <a href="${externalUrl}" target="_blank" rel="noopener noreferrer" class="theater-direct-link">
            <span>Watch directly on YouTube</span>
            <span>↗</span>
          </a>
        `;
      }
    }
  }

  function closeTrailerModal() {
    currentModalSession++;
    if (trailerIframe) {
      trailerIframe.src = '';
      trailerIframe.style.opacity = '0';
    }
    if (trailerLoadingOverlay) {
      trailerLoadingOverlay.innerHTML = `
        <div class="video-loader-spinner"></div>
        <p id="trailerLoadStatus">Loading cinema player...</p>
      `;
      trailerLoadingOverlay.classList.remove('hidden');
    }
    if (trailerModal) trailerModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (closeTrailerBtn) closeTrailerBtn.addEventListener('click', closeTrailerModal);
  if (trailerBackdrop) trailerBackdrop.addEventListener('click', closeTrailerModal);

  // Global ESC key to close all open modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (trailerModal && !trailerModal.classList.contains('hidden')) {
        closeTrailerModal();
      }
      if (watchlistModal && !watchlistModal.classList.contains('hidden')) {
        closeWatchlist();
      }
      if (historyModal && !historyModal.classList.contains('hidden')) {
        closeModal();
      }
    }
  });

  // ========================================================
  // 1. Butter-Smooth Physical Sliding Pill Controller
  // ========================================================
  function updateSliderPosition(activeBtn, immediate = false) {
    if (!activeBtn || !sliderPill || !sliderTrack) return;

    const trackRect = sliderTrack.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    const targetLeft = btnRect.left - trackRect.left;
    const targetWidth = btnRect.width;

    if (immediate) {
      sliderPill.style.transition = 'none';
    } else {
      sliderPill.style.transition = 'transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }

    sliderPill.style.transform = `translateX(${targetLeft}px)`;
    sliderPill.style.width = `${targetWidth}px`;
  }

  // Initial Slider Placement
  const initialActiveBtn = document.querySelector('.segment-tab.active');
  setTimeout(() => {
    updateSliderPosition(initialActiveBtn, true);
  }, 40);

  // Recalculate on Window Resize
  window.addEventListener('resize', () => {
    const currentBtn = document.querySelector('.segment-tab.active');
    updateSliderPosition(currentBtn, true);
  });

  // Toast Helper
  let toastTimer = null;
  function showToast(text) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMsg.textContent = text;
    copyToast.classList.remove('hidden');
    toastTimer = setTimeout(() => {
      copyToast.classList.add('hidden');
    }, 2400);
  }

  // ========================================================
  // 2. 🎙️ Web Speech API (Voice-to-Text)
  // ========================================================
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isListening = false;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isListening = true;
      voiceBtn.classList.add('listening');
      moodInput.placeholder = 'Listening... Speak your mood now...';
      showToast('🎙️ Listening... Speak your mood!');
    };

    recognition.onresult = (event) => {
      let speechText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        speechText += event.results[i][0].transcript;
      }
      moodInput.value = speechText;
      updateCounter();
    };

    recognition.onerror = (event) => {
      console.warn('Speech Recognition Error:', event.error);
      isListening = false;
      voiceBtn.classList.remove('listening');
      if (event.error === 'not-allowed') {
        showToast('Microphone access denied.');
      } else {
        showToast('Voice input stopped.');
      }
    };

    recognition.onend = () => {
      isListening = false;
      voiceBtn.classList.remove('listening');
      updateDefaultPlaceholder();
      if (moodInput.value.trim()) {
        showToast('Transcribed successfully! ✨');
      }
    };

    voiceBtn.addEventListener('click', () => {
      if (isListening) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (err) {
          recognition.stop();
        }
      }
    });
  } else {
    // If browser doesn't support Web Speech API
    voiceBtn.addEventListener('click', () => {
      showToast('Voice input not supported in this browser. Please type.');
    });
  }

  function updateDefaultPlaceholder() {
    if (currentDiscoveryMode === 'title') {
      if (currentCategory === 'Movies') {
        moodInput.placeholder = 'e.g. Interstellar, Inception, The Dark Knight, Fight Club, Parasite...';
      } else if (currentCategory === 'Music') {
        moodInput.placeholder = 'e.g. Bohemian Rhapsody, Blinding Lights, Hotel California, Starboy...';
      } else if (currentCategory === 'Books') {
        moodInput.placeholder = 'e.g. Atomic Habits, 1984, Dune, Sapiens, The Great Gatsby...';
      }
    } else {
      if (currentCategory === 'Movies') {
        moodInput.placeholder = 'e.g. Mind-bending psychological thriller with dark atmospheric rainy vibes and an unexpected plot twist...';
      } else if (currentCategory === 'Music') {
        moodInput.placeholder = 'e.g. Chill electronic music for late-night deep focus with low bass and minimal vocals...';
      } else if (currentCategory === 'Books') {
        moodInput.placeholder = 'e.g. Fast-paced philosophical fiction that questions reality, memory, and human consciousness...';
      }
    }
  }

  // ========================================================
  // 3. ❤️ Watchlist / Saved Collection Logic
  // ========================================================
  function getWatchlist() {
    try {
      return JSON.parse(localStorage.getItem(WATCHLIST_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveWatchlist(items) {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(items));
    updateWatchlistBadge();
  }

  function isItemSaved(title) {
    if (!title) return false;
    const list = getWatchlist();
    return list.some(item => item.title.toLowerCase() === title.toLowerCase());
  }

  function toggleSaveItem(itemData, category) {
    const list = getWatchlist();
    const existingIndex = list.findIndex(i => i.title.toLowerCase() === itemData.title.toLowerCase());

    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      saveWatchlist(list);
      showToast(`Removed "${itemData.title}" from Saved.`);
      return false; // Not saved
    } else {
      list.unshift({
        id: 'save_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        title: itemData.title,
        creator: itemData.creator,
        year: itemData.year,
        why: itemData.why,
        tag: itemData.tag,
        category: category || currentCategory,
        savedAt: new Date().toISOString()
      });
      saveWatchlist(list);
      showToast(`Saved "${itemData.title}" to Watchlist! ❤️`);
      return true; // Saved
    }
  }

  function updateWatchlistBadge() {
    const list = getWatchlist();
    const count = list.length;
    if (count > 0) {
      watchlistBadge.textContent = count;
      watchlistBadge.classList.remove('hidden');
    } else {
      watchlistBadge.classList.add('hidden');
    }
  }

  function renderWatchlistModal() {
    const allItems = getWatchlist();
    const filtered = activeWatchlistFilter === 'All'
      ? allItems
      : allItems.filter(i => (i.category || '').toLowerCase() === activeWatchlistFilter.toLowerCase());

    if (filtered.length === 0) {
      watchlistBody.innerHTML = `
        <div style="text-align: center; padding: 40px 0; color: #94a3b8;">
          <div style="font-size: 32px; margin-bottom: 8px;">🤍</div>
          <p style="font-weight: 600; color: #ffffff; margin-bottom: 4px;">No saved items in this category.</p>
          <p style="font-size: 13px;">Click the heart ❤️ on any recommendation card to save it here!</p>
        </div>
      `;
      return;
    }

    watchlistBody.innerHTML = '';
    filtered.forEach(item => {
      const row = document.createElement('div');
      row.className = 'saved-item-row';

      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(item.title + ' ' + (item.category || '') + ' ' + (item.creator || ''))}`;

      row.innerHTML = `
        <div class="saved-item-info">
          <h5 class="saved-item-title">${escapeHTML(item.title)}</h5>
          <div class="saved-item-meta">
            <span class="saved-cat-tag">${escapeHTML(item.category || 'Media')}</span>
            <span>&bull;</span>
            <span>${escapeHTML(item.creator || 'Unknown')}</span>
            <span>&bull;</span>
            <span>${escapeHTML(String(item.year || ''))}</span>
            <span>&bull;</span>
            <span style="color:#a5b4fc;">${escapeHTML(item.tag || '')}</span>
          </div>
        </div>
        <div class="saved-actions-right">
          <a href="${searchUrl}" target="_blank" rel="noopener noreferrer" class="details-link" title="Explore details">
            <span>Explore</span>
            <span>↗</span>
          </a>
          <button type="button" class="remove-saved-btn" title="Remove from saved" data-title="${escapeHTML(item.title)}">
            &times;
          </button>
        </div>
      `;

      // Remove single item listener
      const removeBtn = row.querySelector('.remove-saved-btn');
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSaveItem(item, item.category);
        renderWatchlistModal();
        syncCardHeartStates();
      });

      watchlistBody.appendChild(row);
    });
  }

  function syncCardHeartStates() {
    const saveButtons = document.querySelectorAll('.save-card-btn');
    saveButtons.forEach(btn => {
      const title = btn.getAttribute('data-title');
      if (isItemSaved(title)) {
        btn.classList.add('saved');
        btn.querySelector('.save-btn-txt').textContent = 'Saved';
      } else {
        btn.classList.remove('saved');
        btn.querySelector('.save-btn-txt').textContent = 'Save';
      }
    });
  }

  // Watchlist Filter Pills
  watchlistFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      watchlistFilterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeWatchlistFilter = pill.getAttribute('data-filter');
      renderWatchlistModal();
    });
  });

  // Watchlist Modal Controls
  function openWatchlist() {
    watchlistModal.classList.remove('hidden');
    renderWatchlistModal();
  }

  function closeWatchlist() {
    watchlistModal.classList.add('hidden');
  }

  watchlistBtn.addEventListener('click', openWatchlist);
  closeWatchlistBtn.addEventListener('click', closeWatchlist);
  doneWatchlistBtn.addEventListener('click', closeWatchlist);
  watchlistBackdrop.addEventListener('click', closeWatchlist);

  clearWatchlistBtn.addEventListener('click', () => {
    if (!confirm('Are you sure you want to clear your saved collection?')) return;
    saveWatchlist([]);
    renderWatchlistModal();
    syncCardHeartStates();
    showToast('Saved collection cleared.');
  });

  // ========================================================
  // 4. Suggestions Chips, Discovery Mode & Tab Switching
  // ========================================================
  function renderChips() {
    vibeChipsContainer.innerHTML = '';
    const chips = currentDiscoveryMode === 'title'
      ? (categoryTitleChips[currentCategory] || [])
      : (categoryChips[currentCategory] || []);

    chips.forEach((chipText, i) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'vision-vibe-pill';
      chip.textContent = chipText;
      chip.style.animationDelay = `${i * 45}ms`;
      chip.addEventListener('click', () => {
        moodInput.value = chipText;
        updateCounter();
        moodInput.focus();
        showToast(`Selected "${chipText}"`);
      });
      vibeChipsContainer.appendChild(chip);
    });
  }

  function setDiscoveryMode(mode) {
    currentDiscoveryMode = mode === 'title' ? 'title' : 'mood';
    modePillBtns.forEach(btn => {
      const isActive = btn.getAttribute('data-mode') === currentDiscoveryMode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (currentDiscoveryMode === 'title') {
      if (step02Label) {
        step02Label.innerHTML = `Enter Specific Title <span class="req-star">*</span>`;
      }
      if (step03Block) step03Block.classList.add('hidden');
      if (submitBtnTxt) submitBtnTxt.textContent = 'Find & Recommend Similar Picks 🎯';
      if (suggestionsLabel) suggestionsLabel.textContent = 'Iconic titles:';
    } else {
      if (step02Label) {
        step02Label.innerHTML = `Describe Your Vibe or Mood <span class="req-star">*</span>`;
      }
      if (step03Block) step03Block.classList.remove('hidden');
      if (submitBtnTxt) submitBtnTxt.textContent = 'Generate 6 Recommendations ⚡';
      if (suggestionsLabel) suggestionsLabel.textContent = 'Quick suggestions:';
    }

    updateDefaultPlaceholder();
    renderChips();
  }

  modePillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setDiscoveryMode(btn.getAttribute('data-mode'));
    });
  });

  function updateAmbientTheme(cat) {
    const theme = ambientGlowThemes[cat] || ambientGlowThemes.Movies;
    if (ambientLeft) {
      ambientLeft.style.background = `radial-gradient(circle, ${theme.left} 0%, rgba(0,0,0,0) 70%)`;
    }
    if (ambientRight) {
      ambientRight.style.background = `radial-gradient(circle, ${theme.right} 0%, rgba(0,0,0,0) 70%)`;
    }
  }

  segmentTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      segmentTabs.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      currentCategory = btn.getAttribute('data-category');

      // Reset active tweak modifier
      tweakActionPills.forEach(p => p.classList.remove('active'));
      currentActiveTweak = null;
      if (customTweakInput) customTweakInput.value = '';
      sessionRejectedTitles.clear();

      // Glide the physical glider pill smoothly!
      updateSliderPosition(btn, false);

      // Morph Ambient Lighting
      updateAmbientTheme(currentCategory);
      renderChips();

      // Dynamic placeholder updates
      updateDefaultPlaceholder();
      if (currentCategory === 'Movies') {
        favoritesInput.placeholder = 'e.g. Interstellar, Shutter Island, Arrival';
      } else if (currentCategory === 'Music') {
        favoritesInput.placeholder = 'e.g. Tycho, Bonobo, Daft Punk';
      } else if (currentCategory === 'Books') {
        favoritesInput.placeholder = 'e.g. 1984, Sapiens, Dark Matter';
      }
    });
  });

  // Character Counter
  function updateCounter() {
    const len = moodInput.value.length;
    moodCounter.textContent = `${len} / 250`;
    if (len > 220) {
      moodCounter.style.color = '#fbbf24';
    } else {
      moodCounter.style.color = '#64748b';
    }
  }
  moodInput.addEventListener('input', updateCounter);

  // Close Error Alert
  closeErrorBtn.addEventListener('click', () => {
    errorBox.classList.add('hidden');
  });

  function showError(title, msg) {
    errorTitle.textContent = title || 'Error';
    errorMessage.textContent = msg || 'An unexpected error occurred.';
    errorBox.classList.remove('hidden');
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function hideError() {
    errorBox.classList.add('hidden');
  }

  // ========================================================
  // 5. Unified Recommendation Dispatcher (Form Submit & Vibe Tweaks)
  // ========================================================
  async function executeRecommendation(category, mood, favorites, tweakConstraint = null) {
    hideError();

    if (!mood) {
      if (currentDiscoveryMode === 'title') {
        showError('Title Required', 'Please enter a movie, song, or book title to find matching twin recommendations.');
      } else {
        showError('Input Required', 'Please enter your mood or taste description (or use the microphone 🎙️) so the AI can curate recommendations.');
      }
      moodInput.focus();
      return;
    }

    // Persist current query parameters in session state
    currentCategory = category;
    currentMood = mood;
    currentFavorites = favorites;
    currentActiveTweak = tweakConstraint;

    // Set UI to loading state
    submitBtn.disabled = true;
    tweakActionPills.forEach(p => p.disabled = true);
    loadingState.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    loadingState.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Dynamic rotating loading message with smooth cross-fade
    let messages = [
      'Pulling together six picks for you...',
      `Analyzing ${category.toLowerCase()} vibes and narrative depth...`,
      'Balancing acclaim, novelty, and emotional resonance...',
      'Assembling your Liquid Glass Bento shortlist with Gemini AI...'
    ];

    if (currentDiscoveryMode === 'title') {
      messages = [
        `Looking up official details for "${mood}"...`,
        `Analyzing artistic DNA and themes of "${mood}"...`,
        'Finding 5 closest twin masterpieces with Gemini AI...',
        'Assembling your Direct Title Spotlight and twins...'
      ];
    } else if (tweakConstraint) {
      messages = [
        'Applying AI Vibe Tweak modifier...',
        `Fine-tuning curation: "${tweakConstraint}"...`,
        'Re-rolling Gemini AI candidate pool with new artistic constraints...',
        'Polishing your newly refined 6 picks...'
      ];
    }

    let msgIndex = 0;
    loadingMessage.textContent = messages[0];
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      loadingMessage.style.opacity = '0';
      loadingMessage.style.transform = 'translateY(6px)';
      setTimeout(() => {
        loadingMessage.textContent = messages[msgIndex];
        loadingMessage.style.opacity = '1';
        loadingMessage.style.transform = 'translateY(0)';
      }, 200);
    }, 2100);

    // Build prompt with creative fine-tuning constraint if selected
    let effectiveMood = mood;
    if (tweakConstraint) {
      effectiveMood = `${mood}\n[REFINED VIBE / CREATIVE ARTISTIC CONSTRAINT: ${tweakConstraint}]`;
    }

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category,
          mood: effectiveMood,
          favorites: favorites,
          mode: currentDiscoveryMode
        })
      });

      const result = await response.json();
      clearInterval(msgInterval);
      loadingState.classList.add('hidden');
      submitBtn.disabled = false;
      tweakActionPills.forEach(p => p.disabled = false);

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Server error occurred while generating recommendations.');
      }

      const items = result.data.recommendations || [];
      currentRecommendations = items;
      renderVisionCards(items, category);
      refreshHistoryCount();

      if (tweakConstraint) {
        showToast('Shortlist fine-tuned with AI Vibe Tweak! 🎛️');
      }

    } catch (err) {
      clearInterval(msgInterval);
      loadingState.classList.add('hidden');
      submitBtn.disabled = false;
      tweakActionPills.forEach(p => p.disabled = false);
      showError('Recommendation Request Failed', err.message);
    }
  }

  // Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Clear active tweak state on fresh submit
    tweakActionPills.forEach(p => p.classList.remove('active'));
    currentActiveTweak = null;

    const mood = moodInput.value.trim();
    const favorites = favoritesInput.value.trim();
    await executeRecommendation(currentCategory, mood, favorites, null);
  });

  // 🎛️ Feature 4: Vibe Tweak Pill Click Event Listeners
  tweakActionPills.forEach(pill => {
    pill.addEventListener('click', async (e) => {
      e.stopPropagation();
      const tweakModifier = pill.getAttribute('data-tweak');
      if (!tweakModifier) return;

      const baseMood = moodInput.value.trim() || currentMood;
      if (!baseMood) {
        showError('Mood Required', 'Please enter a mood or select a suggestion chip first before fine-tuning.');
        moodInput.focus();
        return;
      }

      // Mark clicked pill active
      tweakActionPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const favorites = favoritesInput.value.trim() || currentFavorites;
      await executeRecommendation(currentCategory, baseMood, favorites, tweakModifier);
    });
  });

  // ✍️ Feature 4B: Custom Free-Form Tweak Prompt Input Listener
  if (applyCustomTweakBtn && customTweakInput) {
    const handleCustomTweak = async () => {
      const customPrompt = customTweakInput.value.trim();
      if (!customPrompt) {
        showToast('Please write your custom instruction first! ✍️');
        customTweakInput.focus();
        return;
      }

      // Deselect preset pills
      tweakActionPills.forEach(p => p.classList.remove('active'));
      currentActiveTweak = customPrompt;

      const baseMood = moodInput.value.trim() || currentMood;
      if (!baseMood) {
        showError('Mood Required', 'Please enter a mood or select a suggestion chip first.');
        moodInput.focus();
        return;
      }

      const favorites = favoritesInput.value.trim() || currentFavorites;
      await executeRecommendation(currentCategory, baseMood, favorites, customPrompt);
    };

    applyCustomTweakBtn.addEventListener('click', handleCustomTweak);
    customTweakInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCustomTweak();
      }
    });
  }

  // ========================================================
  // 🔄 Feature: Swap / Replace Individual Recommendation Pick
  // ========================================================
  async function handleSwapCard(index, cardElement, currentItem) {
    // Show glass overlay on card
    const overlay = document.createElement('div');
    overlay.className = 'card-swap-overlay';
    overlay.innerHTML = `
      <div class="card-swap-spinner"></div>
      <p class="card-swap-txt">Finding replacement with Gemini AI...</p>
    `;
    cardElement.appendChild(overlay);

    try {
      const currentTitles = currentRecommendations.map(r => r.title);
      const excludeTitles = Array.from(new Set([...currentTitles, ...sessionRejectedTitles, currentItem.title]));

      let effectiveMood = currentMood || moodInput.value.trim();
      if (currentActiveTweak) {
        effectiveMood = `${effectiveMood}\n[REFINED VIBE / CREATIVE ARTISTIC CONSTRAINT: ${currentActiveTweak}]`;
      }

      const res = await fetch('/api/recommend/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: currentCategory,
          mood: effectiveMood,
          favorites: currentFavorites || favoritesInput.value.trim(),
          excludeTitles
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.data?.item) {
        throw new Error(data.message || 'Could not find alternative pick');
      }

      const newItem = data.data.item;
      sessionRejectedTitles.add(currentItem.title);

      // Update in-memory session shortlist
      currentRecommendations[index] = newItem;

      // Create new card element and smoothly replace
      const newCard = createVisionCardElement(newItem, index, currentCategory);
      newCard.style.animation = 'scaleIn 0.35s ease';
      cardsGrid.replaceChild(newCard, cardElement);

      showToast(`Replaced with "${newItem.title}"! 🔄`);
    } catch (err) {
      console.error('Swap card error:', err);
      overlay.remove();
      showToast('Could not replace pick. Please try again.');
    }
  }

  // ========================================================
  // 6. Create Individual Bento Card Element
  // ========================================================
  function createVisionCardElement(item, index, category) {
    const card = document.createElement('div');
    const isHero = index === 0;
    card.className = isHero ? 'vision-card spotlight-card' : 'vision-card';
    card.style.setProperty('--i', index);

    let creatorLabel = 'Creator';
    let playBtnLabel = 'Trailer';
    let catEmoji = '🎬';
    if (category === 'Movies') {
      creatorLabel = 'Directed by';
      playBtnLabel = 'Trailer';
      catEmoji = '🎬';
    } else if (category === 'Music') {
      creatorLabel = 'Artist';
      playBtnLabel = 'Listen';
      catEmoji = '🎵';
    } else if (category === 'Books') {
      creatorLabel = 'Author';
      playBtnLabel = 'Preview';
      catEmoji = '📚';
    }

    const queryTitle = `${item.title} ${category} ${item.creator || ''}`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(queryTitle)}`;
    const matchScore = isHero
      ? (currentDiscoveryMode === 'title' ? '★ SEARCHED TITLE' : '★ PRIME SPOTLIGHT')
      : `#0${index + 1} MATCH`;
    const isSaved = isItemSaved(item.title);

    const titleAbbr = (item.title || 'RM')
      .split(' ')
      .slice(0, 3)
      .map(w => w[0] || '')
      .join('')
      .toUpperCase();

    card.innerHTML = `
      <div class="card-inner-flex">
        <!-- 🖼️ Poster Thumbnail Column -->
        <div class="card-poster-column">
          <div class="poster-art-wrapper" title="Click to preview / watch ${playBtnLabel.toLowerCase()}">
            <div class="poster-shimmer-box"></div>
            <img class="card-poster-img" alt="${escapeHTML(item.title)} poster" loading="lazy" />
            <div class="poster-fallback-glyph hidden">
              <span class="fallback-cat-emoji">${catEmoji}</span>
              <span class="fallback-title-abbr">${escapeHTML(titleAbbr)}</span>
            </div>
            <div class="poster-play-overlay">
              <div class="play-badge-pill">
                <span class="play-triangle">▶</span>
                <span>${playBtnLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Metadata & Description Column -->
        <div class="card-content-column">
          <div class="card-top-banner">
            <div class="card-top-left-badges">
              <span class="match-pill">${matchScore}</span>
              <span class="vibe-tag-badge">${escapeHTML(item.tag || category)}</span>
            </div>
            <!-- 🔄 Swap / Replace Pick Button -->
            <button type="button" class="swap-card-btn" title="Don't like this? Remove & replace with a fresh pick">
              <span class="swap-icon">🔄</span>
              <span class="swap-txt">Swap</span>
            </button>
          </div>

          <h3 class="card-title">${escapeHTML(item.title || 'Untitled')}</h3>

          <div class="card-meta-line">
            <span class="creator-name">${creatorLabel}: ${escapeHTML(item.creator || 'Unknown')}</span>
            <span>&bull;</span>
            <span class="year-stamp">${escapeHTML(String(item.year || ''))}</span>
          </div>

          <div class="card-why-box">
            <p>${escapeHTML(item.why || 'Carefully curated for your requested mood and preferences.')}</p>
          </div>
        </div>
      </div>

      <!-- Card Action Footer -->
      <div class="card-action-footer">
        <!-- 🎬 Watch Trailer / Listen Action Button -->
        <button type="button" class="trailer-action-btn" title="Watch ${playBtnLabel.toLowerCase()}">
          <span class="trailer-icon">▶</span>
          <span class="trailer-btn-txt">${playBtnLabel}</span>
        </button>

        <div class="card-action-right-group">
          <!-- ❤️ Save to Watchlist Button -->
          <button type="button" class="save-card-btn ${isSaved ? 'saved' : ''}" data-title="${escapeHTML(item.title)}" title="Save to Watchlist">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="${isSaved ? '#f43f5e' : 'none'}" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="heart-card-icon">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span class="save-btn-txt">${isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <!-- 📋 Copy Button -->
          <button type="button" class="copy-action-btn" data-title="${escapeHTML(item.title)}" title="Copy title">
            <span>📋</span>
            <span>Copy</span>
          </button>

          <!-- ⭐ Community Reviews Button -->
          <button type="button" class="reviews-action-btn" data-title="${escapeHTML(item.title)}" title="View community ratings & reviews">
            <span>★</span>
            <span class="reviews-count-txt">Reviews</span>
          </button>

          <!-- ↗ Explore Link -->
          <a href="${searchUrl}" target="_blank" rel="noopener noreferrer" class="details-link" title="Explore on Google">
            <span>Explore</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    `;

    // 🔄 Swap Button Click
    const swapBtn = card.querySelector('.swap-card-btn');
    if (swapBtn) {
      swapBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleSwapCard(index, card, item);
      });
    }

    // Poster Click -> Open Trailer Modal
    const posterWrapper = card.querySelector('.poster-art-wrapper');
    if (posterWrapper) {
      posterWrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        openTrailerModal(item, category);
      });
    }

    // Trailer Button Click -> Open Trailer Modal
    const trailerBtn = card.querySelector('.trailer-action-btn');
    if (trailerBtn) {
      trailerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTrailerModal(item, category);
      });
    }

    // Save to Watchlist Event Listener
    const saveBtn = card.querySelector('.save-card-btn');
    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const saved = toggleSaveItem(item, category);
      if (saved) {
        saveBtn.classList.add('saved');
        saveBtn.querySelector('.save-btn-txt').textContent = 'Saved';
        saveBtn.querySelector('svg').setAttribute('fill', '#f43f5e');
      } else {
        saveBtn.classList.remove('saved');
        saveBtn.querySelector('.save-btn-txt').textContent = 'Save';
        saveBtn.querySelector('svg').setAttribute('fill', 'none');
      }
    });

    // Copy Button
    const copyBtn = card.querySelector('.copy-action-btn');
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(item.title).then(() => {
        showToast(`Copied "${item.title}"`);
      }).catch(() => {
        showToast(`Copied: ${item.title}`);
      });
    });

    // Community Reviews Button Click
    const revBtn = card.querySelector('.reviews-action-btn');
    if (revBtn) {
      revBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openReviewsModal(item, category);
      });

      fetch(`/api/reviews?itemTitle=${encodeURIComponent(item.title)}`)
        .then(r => r.json())
        .then(d => {
          if (d && d.count > 0 && revBtn) {
            revBtn.querySelector('.reviews-count-txt').textContent = `${d.averageRating} (${d.count})`;
          }
        })
        .catch(() => {});
    }

    // Async fetch official poster / cover artwork
    const posterImg = card.querySelector('.card-poster-img');
    const shimmerBox = card.querySelector('.poster-shimmer-box');
    const fallbackGlyph = card.querySelector('.poster-fallback-glyph');

    fetchArtwork(item.title, item.creator, category).then((artworkUrl) => {
      if (artworkUrl) {
        posterImg.onload = () => {
          posterImg.classList.add('loaded');
          if (shimmerBox) shimmerBox.style.display = 'none';
        };
        posterImg.onerror = () => {
          if (shimmerBox) shimmerBox.style.display = 'none';
          if (fallbackGlyph) fallbackGlyph.classList.remove('hidden');
        };
        posterImg.src = artworkUrl;
      } else {
        if (shimmerBox) shimmerBox.style.display = 'none';
        if (fallbackGlyph) fallbackGlyph.classList.remove('hidden');
      }
    }).catch(() => {
      if (shimmerBox) shimmerBox.style.display = 'none';
      if (fallbackGlyph) fallbackGlyph.classList.remove('hidden');
    });

    // Background prefetch trailer video ID
    let querySuffix = 'official trailer';
    if (category === 'Music') querySuffix = 'official audio video';
    else if (category === 'Books') querySuffix = 'book summary discussion';
    const trailerQuery = `${item.title} ${item.creator || ''} ${querySuffix}`.trim();
    const trailerCacheKey = trailerQuery.toLowerCase();
    if (!videoIdCache.has(trailerCacheKey)) {
      fetch(`/api/trailer?q=${encodeURIComponent(trailerQuery)}`)
        .then(r => r.json())
        .then(d => {
          if (d && d.success && d.videoId) {
            videoIdCache.set(trailerCacheKey, d.videoId);
          }
        })
        .catch(() => {});
    }

    return card;
  }

  // ========================================================
  // 6B. Render Bento Cards with Staggered Cascade Entrance
  // ========================================================
  function renderVisionCards(items, category) {
    currentRecommendations = items;
    currentCategory = category;
    cardsGrid.innerHTML = '';

    if (currentDiscoveryMode === 'title') {
      resultsHeading.textContent = `Picks Centered on "${currentMood}"`;
      resultsBadge.textContent = `🎯 Direct Title Spotlight`;
    } else {
      resultsHeading.textContent = `Top 6 ${category} Curated For You`;
      resultsBadge.textContent = `${category} Spotlight`;
    }

    items.forEach((item, index) => {
      const card = createVisionCardElement(item, index, category);
      cardsGrid.appendChild(card);
    });

    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // "Search Again" button resets focus
  newSearchBtn.addEventListener('click', () => {
    tweakActionPills.forEach(p => p.classList.remove('active'));
    currentActiveTweak = null;
    if (customTweakInput) customTweakInput.value = '';
    sessionRejectedTitles.clear();
    moodInput.focus();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ========================================================
  // 📸 Feature 3: Export Aesthetic Bento Card (High-Res PNG)
  // ========================================================
  async function exportAestheticCard() {
    if (!currentRecommendations || currentRecommendations.length === 0) {
      showToast('Generate recommendations first to export 📸');
      return;
    }

    if (typeof html2canvas === 'undefined') {
      showToast('Export library loading, please try in 2 seconds...');
      return;
    }

    const origBtnText = exportBtnTxt ? exportBtnTxt.textContent : 'Export Card';
    if (exportBtnTxt) exportBtnTxt.textContent = 'Rendering 4K...';
    if (exportCardBtn) exportCardBtn.disabled = true;

    // Temporarily bring the off-screen template into document plane at (0, 0)
    // behind the page (z-index: -9999) so html2canvas renders coordinates flawlessly
    if (exportCardContainer) {
      exportCardContainer.style.position = 'fixed';
      exportCardContainer.style.top = '0';
      exportCardContainer.style.left = '0';
      exportCardContainer.style.zIndex = '-9999';
    }

    try {
      // 1. Update Watermark and Mood Meta
      if (exportDateTxt) {
        const dateStr = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        exportDateTxt.textContent = `${currentCategory} Spotlight • ${dateStr}`;
      }

      if (exportMoodTxt) {
        if (currentActiveTweak) {
          exportMoodTxt.textContent = `"${currentMood}" • [Refined: ${currentActiveTweak}]`;
        } else {
          exportMoodTxt.textContent = `"${currentMood || 'Custom Taste Vibe'}"`;
        }
      }

      // 2. Fetch official artwork with proxy URL to eliminate canvas CORS taint
      if (exportItemsGrid) {
        exportItemsGrid.innerHTML = '';

        const artworkList = await Promise.all(
          currentRecommendations.map(async (item) => {
            let art = null;
            try {
              art = await fetchArtwork(item.title, item.creator, currentCategory);
            } catch (_) {}
            return { item, art };
          })
        );

        let catEmoji = '🎬';
        if (currentCategory === 'Music') catEmoji = '🎵';
        else if (currentCategory === 'Books') catEmoji = '📚';

        artworkList.forEach(({ item, art }, idx) => {
          const miniCard = document.createElement('div');
          miniCard.className = 'export-mini-card';

          const proxySrc = art ? `/api/proxy-image?url=${encodeURIComponent(art)}` : '';
          const matchLabel = idx === 0 ? '★ TOP SPOTLIGHT' : `#0${idx + 1} MATCH`;

          miniCard.innerHTML = `
            ${proxySrc 
              ? `<img class="export-mini-poster" crossOrigin="anonymous" src="${proxySrc}" alt="${escapeHTML(item.title)}" />`
              : `<div class="export-mini-poster" style="display:flex;align-items:center;justify-content:center;font-size:26px;">${catEmoji}</div>`
            }
            <div class="export-mini-meta">
              <div class="export-mini-tag">${matchLabel} • ${escapeHTML(item.tag || currentCategory)}</div>
              <div class="export-mini-title">${escapeHTML(item.title || 'Untitled')}</div>
              <div class="export-mini-creator">${escapeHTML(item.creator || 'Unknown')} • ${escapeHTML(String(item.year || ''))}</div>
              <div class="export-mini-why">${escapeHTML(item.why || 'Curated pick for your mood and taste preferences.')}</div>
            </div>
          `;
          exportItemsGrid.appendChild(miniCard);
        });

        // Ensure all proxy images are fully loaded before capturing
        const images = Array.from(exportItemsGrid.querySelectorAll('img'));
        await Promise.all(images.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            setTimeout(resolve, 2500); // 2.5s fallback
          });
        }));
      }

      // Small tick for browser repaint
      await new Promise(r => setTimeout(r, 150));

      // 3. Render 2x retina snapshot with html2canvas
      const canvas = await html2canvas(bentoExportCard, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#07090e',
        logging: false,
        width: 1200
      });

      // 4. Download file
      const safeCat = (currentCategory || 'Picks').toLowerCase();
      const fileName = `RecoMind_${safeCat}_Curated_${Date.now()}.png`;
      const imgUri = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = fileName;
      downloadLink.href = imgUri;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      showToast('Aesthetic Bento Card downloaded! 📸');
    } catch (err) {
      console.error('Export card capture error:', err);
      showToast('Failed to generate export card. Please try again.');
    } finally {
      // Restore offscreen hiding
      if (exportCardContainer) {
        exportCardContainer.style.position = 'absolute';
        exportCardContainer.style.top = '-9999px';
        exportCardContainer.style.left = '-9999px';
        exportCardContainer.style.zIndex = '';
      }
      if (exportBtnTxt) exportBtnTxt.textContent = origBtnText;
      if (exportCardBtn) exportCardBtn.disabled = false;
    }
  }

  if (exportCardBtn) {
    exportCardBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      exportAestheticCard();
    });
  }

  // History Count
  async function refreshHistoryCount() {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      const count = (data.data || []).length;
      if (count > 0) {
        historyBadge.textContent = count;
        historyBadge.classList.remove('hidden');
      } else {
        historyBadge.classList.add('hidden');
      }
    } catch (_) {}
  }

  // History Modal Logic
  async function loadHistory() {
    historyBody.innerHTML = '<p style="text-align:center; color:#94a3b8; padding:30px 0;">Loading past sessions...</p>';
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      const entries = data.data || [];

      if (entries.length === 0) {
        historyBody.innerHTML = '<p style="text-align:center; color:#94a3b8; padding:35px 0;">No saved curations yet. Try generating some picks first!</p>';
        return;
      }

      historyBody.innerHTML = '';
      entries.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'history-vision-card';

        const dateStr = entry.createdAt ? new Date(entry.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : '';
        const titles = (entry.recommendations || []).map(r => r.title).join(' • ');

        item.innerHTML = `
          <div class="hist-top-meta">
            <span class="hist-category-tag">${escapeHTML(entry.category)}</span>
            <span>${dateStr}</span>
          </div>
          <div class="hist-mood-headline">"${escapeHTML(entry.mood)}"</div>
          <div class="hist-titles-preview"><strong>Picks:</strong> ${escapeHTML(titles)}</div>
        `;

        item.addEventListener('click', () => {
          currentCategory = entry.category;
          currentMood = entry.mood;
          currentActiveTweak = null;
          tweakActionPills.forEach(p => p.classList.remove('active'));
          renderVisionCards(entry.recommendations, entry.category);
          closeModal();
          showToast(`Loaded ${entry.category} from history`);
        });

        historyBody.appendChild(item);
      });
    } catch (err) {
      historyBody.innerHTML = '<p style="text-align:center; color:#94a3b8;">Failed to load history.</p>';
    }
  }

  function openModal() {
    historyModal.classList.remove('hidden');
    loadHistory();
  }

  function closeModal() {
    historyModal.classList.add('hidden');
  }

  historyBtn.addEventListener('click', openModal);
  closeHistoryBtn.addEventListener('click', closeModal);
  doneHistoryBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);

  // Clear History
  clearHistoryBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to clear your recommendation history?')) return;
    try {
      const res = await fetch('/api/history', { method: 'DELETE' });
      if (res.ok) {
        refreshHistoryCount();
        loadHistory();
        showToast('History cleared.');
      }
    } catch (err) {
      alert('Failed to clear history.');
    }
  });

  // ========================================================
  // 7. USER AUTHENTICATION & PROFILE LOGIC
  // ========================================================

  function updateUserUI() {
    if (currentUser) {
      if (authNavBtn) {
        authNavBtn.classList.add('logged-in');
        if (currentUser.role === 'admin') {
          authNavBtn.classList.add('is-admin');
        } else {
          authNavBtn.classList.remove('is-admin');
        }
      }
      if (authBtnAvatar) authBtnAvatar.textContent = currentUser.avatar || '⚡';
      if (authBtnName) authBtnName.textContent = currentUser.fullName ? currentUser.fullName.split(' ')[0] : (currentUser.username || 'User');

      // Admin button in header
      if (adminNavBtn) {
        if (currentUser.role === 'admin') {
          adminNavBtn.classList.remove('hidden');
        } else {
          adminNavBtn.classList.add('hidden');
        }
      }

      // Dropdown details
      if (menuAvatar) menuAvatar.textContent = currentUser.avatar || '⚡';
      if (menuFullName) menuFullName.textContent = currentUser.fullName || 'User';
      if (menuHandle) menuHandle.textContent = `@${currentUser.username || 'user'}`;
      if (menuRoleBadge) {
        menuRoleBadge.textContent = currentUser.role === 'admin' ? 'Administrator' : 'User';
        if (currentUser.role === 'admin') menuRoleBadge.classList.add('admin-badge');
        else menuRoleBadge.classList.remove('admin-badge');
      }
      if (menuProviderBadge) {
        menuProviderBadge.textContent = currentUser.provider === 'google' ? 'Google' : 'Local';
      }
      if (menuAdminBtn) {
        if (currentUser.role === 'admin') menuAdminBtn.classList.remove('hidden');
        else menuAdminBtn.classList.add('hidden');
      }
    } else {
      if (authNavBtn) {
        authNavBtn.classList.remove('logged-in', 'is-admin');
      }
      if (authBtnAvatar) authBtnAvatar.textContent = '⚡';
      if (authBtnName) authBtnName.textContent = 'Sign In';
      if (adminNavBtn) adminNavBtn.classList.add('hidden');
      if (menuAdminBtn) menuAdminBtn.classList.add('hidden');
      if (profileDropdown) profileDropdown.classList.add('hidden');
    }
  }

  function openAuthModal(mode = 'signin') {
    authMode = mode;
    switchAuthTab(mode);
    hideAuthAlert();
    authModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (authUsername) authUsername.focus();
  }

  function closeAuthModal() {
    authModal.classList.add('hidden');
    document.body.style.overflow = '';
    hideAuthAlert();
  }

  function switchAuthTab(mode) {
    authMode = mode;
    hideAuthAlert();
    if (mode === 'signin') {
      tabSignIn.classList.add('active');
      tabRegister.classList.remove('active');
      authModalTitle.textContent = 'Welcome to RecoMind';
      fullNameGroup.classList.add('hidden');
      avatarPickerGroup.classList.add('hidden');
      authSubmitTxt.textContent = 'Log In';
    } else {
      tabRegister.classList.add('active');
      tabSignIn.classList.remove('active');
      authModalTitle.textContent = 'Create RecoMind Account';
      fullNameGroup.classList.remove('hidden');
      avatarPickerGroup.classList.remove('hidden');
      authSubmitTxt.textContent = 'Create Account';
    }
  }

  function showAuthAlert(msg, type = 'error') {
    authAlert.textContent = msg;
    authAlert.className = `auth-alert-box ${type}`;
    authAlert.classList.remove('hidden');
  }

  function hideAuthAlert() {
    authAlert.classList.add('hidden');
  }

  if (tabSignIn) tabSignIn.addEventListener('click', () => switchAuthTab('signin'));
  if (tabRegister) tabRegister.addEventListener('click', () => switchAuthTab('register'));
  if (closeAuthBtn) closeAuthBtn.addEventListener('click', closeAuthModal);
  if (authBackdrop) authBackdrop.addEventListener('click', closeAuthModal);

  // Avatar Picker Selection
  avatarPills.forEach(pill => {
    pill.addEventListener('click', () => {
      avatarPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedAvatar = pill.getAttribute('data-avatar');
    });
  });

  // Password Visibility Toggle
  if (togglePasswordBtn && authPassword) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPwd = authPassword.type === 'password';
      authPassword.type = isPwd ? 'text' : 'password';
      togglePasswordBtn.textContent = isPwd ? '🙈' : '👁️';
    });
  }

  // Header Nav Button Click
  if (authNavBtn) {
    authNavBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!currentUser) {
        openAuthModal('signin');
      } else {
        if (profileDropdown) profileDropdown.classList.toggle('hidden');
      }
    });
  }

  // Close profile dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (profileDropdown && !profileDropdown.classList.contains('hidden')) {
      if (!profileDropdown.contains(e.target) && !authNavBtn.contains(e.target)) {
        profileDropdown.classList.add('hidden');
      }
    }
  });

  // Logout Click
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      currentUser = null;
      localStorage.removeItem(AUTH_STORAGE_KEY);
      updateUserUI();
      if (profileDropdown) profileDropdown.classList.add('hidden');
      showToast('Logged out successfully.');
    });
  }

  // Auth Form Submit (Login / Register)
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAuthAlert();

      const username = authUsername.value.trim();
      const password = authPassword.value;
      const fullName = authFullName ? authFullName.value.trim() : '';

      if (authMode === 'register') {
        if (!fullName) {
          showAuthAlert('Please enter your full name');
          authFullName.focus();
          return;
        }
        if (!username || username.length < 3) {
          showAuthAlert('Username must be at least 3 characters');
          authUsername.focus();
          return;
        }
        if (!password || password.length < 4) {
          showAuthAlert('Password must be at least 4 characters');
          authPassword.focus();
          return;
        }

        authSubmitBtn.disabled = true;
        authSubmitTxt.textContent = 'Creating Account...';

        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName,
              username,
              password,
              avatar: selectedAvatar
            })
          });
          const data = await res.json();
          authSubmitBtn.disabled = false;
          authSubmitTxt.textContent = 'Create Account';

          if (!res.ok || !data.success) {
            showAuthAlert(data.message || 'Registration failed');
            return;
          }

          currentUser = data.user;
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
          updateUserUI();
          closeAuthModal();
          showToast(`Welcome to RecoMind, ${currentUser.fullName}!`);
        } catch (err) {
          authSubmitBtn.disabled = false;
          authSubmitTxt.textContent = 'Create Account';
          showAuthAlert('Unable to reach server. Please try again.');
        }
      } else {
        // Sign In
        if (!username || !password) {
          showAuthAlert('Please enter username and password');
          return;
        }

        authSubmitBtn.disabled = true;
        authSubmitTxt.textContent = 'Logging In...';

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          const data = await res.json();
          authSubmitBtn.disabled = false;
          authSubmitTxt.textContent = 'Log In';

          if (!res.ok || !data.success) {
            showAuthAlert(data.message || 'Invalid username or password');
            return;
          }

          currentUser = data.user;
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
          updateUserUI();
          closeAuthModal();
          showToast(`Welcome back, ${currentUser.fullName}!`);
        } catch (err) {
          authSubmitBtn.disabled = false;
          authSubmitTxt.textContent = 'Log In';
          showAuthAlert('Server connection failed. Please try again.');
        }
      }
    });
  }

  // Google Sign-In 1-Click
  if (googleAuthBtn) {
    googleAuthBtn.addEventListener('click', async () => {
      const email = prompt('Sign in with Google Account:\nEnter your Google Email (or press OK to login with demo Google profile):', 'aayushmaan.anand@gmail.com');
      if (!email || !email.trim()) return;

      const namePart = email.split('@')[0];
      const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            name: displayName,
            picture: '⚡',
            googleId: 'g_' + Math.random().toString(36).substr(2, 8)
          })
        });
        const data = await res.json();
        if (data.success && data.user) {
          currentUser = data.user;
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
          updateUserUI();
          closeAuthModal();
          showToast(`Logged in via Google as ${currentUser.fullName}!`);
        } else {
          showAuthAlert(data.message || 'Google authentication failed');
        }
      } catch (err) {
        showAuthAlert('Google Sign-In service error');
      }
    });
  }

  // ========================================================
  // 8. COMMUNITY REVIEWS & RATINGS LOGIC
  // ========================================================

  async function openReviewsModal(item, category) {
    if (!item) return;
    currentReviewItem = {
      title: item.title,
      category: category || currentCategory || 'Media',
      creator: item.creator || 'Unknown'
    };

    if (reviewModalItemTitle) reviewModalItemTitle.textContent = item.title || 'Untitled';
    if (reviewItemCategory) reviewItemCategory.textContent = currentReviewItem.category;
    if (reviewItemCreator) reviewItemCreator.textContent = currentReviewItem.creator;

    // Load artwork into review modal
    if (reviewItemPoster) {
      reviewItemPoster.src = '';
      fetchArtwork(item.title, item.creator, currentReviewItem.category).then(url => {
        if (url && reviewItemPoster) reviewItemPoster.src = url;
      });
    }

    // Auth state for writing review
    if (currentUser) {
      if (writeReviewForm) writeReviewForm.classList.remove('hidden');
      if (reviewAuthPrompt) reviewAuthPrompt.classList.add('hidden');
      if (writeReviewUserBadge) writeReviewUserBadge.textContent = `Posting as: ${currentUser.fullName}`;
    } else {
      if (writeReviewForm) writeReviewForm.classList.add('hidden');
      if (reviewAuthPrompt) reviewAuthPrompt.classList.remove('hidden');
    }

    // Reset star rating to 5
    setStarRating(5);
    if (reviewCommentInput) reviewCommentInput.value = '';
    if (reviewCharCounter) reviewCharCounter.textContent = '0 / 350';

    await loadItemReviews(item.title);
    if (reviewsModal) reviewsModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeReviewsModal() {
    if (reviewsModal) reviewsModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (closeReviewsBtn) closeReviewsBtn.addEventListener('click', closeReviewsModal);
  if (reviewsBackdrop) reviewsBackdrop.addEventListener('click', closeReviewsModal);
  if (promptLoginBtn) {
    promptLoginBtn.addEventListener('click', () => {
      closeReviewsModal();
      openAuthModal('signin');
    });
  }

  // Star Picker
  function setStarRating(num) {
    activeStarRating = num;
    starButtons.forEach(btn => {
      const val = Number(btn.getAttribute('data-value'));
      if (val <= num) btn.classList.add('active');
      else btn.classList.remove('active');
    });
    if (selectedRatingText) selectedRatingText.textContent = `${num} / 5 Stars`;
  }

  starButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = Number(btn.getAttribute('data-value'));
      setStarRating(val);
    });
  });

  // Review Comment Counter
  if (reviewCommentInput) {
    reviewCommentInput.addEventListener('input', () => {
      const len = reviewCommentInput.value.length;
      if (reviewCharCounter) reviewCharCounter.textContent = `${len} / 350`;
    });
  }

  // Load reviews for an item
  async function loadItemReviews(title) {
    if (!communityReviewsList) return;
    communityReviewsList.innerHTML = '<p style="text-align:center; color:#94a3b8; padding:20px 0;">Loading community reviews...</p>';

    try {
      const res = await fetch(`/api/reviews?itemTitle=${encodeURIComponent(title)}`);
      const data = await res.json();
      const reviews = data.data || [];

      if (reviewAverageScore) reviewAverageScore.textContent = data.averageRating || '5.0';
      if (reviewCountTxt) reviewCountTxt.textContent = `${reviews.length} Community Review${reviews.length === 1 ? '' : 's'}`;

      if (reviews.length === 0) {
        communityReviewsList.innerHTML = `
          <div style="text-align:center; color:#94a3b8; padding:30px 10px;">
            <p style="font-size:14px; margin-bottom:4px;">No reviews yet for this title.</p>
            <p style="font-size:12px; color:#64748b;">Be the first person in the community to share your thoughts!</p>
          </div>
        `;
        return;
      }

      communityReviewsList.innerHTML = '';
      reviews.forEach(r => {
        const card = document.createElement('div');
        card.className = 'community-review-card';

        const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : '';

        const starsStr = '★'.repeat(r.rating || 5);
        const canDelete = currentUser && (currentUser.id === r.userId || currentUser.role === 'admin');

        card.innerHTML = `
          <div class="review-card-top-row">
            <div class="review-card-author-info">
              <span class="review-author-avatar">${escapeHTML(r.userAvatar || '⚡')}</span>
              <div>
                <span class="review-author-name">${escapeHTML(r.userName || 'Anonymous')}</span>
                <span style="font-size:11px; color:#64748b; font-family:var(--font-mono); margin-left:6px;">@${escapeHTML(r.userHandle || 'user')}</span>
              </div>
            </div>
            <div class="review-card-stars-row">
              <span class="review-stars-gold">${starsStr}</span>
              <span class="review-mood-pill">${escapeHTML(r.moodMatch || 'Spot on')}</span>
            </div>
          </div>
          <p class="review-comment-body">${escapeHTML(r.comment || '')}</p>
          <div class="review-card-bottom-row">
            <span>${dateStr}</span>
            ${canDelete ? `<button type="button" class="delete-review-link-btn" data-id="${escapeHTML(r.id)}">Delete</button>` : ''}
          </div>
        `;

        const delBtn = card.querySelector('.delete-review-link-btn');
        if (delBtn) {
          delBtn.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to delete this review?')) return;
            try {
              const dRes = await fetch(`/api/reviews/${r.id}`, {
                method: 'DELETE',
                headers: { 'x-user-id': currentUser.id }
              });
              if (dRes.ok) {
                showToast('Review removed.');
                loadItemReviews(title);
              }
            } catch (_) {}
          });
        }

        communityReviewsList.appendChild(card);
      });
    } catch (err) {
      communityReviewsList.innerHTML = '<p style="text-align:center; color:#fca5a5; padding:20px 0;">Failed to load reviews.</p>';
    }
  }

  // Submit new review
  if (writeReviewForm) {
    writeReviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentUser) {
        openAuthModal('signin');
        return;
      }
      if (!currentReviewItem) return;

      const comment = reviewCommentInput.value.trim();
      if (!comment) return;

      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id
          },
          body: JSON.stringify({
            itemTitle: currentReviewItem.title,
            category: currentReviewItem.category,
            rating: activeStarRating,
            moodMatch: reviewMoodMatch.value,
            comment
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          reviewCommentInput.value = '';
          showToast('Review posted to community! ⭐');
          loadItemReviews(currentReviewItem.title);
        } else {
          showToast(data.message || 'Could not post review.');
        }
      } catch (err) {
        showToast('Error posting review.');
      }
    });
  }

  // ========================================================
  // 9. ADMIN COMMAND CENTER & ROLE-BASED ACCESS
  // ========================================================

  async function openAdminModal() {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('Admin privileges required.');
      return;
    }

    if (profileDropdown) profileDropdown.classList.add('hidden');
    if (adminModal) adminModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    await loadAdminStats();
    await loadAdminUsers();
  }

  function closeAdminModal() {
    if (adminModal) adminModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (adminNavBtn) adminNavBtn.addEventListener('click', openAdminModal);
  if (menuAdminBtn) menuAdminBtn.addEventListener('click', openAdminModal);
  if (closeAdminBtn) closeAdminBtn.addEventListener('click', closeAdminModal);
  if (doneAdminBtn) doneAdminBtn.addEventListener('click', closeAdminModal);
  if (adminBackdrop) adminBackdrop.addEventListener('click', closeAdminModal);

  // Admin Tab Switching
  if (adminTabUsers && adminTabReviews) {
    adminTabUsers.addEventListener('click', () => {
      adminTabUsers.classList.add('active');
      adminTabReviews.classList.remove('active');
      if (adminUsersChamber) adminUsersChamber.classList.remove('hidden');
      if (adminReviewsChamber) adminReviewsChamber.classList.add('hidden');
      loadAdminUsers();
    });

    adminTabReviews.addEventListener('click', () => {
      adminTabReviews.classList.add('active');
      adminTabUsers.classList.remove('active');
      if (adminReviewsChamber) adminReviewsChamber.classList.remove('hidden');
      if (adminUsersChamber) adminUsersChamber.classList.add('hidden');
      loadAdminReviews();
    });
  }

  async function loadAdminStats() {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-user-id': currentUser.id }
      });
      const data = await res.json();
      if (data.success && data.stats) {
        if (statUsers) statUsers.textContent = data.stats.totalUsers;
        if (statReviews) statReviews.textContent = data.stats.totalReviews;
        if (statSessions) statSessions.textContent = data.stats.totalSessions;
        if (statAiStatus) statAiStatus.textContent = data.stats.aiServiceStatus;
        if (adminUserCountPill) adminUserCountPill.textContent = data.stats.totalUsers;
        if (adminReviewCountPill) adminReviewCountPill.textContent = data.stats.totalReviews;
      }
    } catch (_) {}
  }

  async function loadAdminUsers() {
    if (!adminUsersTableBody) return;
    adminUsersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px;">Loading registered users...</td></tr>';

    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-user-id': currentUser.id }
      });
      const data = await res.json();
      const users = data.users || [];

      if (adminUserCountPill) adminUserCountPill.textContent = users.length;
      adminUsersTableBody.innerHTML = '';

      users.forEach(u => {
        const tr = document.createElement('tr');
        const isRootAdmin = u.id === 'usr_admin_001';
        const isSelf = u.id === currentUser.id;
        const joinedDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A';

        tr.innerHTML = `
          <td>
            <div class="table-user-cell">
              <span class="table-user-avatar">${escapeHTML(u.avatar || '⚡')}</span>
              <span class="table-user-name">${escapeHTML(u.fullName || 'User')}</span>
            </div>
          </td>
          <td><code>@${escapeHTML(u.username)}</code></td>
          <td><span style="font-size:11.5px; color:#94a3b8;">${escapeHTML(u.provider || 'local')}</span></td>
          <td>
            <span class="table-role-tag ${u.role === 'admin' ? 'admin' : 'user'}">
              ${u.role === 'admin' ? 'ADMIN' : 'USER'}
            </span>
          </td>
          <td>${joinedDate}</td>
          <td>
            <div class="table-actions-cell">
              ${!isRootAdmin ? `
                <button type="button" class="btn-toggle-role" data-id="${u.id}" data-role="${u.role}">
                  ${u.role === 'admin' ? 'Demote' : 'Promote Admin'}
                </button>
              ` : ''}
              ${!isRootAdmin && !isSelf ? `
                <button type="button" class="btn-delete-row" data-id="${u.id}">
                  Delete
                </button>
              ` : '<span style="font-size:11px; color:#64748b;">Protected</span>'}
            </div>
          </td>
        `;

        // Toggle Role Listener
        const toggleBtn = tr.querySelector('.btn-toggle-role');
        if (toggleBtn) {
          toggleBtn.addEventListener('click', async () => {
            const nextRole = u.role === 'admin' ? 'user' : 'admin';
            try {
              const pRes = await fetch(`/api/admin/users/${u.id}/role`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'x-user-id': currentUser.id
                },
                body: JSON.stringify({ role: nextRole })
              });
              if (pRes.ok) {
                showToast(`User role updated to ${nextRole}`);
                loadAdminUsers();
                loadAdminStats();
              }
            } catch (_) {}
          });
        }

        // Delete User Listener
        const delUserBtn = tr.querySelector('.btn-delete-row');
        if (delUserBtn) {
          delUserBtn.addEventListener('click', async () => {
            if (!confirm(`Are you sure you want to delete user @${u.username}? This will remove all their reviews.`)) return;
            try {
              const dRes = await fetch(`/api/admin/users/${u.id}`, {
                method: 'DELETE',
                headers: { 'x-user-id': currentUser.id }
              });
              if (dRes.ok) {
                showToast(`User @${u.username} deleted.`);
                loadAdminUsers();
                loadAdminStats();
              }
            } catch (_) {}
          });
        }

        adminUsersTableBody.appendChild(tr);
      });
    } catch (err) {
      adminUsersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#fca5a5;">Failed to load users.</td></tr>';
    }
  }

  async function loadAdminReviews() {
    if (!adminReviewsTableBody) return;
    adminReviewsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px;">Loading community reviews...</td></tr>';

    try {
      const res = await fetch('/api/admin/reviews', {
        headers: { 'x-user-id': currentUser.id }
      });
      const data = await res.json();
      const reviews = data.reviews || [];

      if (adminReviewCountPill) adminReviewCountPill.textContent = reviews.length;
      adminReviewsTableBody.innerHTML = '';

      if (reviews.length === 0) {
        adminReviewsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:30px;">No reviews in system yet.</td></tr>';
        return;
      }

      reviews.forEach(r => {
        const tr = document.createElement('tr');
        const rDate = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '';
        const stars = '★'.repeat(r.rating || 5);

        tr.innerHTML = `
          <td><strong>${escapeHTML(r.itemTitle)}</strong> <span style="font-size:11px; color:#38bdf8;">(${escapeHTML(r.category)})</span></td>
          <td>${escapeHTML(r.userName || '')} <span style="font-size:11px; color:#64748b;">@${escapeHTML(r.userHandle || '')}</span></td>
          <td style="color:#fbbf24;">${stars}</td>
          <td style="max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">"${escapeHTML(r.comment)}"</td>
          <td>${rDate}</td>
          <td>
            <div class="table-actions-cell">
              <button type="button" class="btn-delete-row" data-id="${r.id}">
                Delete
              </button>
            </div>
          </td>
        `;

        const delRevBtn = tr.querySelector('.btn-delete-row');
        if (delRevBtn) {
          delRevBtn.addEventListener('click', async () => {
            if (!confirm('Moderate and delete this review?')) return;
            try {
              const dRes = await fetch(`/api/admin/reviews/${r.id}`, {
                method: 'DELETE',
                headers: { 'x-user-id': currentUser.id }
              });
              if (dRes.ok) {
                showToast('Review deleted by Admin.');
                loadAdminReviews();
                loadAdminStats();
              }
            } catch (_) {}
          });
        }

        adminReviewsTableBody.appendChild(tr);
      });
    } catch (err) {
      adminReviewsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#fca5a5;">Failed to load reviews.</td></tr>';
    }
  }

  // Global ESC key to close all modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (trailerModal && !trailerModal.classList.contains('hidden')) {
        closeTrailerModal();
      }
      if (watchlistModal && !watchlistModal.classList.contains('hidden')) {
        closeWatchlist();
      }
      if (historyModal && !historyModal.classList.contains('hidden')) {
        closeModal();
      }
      if (authModal && !authModal.classList.contains('hidden')) {
        closeAuthModal();
      }
      if (reviewsModal && !reviewsModal.classList.contains('hidden')) {
        closeReviewsModal();
      }
      if (adminModal && !adminModal.classList.contains('hidden')) {
        closeAdminModal();
      }
      if (profileDropdown && !profileDropdown.classList.contains('hidden')) {
        profileDropdown.classList.add('hidden');
      }
    }
  });

  // Helper: Escape HTML
  function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial Setup
  renderChips();
  updateCounter();
  refreshHistoryCount();
  updateWatchlistBadge();
  updateUserUI();
});
