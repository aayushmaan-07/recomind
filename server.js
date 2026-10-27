const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HISTORY_FILE = path.join(__dirname, 'data', 'history.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const REVIEWS_FILE = path.join(__dirname, 'data', 'reviews.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Password Hashing Helpers
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const check = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return check === hash;
}

function sanitizeUser(user) {
  if (!user) return null;
  const { salt, hash, ...safe } = user;
  return safe;
}

// Ensure data folder and persistence files exist
function ensureDataFiles() {
  const dir = path.join(__dirname, 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 1. History
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify({ entries: [] }, null, 2));
  }

  // 2. Users (Seed or sync Admin account with environment variables)
  const envAdminUser = (process.env.ADMIN_USERNAME || 'admin').trim();
  const envAdminPass = (process.env.ADMIN_PASSWORD || 'admin123').trim();

  let usersData = { users: [] };
  if (fs.existsSync(USERS_FILE)) {
    try {
      usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (_) {
      usersData = { users: [] };
    }
  }

  let adminUser = (usersData.users || []).find(u => u.role === 'admin' || u.id === 'usr_admin_001');
  if (!adminUser) {
    const adminPass = hashPassword(envAdminPass);
    adminUser = {
      id: 'usr_admin_001',
      fullName: 'Aayushmaan Anand (Admin)',
      username: envAdminUser,
      email: `${envAdminUser}@recomind.ai`,
      salt: adminPass.salt,
      hash: adminPass.hash,
      avatar: '🛡️',
      role: 'admin',
      provider: 'local',
      createdAt: new Date().toISOString()
    };
    usersData.users.unshift(adminUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2));
  } else if (process.env.ADMIN_USERNAME || process.env.ADMIN_PASSWORD) {
    // If custom env vars are provided in Render/.env, auto-sync credentials
    const adminPass = hashPassword(envAdminPass);
    adminUser.username = envAdminUser;
    adminUser.salt = adminPass.salt;
    adminUser.hash = adminPass.hash;
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2));
  }

  // 3. Community Reviews (Seed initial reviews for demo)
  if (!fs.existsSync(REVIEWS_FILE)) {
    const demoReviews = [
      {
        id: 'rev_demo_01',
        itemTitle: 'Interstellar',
        category: 'Movies',
        rating: 5,
        moodMatch: '100% Spot on',
        comment: 'The docking scene and Hans Zimmer soundtrack gave me pure chills. Best sci-fi film ever.',
        userId: 'usr_admin_001',
        userName: 'Aayushmaan Anand',
        userHandle: 'admin',
        userAvatar: '🛡️',
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
      },
      {
        id: 'rev_demo_02',
        itemTitle: 'Channa Mereya',
        category: 'Music',
        rating: 5,
        moodMatch: '100% Spot on',
        comment: 'Pure melancholy and poetic sorrow. Arijit Singh connects directly to the heart.',
        userId: 'usr_demo_02',
        userName: 'Arunabh Aditya',
        userHandle: 'arunabh',
        userAvatar: '🎵',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
      }
    ];
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify({ reviews: demoReviews }, null, 2));
  }
}
ensureDataFiles();

// Database read/write helpers
function readUsers() {
  try {
    ensureDataFiles();
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')).users || [];
  } catch (err) {
    console.error('Error reading users:', err);
    return [];
  }
}

function saveUsers(users) {
  try {
    ensureDataFiles();
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
  } catch (err) {
    console.error('Error saving users:', err);
  }
}

function readReviews() {
  try {
    ensureDataFiles();
    return JSON.parse(fs.readFileSync(REVIEWS_FILE, 'utf8')).reviews || [];
  } catch (err) {
    console.error('Error reading reviews:', err);
    return [];
  }
}

function saveReviews(reviews) {
  try {
    ensureDataFiles();
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify({ reviews }, null, 2));
  } catch (err) {
    console.error('Error saving reviews:', err);
  }
}

// Helper to read history
function readHistory() {
  try {
    ensureDataFiles();
    const data = fs.readFileSync(HISTORY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading history file:', err);
    return { entries: [] };
  }
}

// Helper to save session to history (keeping bounded at max 50 entries)
function saveToHistory(entry) {
  try {
    const history = readHistory();
    history.entries.unshift(entry);
    if (history.entries.length > 50) {
      history.entries = history.entries.slice(0, 50);
    }
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (err) {
    console.error('Error saving to history file:', err);
  }
}

// Call Google Gemini API to get 6 structured recommendations
async function callGemini(category, mood, favorites, mode = 'mood') {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('MISSING_API_KEY');
  }

  let prompt = '';
  if (mode === 'title') {
    prompt = `You are RecoMind, an intelligent entertainment and literature recommendation engine.
The user wants recommendations directly based on the SPECIFIC SEARCHED TITLE: "${mood}" in the category: "${category}".

CRITICAL INSTRUCTIONS:
1. Item #1 MUST BE THE EXACT SEARCHED TITLE: "${mood}". Include its official creator (Director/Artist/Author), exact release year, a punchy 1-2 sentence description ("why") capturing its essence and brilliance, and its accurate genre/vibe tag ("tag").
2. Items #2 to #6 MUST BE 5 CLOSEST TWIN RECOMMENDATIONS that share the exact DNA, thematic depth, tone, or style of "${mood}". In the "why" field, explain specifically how each recommendation connects to "${mood}".
3. For Movies: include movie title, director (as creator), release year, punchy reason ("why"), and 1-3 word vibe tag ("tag").
4. For Music: include song/album title, artist/band (as creator), release year, punchy reason ("why"), and 1-3 word vibe tag ("tag").
5. For Books: include book title, author (as creator), publication year, punchy reason ("why"), and 1-3 word vibe tag ("tag").
6. Return ONLY a valid JSON array of exactly 6 objects with NO extra text, NO markdown code block wrappers (do not write \`\`\`json).

Output JSON Schema:
[
  {
    "title": "Item Title",
    "creator": "Director / Artist / Author Name",
    "year": "YYYY",
    "why": "Specific, compelling explanation of its brilliance and connection to ${mood}.",
    "tag": "Cerebral Sci-Fi"
  }
]`;
  } else {
    prompt = `You are RecoMind, an intelligent entertainment and literature recommendation engine.
The user wants recommendations for the category: "${category}".
User's mood/taste description: "${mood}".
${favorites ? `User's liked examples or favorites: "${favorites}".` : ''}

CRITICAL INSTRUCTIONS:
1. Recommend EXACTLY 6 distinct, high-quality, relevant items matching the user's mood.
2. For Movies: include movie title, director (as creator), release year, a punchy 1-2 sentence reason ("why"), and a 1-3 word vibe tag ("tag").
3. For Music: include song/album title, artist/band (as creator), release year, a punchy 1-2 sentence reason ("why"), and a 1-3 word vibe tag ("tag").
4. For Books: include book title, author (as creator), publication year, a punchy 1-2 sentence reason ("why"), and a 1-3 word vibe tag ("tag").
5. Return ONLY a valid JSON array of exactly 6 objects with NO extra text, NO markdown code block wrappers (do not write \`\`\`json).

Output JSON Schema:
[
  {
    "title": "Item Title",
    "creator": "Director / Artist / Author Name",
    "year": "YYYY",
    "why": "Specific, compelling reason this fits their mood and taste.",
    "tag": "Moody Noir"
  }
]`;
  }

  // List of active models to try in sequence for maximum reliability
  const candidateModels = [
    'gemini-flash-lite-latest',
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite-preview'
  ];

  let rawText = null;
  let lastError = null;

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json'
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Model ${model} returned ${response.status}:`, errText.slice(0, 100));
        lastError = new Error(`Model ${model} returned ${response.status}`);
        continue;
      }

      const data = await response.json();
      rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        break; // Successfully got response
      }
    } catch (err) {
      console.warn(`Error querying model ${model}:`, err.message);
      lastError = err;
    }
  }

  if (!rawText) {
    throw lastError || new Error('Empty response from AI service across all models');
  }

  // Clean any markdown formatting if present
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }

  const parsed = JSON.parse(cleaned);

  // Validate array of items
  const items = Array.isArray(parsed) ? parsed : (parsed.recommendations || parsed.items || []);
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('AI response did not contain an array of recommendations');
  }

  return items.slice(0, 6);
}

// Call Google Gemini API to get 1 single alternative recommendation (excluding shown titles)
async function callGeminiSingleSwap(category, mood, favorites, excludeTitles = []) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('MISSING_API_KEY');
  }

  const cleanExcludes = (Array.isArray(excludeTitles) ? excludeTitles : [])
    .filter(t => typeof t === 'string' && t.trim().length > 0)
    .map(t => `"${t.trim()}"`);

  const excludeInstruction = cleanExcludes.length > 0
    ? `EXCLUSION LIST (DO NOT RECOMMEND ANY OF THESE, USER HAS ALREADY SEEN OR REJECTED THEM): [${cleanExcludes.join(', ')}].`
    : '';

  const prompt = `You are RecoMind, an intelligent entertainment and literature recommendation engine.
The user wants EXACTLY 1 NEW single alternative recommendation for the category: "${category}".
User's mood/taste description: "${mood}".
${favorites ? `User's liked examples or favorites: "${favorites}".` : ''}
${excludeInstruction}

CRITICAL INSTRUCTIONS:
1. Recommend EXACTLY 1 new distinct, high-quality, relevant item matching the user's mood.
2. It MUST NOT match any item in the exclusion list.
3. For Movies: include title, director (as creator), release year, a punchy 1-2 sentence reason ("why"), and a 1-3 word vibe tag ("tag").
4. For Music: include title, artist/band (as creator), release year, a punchy 1-2 sentence reason ("why"), and a 1-3 word vibe tag ("tag").
5. For Books: include title, author (as creator), publication year, a punchy 1-2 sentence reason ("why"), and a 1-3 word vibe tag ("tag").
6. Return ONLY a single valid JSON object with NO extra text, NO markdown code block wrappers (do not write \`\`\`json).

Output JSON Schema:
{
  "title": "Item Title",
  "creator": "Director / Artist / Author Name",
  "year": "YYYY",
  "why": "Specific, compelling reason this fits their mood and taste.",
  "tag": "Moody Noir"
}`;

  const candidateModels = [
    'gemini-flash-lite-latest',
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite-preview'
  ];

  let rawText = null;
  let lastError = null;

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          responseMimeType: 'application/json'
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Model ${model} returned ${response.status}:`, errText.slice(0, 100));
        lastError = new Error(`Model ${model} returned ${response.status}`);
        continue;
      }

      const data = await response.json();
      rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        break;
      }
    } catch (err) {
      console.warn(`Error querying model ${model} for swap:`, err.message);
      lastError = err;
    }
  }

  if (!rawText) {
    throw lastError || new Error('Empty response from AI service across all models');
  }

  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }

  const parsed = JSON.parse(cleaned);
  const item = Array.isArray(parsed) ? parsed[0] : (parsed.recommendation || parsed.item || parsed);
  if (!item || !item.title) {
    throw new Error('AI response did not contain a valid replacement recommendation');
  }

  return {
    title: item.title || 'Untitled',
    creator: item.creator || 'Unknown',
    year: item.year || '',
    why: item.why || 'Curated replacement pick for your mood.',
    tag: item.tag || category
  };
}

// ======================== API ROUTES ======================== //

// 1. POST /api/recommend - Generate 6 recommendations
app.post('/api/recommend', async (req, res) => {
  try {
    const { category, mood, favorites, mode } = req.body;

    // Validation as specified in synopsis
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Please select a category (Movies, Music, or Books).' });
    }
    if (!mood || !mood.trim()) {
      return res.status(400).json({ success: false, message: 'Please describe your mood or enter a title.' });
    }

    const trimmedCategory = category.trim();
    const trimmedMood = mood.trim();
    const trimmedFavorites = favorites ? favorites.trim() : '';
    const searchMode = mode === 'title' ? 'title' : 'mood';

    const recommendations = await callGemini(trimmedCategory, trimmedMood, trimmedFavorites, searchMode);

    // Save to persistence layer (data/history.json)
    const sessionRecord = {
      id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      category: trimmedCategory,
      mood: trimmedMood,
      favorites: trimmedFavorites,
      mode: searchMode,
      recommendations,
      createdAt: new Date().toISOString()
    };
    saveToHistory(sessionRecord);

    return res.json({
      success: true,
      data: {
        id: sessionRecord.id,
        category: trimmedCategory,
        mode: searchMode,
        recommendations,
        createdAt: sessionRecord.createdAt
      }
    });
  } catch (err) {
    console.error('Error handling /api/recommend:', err.message);

    if (err.message === 'MISSING_API_KEY') {
      return res.status(500).json({
        success: false,
        message: 'Gemini API Key missing! Please paste your GEMINI_API_KEY in the .env file.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations. Please check your API key or internet connection and try again.'
    });
  }
});

// 1B. POST /api/recommend/swap - Swap an individual recommendation with a fresh one
app.post('/api/recommend/swap', async (req, res) => {
  try {
    const { category, mood, favorites, excludeTitles } = req.body;

    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required for replacement.' });
    }
    if (!mood || !mood.trim()) {
      return res.status(400).json({ success: false, message: 'Mood is required for replacement.' });
    }

    const trimmedCategory = category.trim();
    const trimmedMood = mood.trim();
    const trimmedFavorites = favorites ? favorites.trim() : '';
    const excludes = Array.isArray(excludeTitles) ? excludeTitles : [];

    const newItem = await callGeminiSingleSwap(trimmedCategory, trimmedMood, trimmedFavorites, excludes);

    return res.json({
      success: true,
      data: {
        item: newItem
      }
    });
  } catch (err) {
    console.error('Error handling /api/recommend/swap:', err.message);
    if (err.message === 'MISSING_API_KEY') {
      return res.status(500).json({
        success: false,
        message: 'Gemini API Key missing!'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to find a replacement recommendation. Please try again.'
    });
  }
});

// 2. GET /api/history - Retrieve past recommendation sessions
app.get('/api/history', (req, res) => {
  try {
    const history = readHistory();
    return res.json({ success: true, data: history.entries || [] });
  } catch (err) {
    console.error('Error fetching history:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve history.' });
  }
});



// 3. DELETE /api/history - Clear history
app.delete('/api/history', (req, res) => {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify({ entries: [] }, null, 2));
    return res.json({ success: true, message: 'History cleared successfully.' });
  } catch (err) {
    console.error('Error clearing history:', err);
    return res.status(500).json({ success: false, message: 'Failed to clear history.' });
  }
});



// In-memory cache for trailer video IDs
const trailerCache = new Map();

// 4. GET /api/trailer?q=... - Resolve actual YouTube Video ID (Fixes "This video is unavailable")
app.get('/api/trailer', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: 'Query parameter q is required' });
    }

    const trimmedQuery = q.trim();
    const cacheKey = trimmedQuery.toLowerCase();

    if (trailerCache.has(cacheKey)) {
      return res.json({ success: true, videoId: trailerCache.get(cacheKey) });
    }

    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(trimmedQuery)}`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!response.ok) {
      return res.status(502).json({ success: false, message: 'Failed to search YouTube' });
    }

    const html = await response.text();

    // 1st Match: /watch?v=XXXXXXXXXXX
    let videoId = null;
    const match1 = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
    if (match1 && match1[1]) {
      videoId = match1[1];
    } else {
      // 2nd Match: "videoId":"XXXXXXXXXXX"
      const match2 = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (match2 && match2[1]) {
        videoId = match2[1];
      }
    }

    if (videoId) {
      trailerCache.set(cacheKey, videoId);
      return res.json({ success: true, videoId });
    } else {
      return res.status(404).json({ success: false, message: 'No video found for query' });
    }
  } catch (err) {
    console.error('Error fetching trailer video ID:', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error while resolving trailer' });
  }
});



// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE')
  });
});

// ========================================================
// 5. USER AUTHENTICATION & REGISTRATION APIS
// ========================================================

// Register a new user
app.post('/api/auth/register', (req, res) => {
  try {
    const { fullName, username, password, avatar } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }
    if (!username || !username.trim() || username.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters' });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const users = readUsers();

    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      return res.status(409).json({ success: false, message: 'Username is already taken. Please choose another.' });
    }

    const { salt, hash } = hashPassword(password);
    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      fullName: fullName.trim(),
      username: cleanUsername,
      email: `${cleanUsername}@recomind.ai`,
      salt,
      hash,
      avatar: avatar || '🚀',
      role: 'user',
      provider: 'local',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: sanitizeUser(newUser)
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});



// Log in existing user
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const users = readUsers();
    const user = users.find(u => u.username.toLowerCase() === cleanUsername || (u.email && u.email.toLowerCase() === cleanUsername));

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // If local account, verify password hash
    if (user.provider === 'local') {
      const isValid = verifyPassword(password, user.salt, user.hash);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
    }

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
});



// Google One-Tap / OAuth Sign-In
app.post('/api/auth/google', (req, res) => {
  try {
    const { email, name, picture, googleId } = req.body;

    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Google account details missing' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = readUsers();
    let user = users.find(u => (u.email && u.email.toLowerCase() === cleanEmail) || (u.googleId && u.googleId === googleId));

    if (user) {
      // Existing user: update avatar & name if needed
      let changed = false;
      if (picture && user.avatar !== picture) {
        user.avatar = picture;
        changed = true;
      }
      if (name && user.fullName !== name.trim()) {
        user.fullName = name.trim();
        changed = true;
      }
      if (changed) {
        saveUsers(users);
      }
    } else {
      // Create new Google verified user
      const suggestedHandle = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      let username = suggestedHandle;
      let counter = 1;
      while (users.some(u => u.username === username)) {
        username = `${suggestedHandle}${counter++}`;
      }

      user = {
        id: 'usr_g_' + (googleId || Date.now()),
        fullName: name.trim(),
        username,
        email: cleanEmail,
        googleId: googleId || ('gid_' + Date.now()),
        avatar: picture || '⚡',
        role: 'user',
        provider: 'google',
        createdAt: new Date().toISOString()
      };

      users.push(user);
      saveUsers(users);
    }

    return res.json({
      success: true,
      message: 'Logged in with Google!',
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(500).json({ success: false, message: 'Server error during Google sign-in' });
  }
});



// Validate session
app.get('/api/auth/me', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  const users = readUsers();
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User session not found' });
  }
  return res.json({ success: true, user: sanitizeUser(user) });
});

// ========================================================
// 6. COMMUNITY REVIEWS APIS
// ========================================================

// GET reviews (all or by itemTitle)
app.get('/api/reviews', (req, res) => {
  try {
    const { itemTitle } = req.query;
    const allReviews = readReviews();

    let filtered = allReviews;
    if (itemTitle && itemTitle.trim()) {
      const q = itemTitle.trim().toLowerCase();
      filtered = allReviews.filter(r => (r.itemTitle || '').toLowerCase() === q);
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Compute stats
    const count = filtered.length;
    const avg = count > 0 ? (filtered.reduce((acc, r) => acc + (r.rating || 5), 0) / count).toFixed(1) : '5.0';

    return res.json({
      success: true,
      count,
      averageRating: avg,
      data: filtered
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});



// POST a review (requires authenticated user)
app.post('/api/reviews', (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { itemTitle, category, rating, moodMatch, comment } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Please log in to write a review' });
    }
    if (!itemTitle || !itemTitle.trim()) {
      return res.status(400).json({ success: false, message: 'Item title is required' });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Please write your thoughts in the review' });
    }

    const users = readUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please log in again.' });
    }

    const reviews = readReviews();
    const newReview = {
      id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      itemTitle: itemTitle.trim(),
      category: category || 'Media',
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      moodMatch: moodMatch || '100% Spot on',
      comment: comment.trim(),
      userId: user.id,
      userName: user.fullName,
      userHandle: user.username,
      userAvatar: user.avatar,
      userProvider: user.provider,
      createdAt: new Date().toISOString()
    };

    reviews.unshift(newReview);
    saveReviews(reviews);

    return res.status(201).json({
      success: true,
      message: 'Review posted to community!',
      review: newReview
    });
  } catch (err) {
    console.error('Error posting review:', err);
    return res.status(500).json({ success: false, message: 'Server error posting review' });
  }
});



// DELETE a review (Author or Admin only)
app.delete('/api/reviews/:id', (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const reviewId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const users = readUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const reviews = readReviews();
    const index = reviews.findIndex(r => r.id === reviewId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const targetReview = reviews[index];
    const isAuthor = targetReview.userId === user.id;
    const isAdmin = user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You can only delete your own reviews' });
    }

    reviews.splice(index, 1);
    saveReviews(reviews);

    return res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting review' });
  }
});



// ========================================================
// 7. ADMIN DASHBOARD & CONTROL APIS (Role-Based Access)
// ========================================================

function requireAdmin(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }
  const users = readUsers();
  const user = users.find(u => u.id === userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
  }
  req.adminUser = user;
  next();
}

// GET all users
app.get('/api/admin/users', requireAdmin, (req, res) => {
  const users = readUsers().map(sanitizeUser);
  return res.json({ success: true, count: users.length, users });
});

// DELETE a user
app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
  const targetId = req.params.id;

  if (targetId === 'usr_admin_001') {
    return res.status(400).json({ success: false, message: 'Cannot delete root admin account' });
  }
  if (targetId === req.adminUser.id) {
    return res.status(400).json({ success: false, message: 'Cannot delete your own active admin account' });
  }

  let users = readUsers();
  const exists = users.some(u => u.id === targetId);
  if (!exists) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  users = users.filter(u => u.id !== targetId);
  saveUsers(users);

  // Also remove their reviews
  let reviews = readReviews();
  reviews = reviews.filter(r => r.userId !== targetId);
  saveReviews(reviews);

  return res.json({ success: true, message: 'User and their activity removed from system' });
});

// Toggle role (promote to admin / demote to user)
app.patch('/api/admin/users/:id/role', requireAdmin, (req, res) => {
  const targetId = req.params.id;
  const { role } = req.body;

  if (targetId === 'usr_admin_001') {
    return res.status(400).json({ success: false, message: 'Cannot demote the root admin account' });
  }
  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }

  const users = readUsers();
  const user = users.find(u => u.id === targetId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.role = role;
  saveUsers(users);

  return res.json({ success: true, message: `User role updated to ${role}`, user: sanitizeUser(user) });
});

// GET all reviews across the app for moderation
app.get('/api/admin/reviews', requireAdmin, (req, res) => {
  const reviews = readReviews();
  reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json({ success: true, count: reviews.length, reviews });
});

// Admin delete any review
app.delete('/api/admin/reviews/:id', requireAdmin, (req, res) => {
  const reviewId = req.params.id;
  let reviews = readReviews();
  const index = reviews.findIndex(r => r.id === reviewId);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }
  reviews.splice(index, 1);
  saveReviews(reviews);
  return res.json({ success: true, message: 'Review moderated and removed by Admin' });
});

// System Stats
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const users = readUsers();
  const reviews = readReviews();
  const history = readHistory();

  return res.json({
    success: true,
    stats: {
      totalUsers: users.length,
      totalAdmins: users.filter(u => u.role === 'admin').length,
      totalReviews: reviews.length,
      totalSessions: (history.entries || []).length,
      aiServiceStatus: Boolean(process.env.GEMINI_API_KEY) ? 'Online (Gemini Active)' : 'API Key Missing'
    }
  });
});

// Image Proxy Endpoint to ensure CORS-free Canvas Export (Feature 3)
app.get('/api/proxy-image', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('URL required');

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) return res.status(response.status).send('Failed to fetch image');

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const arrayBuffer = await response.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error('Proxy image error:', err.message);
    return res.status(500).send('Error proxying image');
  }
});



// Serve frontend for all other requests
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`🚀 RecoMind Server running at http://localhost:${PORT}`);
  console.log(`=================================================\n`);
});
