// GAME X HUB - Core Client Application (Full-Stack & Interactive Arcade)

// ==========================================
// 1. STATE & STATIC CONFIG
// ==========================================

const API_BASE = '/api';

const GAMES_DATA = [
  {
    id: 'cyber-ascendancy',
    title: 'Cybernetic Ascendancy',
    desc: 'Engage in fast-paced neon space battles. Shoot rogue cyber-drones and earn raw XP directly synced to your user profile.',
    rating: '4.9',
    category: 'action',
    activePlayers: '22,410',
    tags: ['Canvas', 'Arcade', 'Shooter'],
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80',
    icon: 'fa-solid fa-gamepad'
  },
  {
    id: 'stellar-dominion',
    title: 'Stellar Dominion',
    desc: 'Build your star armada, capture hyperspace nodes, and out-tactician real opponents in real-time galactic war.',
    rating: '4.7',
    category: 'strategy',
    activePlayers: '8,410',
    tags: ['MMO', 'RTS', 'Space'],
    image: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=500&auto=format&fit=crop&q=80',
    icon: 'fa-solid fa-shuttle-space'
  },
  {
    id: 'rogue-synthetix',
    title: 'Rogue Synthetix',
    desc: 'Hack the cybergrid, assemble modular weapons, and defeat rogue security AI cores in this synthwave rogue-lite.',
    rating: '4.9',
    category: 'rpg',
    activePlayers: '19,890',
    tags: ['RPG', 'Cyberpunk', 'Roguelike'],
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80',
    icon: 'fa-solid fa-microchip'
  },
  {
    id: 'aether-drift',
    title: 'Aether Drift',
    desc: 'Hover-drift across vertical skyscrapers. Evade corporation heat-seeking drones and hack routing modules mid-air.',
    rating: '4.6',
    category: 'action',
    activePlayers: '6,120',
    tags: ['Racing', 'Speedrun', 'Synth'],
    image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=500&auto=format&fit=crop&q=80',
    icon: 'fa-solid fa-gauge-high'
  },
  {
    id: 'tactical-nexus',
    title: 'Tactical Nexus',
    desc: 'Turn-based hex grid combat. Command cybernetic squad members with custom abilities to secure strategic zones.',
    rating: '4.5',
    category: 'strategy',
    activePlayers: '4,520',
    tags: ['Turn-based', 'Hex', 'PvP'],
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=80',
    icon: 'fa-solid fa-chess-board'
  }
];

const TOURNAMENTS_DATA = [
  {
    id: 'val-cyber-cup',
    title: 'Valorant Cyber Cup',
    prize: '5,000 XP',
    slotsMax: 16,
    date: 'July 20, 2026',
    time: '18:00 UTC',
    tag: '5v5 Tactical',
    status: 'live'
  },
  {
    id: 'league-masters',
    title: 'League of Masters',
    prize: '7,500 XP',
    slotsMax: 32,
    date: 'July 24, 2026',
    time: '19:00 UTC',
    tag: '5v5 MOBA',
    status: 'upcoming'
  },
  {
    id: 'apex-void-run',
    title: 'Apex Legends Void Run',
    prize: '6,000 XP',
    slotsMax: 24,
    date: 'July 28, 2026',
    time: '17:00 UTC',
    tag: 'Trios Battle Royale',
    status: 'upcoming'
  }
];

const STORE_ITEMS = [
  { id: 'skin-neon-blade', name: 'Neon Blade Skin', cost: 200, emoji: '⚔️', icon: 'fa-solid fa-wand-magic-sparkles' },
  { id: 'hud-overlay', name: 'Cyberpunk HUD', cost: 350, emoji: '📐', icon: 'fa-solid fa-compass-drafting' },
  { id: 'avatar-border', name: 'Glitch Border', cost: 150, emoji: '🟢', icon: 'fa-solid fa-circle-nodes' },
  { id: 'weapon-wrap', name: 'Matrix Wrap', cost: 450, emoji: '🔫', icon: 'fa-solid fa-gun' }
];

const INITIAL_QUESTS = [
  { id: 'quest-checkin', name: 'First Check-in', desc: 'Log check-in status to claim initial XP yields.', points: 50 },
  { id: 'quest-register', name: 'Arena Challenger', desc: 'Sign up for any live or upcoming tournament bracket.', points: 100 },
  { id: 'quest-latency', name: 'Network Auditor', desc: 'Click and inspect all three online routing node features.', points: 75 },
  { id: 'quest-loot', name: 'Loot Collector', desc: 'Redeem points for cosmetic gear at the store.', points: 120 }
];

// Offline Local Database State (if backend server is down)
let localState = {
  isLoggedIn: false,
  username: '',
  role: 'Tactician',
  points: 150,
  level: 1,
  lastCheckInDate: null,
  checkInStreak: 0,
  inventory: [],
  registrations: [],
  viewedLatencyIndices: [],
  completedQuests: []
};

// Global App State (Runtime Cache)
let appState = {
  isLoggedIn: false,
  username: '',
  role: 'Tactician',
  points: 150,
  level: 1,
  lastCheckInDate: null,
  checkInStreak: 0,
  inventory: [],
  registrations: [],
  viewedLatencyIndices: [],
  completedQuests: []
};

let serverConnectionFailed = false;
let tournamentSlots = { 'val-cyber-cup': 12, 'league-masters': 24, 'apex-void-run': 12 };

// ==========================================
// 2. SYNTHESIZED RETRO AUDIO (WEB AUDIO API)
// ==========================================
const SynthAudio = {
  ctx: null,
  volumeNode: null,
  volumePercent: 0.5,

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.volumeNode = this.ctx.createGain();
      this.volumeNode.gain.setValueAtTime(this.volumePercent, this.ctx.currentTime);
      this.volumeNode.connect(this.ctx.destination);
      console.log('[AudioSynth] Web Audio Context booted.');
    } catch (e) {
      console.warn('[AudioSynth] Web Audio API unsupported in this browser environment.', e);
    }
  },

  setVolume(pct) {
    this.volumePercent = pct;
    if (this.volumeNode && this.ctx) {
      this.volumeNode.gain.setValueAtTime(pct, this.ctx.currentTime);
    }
  },

  playOscillator(freqStart, freqEnd, type, duration, delay = 0) {
    this.init();
    if (!this.ctx) return;
    
    // Resume audio context if browser suspended it due to click constraints
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, this.ctx.currentTime + delay);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + delay + duration);
    }

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(this.volumeNode);

    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration);
  },

  playLaser() {
    this.playOscillator(880, 110, 'sawtooth', 0.15);
  },

  playExplosion() {
    this.playOscillator(150, 40, 'triangle', 0.4);
    // Add noise click sound
    this.playOscillator(300, 20, 'sawtooth', 0.1);
  },

  playClick() {
    this.playOscillator(600, 600, 'sine', 0.05);
  },

  playCheckin() {
    // Beautiful upward synth run
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, idx) => {
      this.playOscillator(freq, freq, 'sine', 0.15, idx * 0.08);
    });
  },

  playLevelUp() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.playOscillator(freq, freq * 1.05, 'triangle', 0.25, idx * 0.1);
    });
  },

  playError() {
    this.playOscillator(180, 90, 'sawtooth', 0.3);
  }
};

// ==========================================
// 3. BACKEND API INTERACTION LAYER
// ==========================================

// Synchronize state with backend API (falls back to localStorage)
async function requestAPI(endpoint, method = 'GET', body = null) {
  if (serverConnectionFailed) {
    return handleOfflineFallback(endpoint, method, body);
  }

  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Server error.');
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.warn(`[API Connection Lost] Failing over to local storage cache: ${err.message}`);
    serverConnectionFailed = true;
    showToast('Backend link severed. Failover to local browser DB.', 'warning');
    return handleOfflineFallback(endpoint, method, body);
  }
}

// Fallback logic wrapper simulating endpoints via localStorage
function handleOfflineFallback(endpoint, method, body) {
  // Sync state from storage if necessary
  const localSaved = localStorage.getItem('gamex_state');
  if (localSaved) {
    localState = JSON.parse(localSaved);
  }

  if (endpoint.startsWith('/auth/connect')) {
    const { username, role } = body;
    localState.isLoggedIn = true;
    localState.username = username;
    if (role) localState.role = role;
    saveLocalState();
    return { success: true, player: localState };
  }
  
  if (endpoint.startsWith('/user/profile/')) {
    return { success: true, player: localState };
  }

  if (endpoint.startsWith('/user/checkin')) {
    const today = getTodayString();
    if (localState.lastCheckInDate === today) {
      throw new Error('Check-in matrix already claimed for today.');
    }
    
    const nextStreak = localState.checkInStreak + 1;
    const xpPayout = nextStreak * 10;
    localState.points += xpPayout;
    localState.lastCheckInDate = today;
    localState.checkInStreak = nextStreak > 7 ? 1 : nextStreak;
    localState.level = Math.floor(localState.points / 100) + 1;
    saveLocalState();
    return { success: true, player: localState, xpPayout, streak: localState.checkInStreak };
  }

  if (endpoint.startsWith('/quests/claim')) {
    const { questId, points } = body;
    if (!localState.completedQuests.includes(questId)) {
      localState.points += points;
      localState.completedQuests.push(questId);
      localState.level = Math.floor(localState.points / 100) + 1;
      saveLocalState();
    }
    return { success: true, player: localState };
  }

  if (endpoint.startsWith('/store/redeem')) {
    const { itemId, cost } = body;
    if (localState.points < cost) {
      throw new Error('Insufficient XP nodes to complete transaction.');
    }
    localState.points -= cost;
    localState.level = Math.floor(localState.points / 100) + 1;
    
    const item = localState.inventory.find(i => i.itemId === itemId);
    if (item) {
      item.quantity += 1;
    } else {
      localState.inventory.push({ itemId, quantity: 1 });
    }
    saveLocalState();
    return { success: true, player: localState };
  }

  if (endpoint.startsWith('/tournaments/register')) {
    const { tournamentId } = body;
    if (!localState.registrations.includes(tournamentId)) {
      localState.registrations.push(tournamentId);
      saveLocalState();
    }
    return { success: true, player: localState };
  }

  if (endpoint.startsWith('/arcade/score')) {
    const { score } = body;
    localState.points += score;
    localState.level = Math.floor(localState.points / 100) + 1;
    saveLocalState();
    return { success: true, player: localState };
  }

  if (endpoint.startsWith('/user/latency')) {
    const { index } = body;
    if (!localState.viewedLatencyIndices.includes(index)) {
      localState.viewedLatencyIndices.push(index);
      saveLocalState();
    }
    return { success: true, player: localState };
  }

  return { success: true };
}

function saveLocalState() {
  localStorage.setItem('gamex_state', JSON.stringify(localState));
}

// Get YYYY-MM-DD date string
function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Calculate level milestones
function getPlayerLevelMetrics() {
  const points = appState.points;
  const level = Math.floor(points / 100) + 1;
  const pointsInCurrentLevel = points % 100;
  return { level, xpPercent: pointsInCurrentLevel };
}

// ==========================================
// 4. RENDERING & UI CONTROL ENGINES
// ==========================================

async function loadAppState() {
  const savedUser = localStorage.getItem('gamex_current_user');
  if (savedUser) {
    try {
      const res = await requestAPI(`/user/profile/${savedUser}`);
      if (res.success && res.player) {
        appState = res.player;
        appState.isLoggedIn = true;
      }
    } catch (e) {
      console.error("Error loading app state", e);
    }
  } else {
    appState = { ...DEFAULT_USER_MOCK() };
  }
  updateUI();
}

function DEFAULT_USER_MOCK() {
  return {
    isLoggedIn: false,
    username: '',
    role: 'Tactician',
    points: 150,
    level: 1,
    lastCheckInDate: null,
    checkInStreak: 0,
    inventory: [],
    registrations: [],
    viewedLatencyIndices: [],
    completedQuests: []
  };
}

function updateUI() {
  const guestTrigger = document.getElementById('auth-trigger-btn');
  const userPill = document.getElementById('user-profile-pill');

  if (appState.isLoggedIn) {
    guestTrigger.style.display = 'none';
    userPill.style.display = 'flex';
    document.getElementById('user-pill-name').textContent = appState.username;
    document.getElementById('user-pill-points').innerHTML = `<i class="fa-solid fa-coins"></i> ${appState.points} XP`;
    
    // Set Drawer details
    document.getElementById('drawer-profile-name').textContent = appState.username;
    document.getElementById('drawer-profile-role').textContent = appState.role + " | Level " + getPlayerLevelMetrics().level;
    document.getElementById('drawer-coins-display').textContent = appState.points;
    
    const metrics = getPlayerLevelMetrics();
    document.getElementById('drawer-level-badge').textContent = `LVL ${metrics.level}`;
    document.getElementById('drawer-xp-percent').textContent = `${metrics.xpPercent}%`;
    document.getElementById('drawer-xp-fill').style.width = `${metrics.xpPercent}%`;
    
    renderInventoryDrawer();
    renderRegisteredTournamentsDrawer();
  } else {
    guestTrigger.style.display = 'block';
    userPill.style.display = 'none';
  }

  renderDailyCheckinStreak();
  renderQuestsList();
}

// Render Games Showcase
function renderGames(filterCategory = 'all', searchQuery = '') {
  const container = document.getElementById('games-grid-container');
  if (!container) return;

  container.innerHTML = '';
  
  const filtered = GAMES_DATA.filter(game => {
    const matchesCat = filterCategory === 'all' || game.category === filterCategory;
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          game.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-muted);">
        <i class="fa-solid fa-circle-exclamation" style="font-size: 2.5rem; color: var(--color-primary); margin-bottom: 12px;"></i>
        <p>No grid elements match your coordinates.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    
    const tagsHtml = game.tags.map(tag => `<span>#${tag}</span>`).join(' ');

    card.innerHTML = `
      <div class="game-card-media">
        <span class="game-card-tag">${game.category}</span>
        <span class="game-card-rating"><i class="fa-solid fa-star"></i> ${game.rating}</span>
        <img src="${game.image}" alt="${game.title}" class="game-card-img">
      </div>
      <div class="game-card-content">
        <h3 class="game-card-title">${game.title}</h3>
        <p class="game-card-desc">${game.desc}</p>
        <div class="game-card-footer">
          <div class="game-card-stats">
            <span class="game-card-stat"><i class="fa-solid fa-users"></i> ${game.activePlayers}</span>
          </div>
          <button class="btn btn-secondary btn-sm launch-game-btn" data-id="${game.id}" data-title="${game.title}">
            <i class="${game.icon}"></i> Launch
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Attach launch buttons
  container.querySelectorAll('.launch-game-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title');
      SynthAudio.playClick();
      handleLaunchGame(id, title);
    });
  });
}

// Fetch and render Tournaments
async function renderTournaments() {
  const container = document.getElementById('tournaments-grid-container');
  if (!container) return;

  container.innerHTML = '';

  // Retrieve real-time registered counts from server
  try {
    const res = await fetch(`${API_BASE}/tournaments/slots`);
    if (res.ok) {
      const slotsData = await res.json();
      if (slotsData.slots) tournamentSlots = slotsData.slots;
    }
  } catch (err) {
    console.warn("Could not fetch server tournament slots, using local client map.");
  }

  TOURNAMENTS_DATA.forEach(tourney => {
    const card = document.createElement('div');
    card.className = 'glass-panel tournament-card';
    
    const isRegistered = appState.registrations.includes(tourney.id);
    const btnText = isRegistered ? '<i class="fa-solid fa-check"></i> Registered' : '<i class="fa-solid fa-signature"></i> Secure Seed';
    const btnClass = isRegistered ? 'btn-outline' : 'btn-primary';
    const btnDisabled = isRegistered ? 'disabled' : '';
    
    // Calculate slots percentage
    const currentReg = tournamentSlots[tourney.id] || tourney.slotsMax / 2;
    const slotsPct = (currentReg / tourney.slotsMax) * 100;
    
    card.innerHTML = `
      <div class="tournament-header">
        <span class="tournament-status ${tourney.status}">${tourney.status}</span>
        <span class="tournament-prize">${tourney.prize} PRIZE</span>
      </div>
      <h3 class="tournament-title">${tourney.title}</h3>
      
      <div class="tournament-meta">
        <div class="tournament-meta-item">
          <i class="fa-solid fa-calendar"></i>
          <span>${tourney.date}</span>
        </div>
        <div class="tournament-meta-item">
          <i class="fa-solid fa-clock"></i>
          <span>${tourney.time}</span>
        </div>
        <div class="tournament-meta-item">
          <i class="fa-solid fa-tag"></i>
          <span>${tourney.tag}</span>
        </div>
        <div class="tournament-meta-item">
          <i class="fa-solid fa-users"></i>
          <span>${currentReg}/${tourney.slotsMax} Squads</span>
        </div>
      </div>
      
      <div class="tournament-footer">
        <div class="slots-bar-container">
          <div class="slots-text">
            <span>Fill Ratio</span>
            <span>${Math.round(slotsPct)}%</span>
          </div>
          <div class="slots-bar">
            <div class="slots-fill" style="width: ${slotsPct}%;"></div>
          </div>
        </div>
        <button class="btn ${btnClass} btn-sm register-tourney-btn" data-id="${tourney.id}" ${btnDisabled}>
          ${btnText}
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  // Attach buttons
  container.querySelectorAll('.register-tourney-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tourneyId = btn.getAttribute('data-id');
      SynthAudio.playClick();
      handleTournamentJoinTrigger(tourneyId);
    });
  });
}

function renderDailyCheckinStreak() {
  const container = document.getElementById('checkin-streak-days');
  if (!container) return;

  container.innerHTML = '';
  
  for (let d = 1; d <= 7; d++) {
    const isCompleted = appState.checkInStreak >= d;
    const isCurrent = appState.checkInStreak + 1 === d;
    
    let dayClass = 'checkin-day';
    if (isCompleted) dayClass += ' completed';
    if (isCurrent && !hasCheckedInToday()) dayClass += ' current';
    
    const node = document.createElement('div');
    node.className = dayClass;
    node.innerHTML = `
      <span>Day ${d}</span>
      <strong>+${d * 10}</strong>
    `;
    container.appendChild(node);
  }

  // Update claim button text
  const claimBtn = document.getElementById('daily-checkin-claim-btn');
  if (claimBtn) {
    if (hasCheckedInToday()) {
      claimBtn.textContent = 'Check-In Harvested Today';
      claimBtn.disabled = true;
      claimBtn.className = 'btn btn-outline btn-sm';
    } else {
      const nextDay = appState.checkInStreak + 1;
      claimBtn.textContent = `Claim Day ${nextDay} (+${nextDay * 10} XP)`;
      claimBtn.disabled = false;
      claimBtn.className = 'btn btn-primary btn-sm';
    }
  }
}

function hasCheckedInToday() {
  if (!appState.lastCheckInDate) return false;
  return appState.lastCheckInDate === getTodayString();
}

function renderQuestsList() {
  const container = document.getElementById('quests-list-container');
  if (!container) return;

  container.innerHTML = '';
  
  const quests = INITIAL_QUESTS.map(q => {
    let status = 'locked';
    
    if (appState.completedQuests.includes(q.id)) {
      status = 'completed';
    } else {
      if (q.id === 'quest-checkin') {
        status = appState.checkInStreak > 0 ? 'claimable' : 'locked';
      } else if (q.id === 'quest-register') {
        status = appState.registrations.length > 0 ? 'claimable' : 'locked';
      } else if (q.id === 'quest-latency') {
        status = appState.viewedLatencyIndices.length >= 3 ? 'claimable' : 'locked';
      } else if (q.id === 'quest-loot') {
        status = appState.inventory.length > 0 ? 'claimable' : 'locked';
      }
    }
    return { ...q, status };
  });

  quests.forEach(quest => {
    const node = document.createElement('div');
    node.className = 'quest-card-item';
    
    let btnText = 'Locked';
    let disabledAttr = 'disabled';
    
    if (quest.status === 'claimable') {
      btnText = 'Claim XP';
      disabledAttr = '';
    } else if (quest.status === 'completed') {
      btnText = 'Claimed';
      disabledAttr = 'disabled';
    }
    
    node.innerHTML = `
      <div class="quest-info">
        <span class="quest-name">${quest.name}</span>
        <span class="quest-reward-val"><i class="fa-solid fa-coins"></i> +${quest.points} XP</span>
        <p style="font-size: 0.75rem; color: var(--color-text-muted);">${quest.desc}</p>
      </div>
      <button class="quest-claim-btn" data-id="${quest.id}" data-points="${quest.points}" ${disabledAttr}>${btnText}</button>
    `;
    container.appendChild(node);
  });

  // Attach button triggers
  container.querySelectorAll('.quest-claim-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const questId = btn.getAttribute('data-id');
      const points = parseInt(btn.getAttribute('data-points'), 10);
      SynthAudio.playCheckin();
      handleClaimQuest(questId, points);
    });
  });
}

function renderStore() {
  const container = document.getElementById('store-grid-container');
  if (!container) return;

  container.innerHTML = '';

  STORE_ITEMS.forEach(item => {
    const card = document.createElement('div');
    card.className = 'store-card';
    
    card.innerHTML = `
      <div class="store-card-media">
        <i class="${item.icon} store-card-icon"></i>
      </div>
      <h4 class="store-card-name">${item.name}</h4>
      <div class="store-card-price">
        <i class="fa-solid fa-coins"></i> ${item.cost} XP
      </div>
      <button class="btn btn-secondary btn-sm buy-item-btn" data-id="${item.id}" data-cost="${item.cost}" style="width: 100%;">
        Redeem Skin
      </button>
    `;
    container.appendChild(card);
  });

  // Attach button triggers
  container.querySelectorAll('.buy-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.getAttribute('data-id');
      const cost = parseInt(btn.getAttribute('data-cost'), 10);
      SynthAudio.playClick();
      handleBuyItem(itemId, cost);
    });
  });
}

function renderInventoryDrawer() {
  const grid = document.getElementById('drawer-inventory-grid');
  if (!grid) return;

  grid.innerHTML = '';
  const slotCount = Math.max(8, appState.inventory.length);
  
  for (let i = 0; i < slotCount; i++) {
    const slot = document.createElement('div');
    slot.className = 'inventory-slot';
    
    const itemOwned = appState.inventory[i];
    if (itemOwned) {
      const details = STORE_ITEMS.find(item => item.id === itemOwned.itemId);
      if (details) {
        slot.innerHTML = `
          <span>${details.emoji}</span>
          <span class="inventory-count">x${itemOwned.quantity}</span>
        `;
        slot.setAttribute('title', `${details.name}`);
      } else {
        slot.innerHTML = '⚙️';
      }
    }
    grid.appendChild(slot);
  }
}

function renderRegisteredTournamentsDrawer() {
  const container = document.getElementById('drawer-tournaments-list');
  if (!container) return;

  container.innerHTML = '';
  
  if (appState.registrations.length === 0) {
    container.innerHTML = `<p style="font-size: 0.8rem; color: var(--color-text-muted); text-align: center; padding: 10px 0;">No active brackets joined.</p>`;
    return;
  }

  appState.registrations.forEach(tourneyId => {
    const tourney = TOURNAMENTS_DATA.find(t => t.id === tourneyId);
    if (!tourney) return;
    
    const node = document.createElement('div');
    node.className = 'reg-tournament-item';
    node.innerHTML = `
      <div class="reg-tournament-info">
        <span class="reg-tournament-name">${tourney.title}</span>
        <span class="reg-tournament-date">${tourney.date}</span>
      </div>
      <span class="reg-tournament-tag">${tourney.tag}</span>
    `;
    container.appendChild(node);
  });
}

// ==========================================
// 5. EVENT ACTIONS & CORE HANDLERS
// ==========================================

// Authenticate Connection
async function handleAuthSubmit(e) {
  e.preventDefault();
  const username = document.getElementById('auth-username').value.trim();
  const role = document.getElementById('auth-role').value;
  
  if (!username) return;

  try {
    const res = await requestAPI('/auth/connect', 'POST', { username, role });
    if (res.success && res.player) {
      appState = res.player;
      appState.isLoggedIn = true;
      localStorage.setItem('gamex_current_user', appState.username);
      
      closeModal('auth-modal');
      updateUI();
      SynthAudio.playLevelUp();
      showToast(`Interface established. Welcome back, ${appState.username}!`, 'success');
    }
  } catch (err) {
    SynthAudio.playError();
    showToast(`Authentication override failure: ${err.message}`, 'warning');
  }
}

// Logout session
function handleLogout() {
  localStorage.removeItem('gamex_current_user');
  appState = { ...DEFAULT_USER_MOCK() };
  toggleProfileDrawer(false);
  updateUI();
  SynthAudio.playError();
  showToast('Player interface disconnected.', 'info');
}

// Claim Daily check-in streak rewards
async function handleDailyCheckin() {
  if (!appState.isLoggedIn) {
    openModal('auth-modal');
    showToast('Connect player alias to log check-ins.', 'warning');
    return;
  }

  try {
    const res = await requestAPI('/user/checkin', 'POST', { username: appState.username });
    if (res.success && res.player) {
      appState = res.player;
      updateUI();
      SynthAudio.playCheckin();
      showToast(`Daily streak claimed! Added +${res.xpPayout} XP nodes.`, 'success');
    }
  } catch (err) {
    SynthAudio.playError();
    showToast(`Checkin claim blocked: ${err.message}`, 'warning');
  }
}

// Claim Quest Reward
async function handleClaimQuest(questId, points) {
  if (!appState.isLoggedIn) {
    openModal('auth-modal');
    showToast('Connect player profile to claim quests.', 'warning');
    return;
  }

  try {
    const res = await requestAPI('/quests/claim', 'POST', { username: appState.username, questId, points });
    if (res.success && res.player) {
      appState = res.player;
      updateUI();
      showToast(`XP nodes harvested successfully!`, 'success');
    }
  } catch (err) {
    SynthAudio.playError();
    showToast(`Harvest block: ${err.message}`, 'warning');
  }
}

// Purchase skin store item
async function handleBuyItem(itemId, cost) {
  if (!appState.isLoggedIn) {
    openModal('auth-modal');
    showToast('Connect player profile to purchase gear.', 'warning');
    return;
  }

  try {
    const res = await requestAPI('/store/redeem', 'POST', { username: appState.username, itemId, cost });
    if (res.success && res.player) {
      appState = res.player;
      updateUI();
      SynthAudio.playCheckin();
      showToast(`Redemption verified! Cosmetic added to stats card.`, 'success');
    }
  } catch (err) {
    SynthAudio.playError();
    showToast(`Loot store transaction blocked: ${err.message}`, 'warning');
  }
}

// Trigger tournament signup modal
function handleTournamentJoinTrigger(tourneyId) {
  if (!appState.isLoggedIn) {
    openModal('auth-modal');
    showToast('Please establish session before joining tournaments.', 'warning');
    return;
  }

  const tourney = TOURNAMENTS_DATA.find(t => t.id === tourneyId);
  if (!tourney) return;

  document.getElementById('register-tournament-id').value = tourneyId;
  document.getElementById('tournament-modal-subtitle').textContent = `${tourney.title} | Reward: ${tourney.prize}`;
  openModal('tournament-modal');
}

// Submit Tournament Signup
async function handleTournamentFormSubmit(e) {
  e.preventDefault();
  const tournamentId = document.getElementById('register-tournament-id').value;

  try {
    const res = await requestAPI('/tournaments/register', 'POST', { username: appState.username, tournamentId });
    if (res.success && res.player) {
      appState = res.player;
      if (res.slotsRegistered !== undefined) {
        tournamentSlots[tournamentId] = res.slotsRegistered;
      }
      closeModal('tournament-modal');
      updateUI();
      renderTournaments();
      SynthAudio.playLevelUp();
      showToast('Roster files locked in. Ranks synced successfully.', 'success');
    }
  } catch (err) {
    SynthAudio.playError();
    showToast(`Registration override block: ${err.message}`, 'warning');
  }
}

// Launching Web Games
function handleLaunchGame(gameId, gameTitle) {
  if (gameId === 'cyber-ascendancy') {
    // Launch Canvas Space Shooter
    openModal('arcade-modal');
    initArcadeGame();
  } else {
    // Normal loading mock
    showToast(`Injecting client assemblies for "${gameTitle}"...`, 'info');
    setTimeout(() => {
      SynthAudio.playLevelUp();
      showToast(`Execution pipe established. Enjoy playing ${gameTitle}!`, 'success');
    }, 1200);
  }
}

// ==========================================
// 6. PLAYABLE ARCADE CANVAS SHOOTER GAME
// ==========================================
let arcadeGameActive = false;
let arcadeGameLoop = null;

function initArcadeGame() {
  const canvas = document.getElementById('arcade-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const startOverlay = document.getElementById('arcade-start-overlay');
  const gameoverOverlay = document.getElementById('arcade-gameover-overlay');
  const restartBtn = document.getElementById('arcade-restart-btn');
  const startBtn = document.getElementById('arcade-start-btn');

  // Reset overlays
  startOverlay.style.display = 'flex';
  gameoverOverlay.style.display = 'none';

  let score = 0;
  let xpEarned = 0;
  let highscore = parseInt(localStorage.getItem('arcade_highscore') || '0', 10);
  document.getElementById('arcade-highscore').textContent = highscore;

  // Game elements state
  let player = {
    x: canvas.width / 2,
    y: canvas.height - 35,
    width: 26,
    height: 20,
    speed: 6,
    lasers: []
  };

  let enemies = [];
  let enemySpawnTimer = 0;
  let enemySpawnInterval = 45; // ticks

  // Input states
  let keys = {
    ArrowLeft: false,
    ArrowRight: false,
    a: false,
    d: false,
    Space: false
  };

  // Laser rate limit
  let fireCooldown = 0;

  function handleKeyDown(e) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.ArrowLeft = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.ArrowRight = true;
    if (e.code === 'Space') {
      keys.Space = true;
      e.preventDefault(); // prevent scroll
    }
  }

  function handleKeyUp(e) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.ArrowLeft = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.ArrowRight = false;
    if (e.code === 'Space') keys.Space = false;
  }

  // Clear events to avoid duplicate listeners
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  function start() {
    startOverlay.style.display = 'none';
    gameoverOverlay.style.display = 'none';
    score = 0;
    xpEarned = 0;
    document.getElementById('arcade-score').textContent = score;
    document.getElementById('arcade-xp-earned').textContent = xpEarned;
    
    enemies = [];
    player.x = canvas.width / 2;
    player.lasers = [];
    
    arcadeGameActive = true;
    SynthAudio.playCheckin();
    loop();
  }

  function stop(message) {
    arcadeGameActive = false;
    cancelAnimationFrame(arcadeGameLoop);
    
    // Save highscore
    if (score > highscore) {
      highscore = score;
      localStorage.setItem('arcade_highscore', score);
      document.getElementById('arcade-highscore').textContent = score;
    }

    // Award XP points directly to user account
    if (xpEarned > 0 && appState.isLoggedIn) {
      requestAPI('/arcade/score', 'POST', { username: appState.username, score: xpEarned })
        .then(res => {
          if (res.success) {
            appState = res.player;
            updateUI();
            showToast(`Uploaded scores! Sync complete: +${xpEarned} XP awarded.`, 'success');
          }
        })
        .catch(err => {
          console.warn("Arcade XP upload error:", err.message);
        });
    }

    SynthAudio.playError();
    document.getElementById('arcade-gameover-msg').textContent = `${message} You cleared ${score} cyber-drones and earned +${xpEarned} XP nodes.`;
    gameoverOverlay.style.display = 'flex';
  }

  startBtn.onclick = start;
  restartBtn.onclick = start;

  function loop() {
    if (!arcadeGameActive) return;

    update();
    draw();

    arcadeGameLoop = requestAnimationFrame(loop);
  }

  function update() {
    // 1. Move Player
    if (keys.ArrowLeft) {
      player.x -= player.speed;
    }
    if (keys.ArrowRight) {
      player.x += player.speed;
    }

    // Border constraints
    player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));

    // 2. Shoot lasers
    if (fireCooldown > 0) fireCooldown--;
    
    if (keys.Space && fireCooldown === 0) {
      player.lasers.push({
        x: player.x,
        y: player.y - player.height / 2,
        speed: 8,
        radius: 3
      });
      SynthAudio.playLaser();
      fireCooldown = 12; // cooldow ticks
    }

    // 3. Move lasers
    player.lasers.forEach((laser, idx) => {
      laser.y -= laser.speed;
      // remove offscreen lasers
      if (laser.y < 0) {
        player.lasers.splice(idx, 1);
      }
    });

    // 4. Spawn enemies
    enemySpawnTimer++;
    if (enemySpawnTimer >= enemySpawnInterval) {
      enemySpawnTimer = 0;
      // Spawn at random top coordinates
      enemies.push({
        x: Math.random() * (canvas.width - 30) + 15,
        y: -10,
        width: 18,
        height: 18,
        speed: Math.random() * 2 + 1.5
      });
      // Gradually speed up spawning
      if (enemySpawnInterval > 20 && Math.random() < 0.1) enemySpawnInterval--;
    }

    // 5. Move enemies
    enemies.forEach((enemy, idx) => {
      enemy.y += enemy.speed;
      
      // Check collision with player
      const distToPlayer = Math.hypot(enemy.x - player.x, enemy.y - player.y);
      if (distToPlayer < (enemy.width + player.width) / 2) {
        SynthAudio.playExplosion();
        stop("Your starship was disintegrated.");
      }

      // Check if bypassed player border
      if (enemy.y > canvas.height) {
        enemies.splice(idx, 1);
        SynthAudio.playError();
        stop("Security wall bypassed. Core overloaded.");
      }
    });

    // 6. Laser Collision detection
    player.lasers.forEach((laser, lIdx) => {
      enemies.forEach((enemy, eIdx) => {
        const dist = Math.hypot(laser.x - enemy.x, laser.y - enemy.y);
        if (dist < laser.radius + enemy.width / 2) {
          // Destory both
          player.lasers.splice(lIdx, 1);
          enemies.splice(eIdx, 1);
          
          score++;
          xpEarned++;
          document.getElementById('arcade-score').textContent = score;
          document.getElementById('arcade-xp-earned').textContent = xpEarned;
          SynthAudio.playExplosion();
        }
      });
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Cyber-Grid Background lines
    ctx.strokeStyle = 'rgba(189, 0, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw Laser Projectiles (Neon Cyan)
    ctx.fillStyle = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f0ff';
    player.lasers.forEach(laser => {
      ctx.beginPath();
      ctx.arc(laser.x, laser.y, laser.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Enemy Drones (Neon Red Squares)
    ctx.fillStyle = '#ff3b30';
    ctx.strokeStyle = '#ff3b30';
    ctx.shadowColor = '#ff3b30';
    ctx.shadowBlur = 12;
    enemies.forEach(enemy => {
      ctx.fillRect(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height);
      ctx.strokeRect(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height);
    });

    // Draw Player Starship (Neon Cyan Triangle)
    ctx.fillStyle = '#00f0ff';
    ctx.strokeStyle = '#bd00ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#bd00ff';
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.moveTo(player.x, player.y - player.height / 2); // Nose
    ctx.lineTo(player.x - player.width / 2, player.y + player.height / 2); // Left tail
    ctx.lineTo(player.x + player.width / 2, player.y + player.height / 2); // Right tail
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Reset shadow properties
    ctx.shadowBlur = 0;
  }
}

// Stop game loop on modal exit
document.getElementById('arcade-modal-close').addEventListener('click', () => {
  arcadeGameActive = false;
  closeModal('arcade-modal');
});

// ==========================================
// 7. LATENCY MONITOR & COMPONENT HOOKS
// ==========================================

const LATENCY_MONITOR_MODES = [
  { title: "SMART_MATCHMAKER_V4.LOG", pingBase: 8, lossBase: 0.0, radarPulse: true },
  { title: "BGP_DYNAMIC_ROUTE.CFG", pingBase: 14, lossBase: 0.1, radarPulse: false },
  { title: "HOLO_MESH_REDUNDANCY.STATS", pingBase: 28, lossBase: 0.0, radarPulse: false }
];

let currentMonitorIndex = 0;
let latencyChartValues = Array(15).fill(8);

function initLatencyMonitor() {
  const items = document.querySelectorAll('#latency-features-list .feature-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(node => node.classList.remove('active'));
      item.classList.add('active');
      
      const idx = parseInt(item.getAttribute('data-index'), 10);
      currentMonitorIndex = idx;
      
      const mode = LATENCY_MONITOR_MODES[idx];
      document.getElementById('monitor-title-display').textContent = mode.title;
      
      // Update check viewed feature for quest logs
      if (appState.isLoggedIn && !appState.viewedLatencyIndices.includes(idx)) {
        appState.viewedLatencyIndices.push(idx);
        requestAPI('/user/latency', 'POST', { username: appState.username, index: idx })
          .then(res => {
            if (res.success) {
              appState = res.player;
              updateUI();
            }
          });
      }

      // Display Radar Pulse
      const radar = document.getElementById('latency-radar-container');
      radar.style.display = mode.radarPulse ? 'flex' : 'none';

      updateLatencyStats();
    });
  });

  setInterval(updateLatencyStats, 2000);
  renderLatencyChart();
}

function updateLatencyStats() {
  const mode = LATENCY_MONITOR_MODES[currentMonitorIndex];
  if (!mode) return;

  const pingVariance = (Math.random() * 4 - 2);
  const currentPing = Math.max(1, Math.round(mode.pingBase + pingVariance));
  const currentLoss = (mode.lossBase + Math.random() * 0.1).toFixed(1);

  const pingValNode = document.getElementById('monitor-ping-val');
  const lossValNode = document.getElementById('monitor-loss-val');
  const displayValNode = document.getElementById('latency-val-display');

  if (pingValNode) {
    pingValNode.textContent = `${currentPing}ms`;
    pingValNode.className = currentPing <= 10 ? "monitor-box-value glow-green" : "monitor-box-value";
  }
  if (lossValNode) lossValNode.textContent = `${currentLoss}%`;
  if (displayValNode) displayValNode.textContent = `${currentPing}ms`;

  latencyChartValues.shift();
  latencyChartValues.push(currentPing);
  renderLatencyChart();
}

function renderLatencyChart() {
  const chart = document.getElementById('monitor-chart-bars');
  if (!chart) return;

  chart.innerHTML = '';
  const maxVal = Math.max(20, ...latencyChartValues);

  latencyChartValues.forEach(val => {
    const bar = document.createElement('div');
    bar.className = 'monitor-bar';
    const height = (val / maxVal) * 80;
    bar.style.height = `${height}px`;
    chart.appendChild(bar);
  });
}

// ==========================================
// 8. ELEMENT MOUNT & GLOBAL ROUTING
// ==========================================

// Slider mechanism
let currentSlideIndex = 0;

function initSlider() {
  const track = document.getElementById('slider-track');
  const slides = document.querySelectorAll('#solo-slider .slider-slide');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');

  if (!track || slides.length === 0) return;

  function updateSliderPosition() {
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
  }

  prevBtn.addEventListener('click', () => {
    currentSlideIndex = (currentSlideIndex === 0) ? slides.length - 1 : currentSlideIndex - 1;
    updateSliderPosition();
  });

  nextBtn.addEventListener('click', () => {
    currentSlideIndex = (currentSlideIndex === slides.length - 1) ? 0 : currentSlideIndex + 1;
    updateSliderPosition();
  });
}

// Modal Toggle Hooks
function openModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (overlay) overlay.classList.add('active');
}

function closeModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (overlay) overlay.classList.remove('active');
}

function toggleProfileDrawer(open = true) {
  const drawer = document.getElementById('profile-drawer');
  if (!drawer) return;

  if (open) {
    document.getElementById('drawer-avatar-img').src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${appState.username}`;
    drawer.classList.add('active');
  } else {
    drawer.classList.remove('active');
  }
}

function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const isExpanded = navLinks.classList.contains('active');
    menuToggle.innerHTML = isExpanded ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
  });
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let iconClass = 'fa-circle-info';
  if (type === 'success') iconClass = 'fa-circle-check';
  if (type === 'warning') iconClass = 'fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${iconClass} toast-icon"></i>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('active'), 10);
  
  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}

function initScrollObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function initScrollSpy() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section, header');

  window.addEventListener('scroll', () => {
    let scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
      if (section.id && scrollPos >= section.offsetTop && scrollPos < (section.offsetTop + section.offsetHeight)) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('data-sec') === section.id) {
            link.classList.add('active');
          }
        });
      }
    });

    const header = document.getElementById('header');
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// DOM Setup Mount
document.addEventListener('DOMContentLoaded', () => {
  loadAppState();

  renderGames();
  renderTournaments();
  renderStore();

  initSlider();
  initLatencyMonitor();
  initMobileMenu();
  initScrollObserver();
  initScrollSpy();

  // Search logic
  const searchInput = document.getElementById('game-search');
  const filterTabs = document.querySelectorAll('#game-filter-tabs .filter-tab');
  let currentCategory = 'all';
  let currentSearch = '';

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderGames(currentCategory, currentSearch);
    });
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.getAttribute('data-category');
      renderGames(currentCategory, currentSearch);
    });
  });

  // Sound Volume Trigger
  const volumeSlider = document.getElementById('sound-volume');
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      document.getElementById('sound-volume-display').textContent = `${val}%`;
      SynthAudio.setVolume(val / 100);
    });
  }

  // Trigger login modals
  const authTrigger = document.getElementById('auth-trigger-btn');
  if (authTrigger) {
    authTrigger.addEventListener('click', () => {
      SynthAudio.playClick();
      openModal('auth-modal');
    });
  }

  const userPill = document.getElementById('user-profile-pill');
  if (userPill) {
    userPill.addEventListener('click', () => {
      SynthAudio.playClick();
      toggleProfileDrawer(true);
    });
  }

  // Bind close buttons
  document.getElementById('auth-modal-close').addEventListener('click', () => closeModal('auth-modal'));
  document.getElementById('tournament-modal-close').addEventListener('click', () => closeModal('tournament-modal'));
  document.getElementById('profile-drawer-close').addEventListener('click', () => toggleProfileDrawer(false));

  // Forms Submissions
  const authForm = document.getElementById('auth-form');
  if (authForm) authForm.addEventListener('submit', handleAuthSubmit);

  const tourneyForm = document.getElementById('tournament-registration-form');
  if (tourneyForm) tourneyForm.addEventListener('submit', handleTournamentFormSubmit);

  // Checkin claim
  const checkinBtn = document.getElementById('daily-checkin-claim-btn');
  if (checkinBtn) checkinBtn.addEventListener('click', handleDailyCheckin);

  // Logout Session
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  // Modal backdrop click closes
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });

  // Counter Fluctuations
  setInterval(() => {
    const depNode = document.getElementById('stat-deployments');
    const playNode = document.getElementById('stat-players');
    
    if (depNode) {
      let val = parseInt(depNode.textContent.replace(/,/g, ''), 10);
      val += Math.floor(Math.random() * 3) + 1;
      depNode.textContent = val.toLocaleString();
    }
    
    if (playNode) {
      let val = parseInt(playNode.textContent.replace(/,/g, ''), 10);
      val += Math.floor(Math.random() * 5) - 2;
      playNode.textContent = val.toLocaleString();
    }
  }, 4000);
});
