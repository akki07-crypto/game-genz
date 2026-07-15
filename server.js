// GAME X HUB - Express & MongoDB Backend Server (With RBAC Admin Dashboard)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static frontend files from workspace root
app.use(express.static(path.join(__dirname)));

// ==========================================
// DATABASE SETUP & RESILIENCY
// ==========================================
let dbFallbackMode = false;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gamexhub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('[DB] Connected to MongoDB database successfully.'))
.catch(err => {
  console.warn('[DB WARNING] MongoDB connection failed. Launching in-memory DB fallback mode.');
  console.warn(`Reason: ${err.message}`);
  dbFallbackMode = true;
});

// Mongoose User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  role: { type: String, default: 'Tactician' },
  points: { type: Number, default: 150 },
  level: { type: Number, default: 1 },
  lastCheckInDate: { type: String, default: null },
  checkInStreak: { type: Number, default: 0 },
  inventory: [{
    itemId: String,
    quantity: Number
  }],
  registrations: [String],
  viewedLatencyIndices: [Number],
  completedQuests: [String],
  isAdmin: { type: Boolean, default: false }
});

const UserModel = mongoose.model('User', UserSchema);

// In-Memory Database Map for Fallback
const memoryDB = new Map();

// Helper to find or create user profile
async function getPlayerProfile(username, defaultRole = 'Tactician') {
  const isUserAdmin = username.toLowerCase() === 'admin';
  const finalRole = isUserAdmin ? 'Server Administrator' : defaultRole;
  
  if (dbFallbackMode) {
    const key = username.toLowerCase();
    if (!memoryDB.has(key)) {
      memoryDB.set(key, {
        username,
        role: finalRole,
        points: isUserAdmin ? 9999 : 150,
        level: isUserAdmin ? 99 : 1,
        lastCheckInDate: null,
        checkInStreak: 0,
        inventory: [],
        registrations: [],
        viewedLatencyIndices: [],
        completedQuests: [],
        isAdmin: isUserAdmin
      });
      console.log(`[InMemoryDB] Created profile for: ${username}`);
    }
    return memoryDB.get(key);
  } else {
    let user = await UserModel.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (!user) {
      user = new UserModel({
        username,
        role: finalRole,
        points: isUserAdmin ? 9999 : 150,
        level: isUserAdmin ? 99 : 1,
        inventory: [],
        registrations: [],
        viewedLatencyIndices: [],
        completedQuests: [],
        isAdmin: isUserAdmin
      });
      await user.save();
      console.log(`[MongoDB] Created profile for: ${username}`);
    }
    return user;
  }
}

// Helper to save user profile
async function savePlayerProfile(userDoc) {
  if (dbFallbackMode) {
    const key = userDoc.username.toLowerCase();
    memoryDB.set(key, userDoc);
    return userDoc;
  } else {
    return await userDoc.save();
  }
}

// Helper to calculate date string (YYYY-MM-DD)
function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ==========================================
// DYNAMIC SERVER STATE (TOURNAMENTS & SHOP)
// ==========================================

let TOURNAMENTS_LIST = [
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
    tag: 'Trios BR',
    status: 'upcoming'
  }
];

let STORE_ITEMS_LIST = [
  { id: 'skin-neon-blade', name: 'Neon Blade Skin', cost: 200, emoji: '⚔️', icon: 'fa-solid fa-wand-magic-sparkles' },
  { id: 'hud-overlay', name: 'Cyberpunk HUD', cost: 350, emoji: '📐', icon: 'fa-solid fa-compass-drafting' },
  { id: 'avatar-border', name: 'Glitch Border', cost: 150, emoji: '🟢', icon: 'fa-solid fa-circle-nodes' },
  { id: 'weapon-wrap', name: 'Matrix Wrap', cost: 450, emoji: '🔫', icon: 'fa-solid fa-gun' }
];

// Maintain slots registration counts
const TOURNAMENT_SLOTS = {
  'val-cyber-cup': 12,
  'league-masters': 24,
  'apex-void-run': 12
};

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Get dynamic tournaments list
app.get('/api/tournaments', (req, res) => {
  res.json({ success: true, tournaments: TOURNAMENTS_LIST });
});

// Get dynamic store items list
app.get('/api/store', (req, res) => {
  res.json({ success: true, store: STORE_ITEMS_LIST });
});

// 1. Authenticate / Connect Player Profile
app.post('/api/auth/connect', async (req, res) => {
  try {
    const { username, role, isAdmin } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Player username coordinates missing.' });
    }

    const isUsernameAdmin = username.toLowerCase() === 'admin';

    // Prevent connecting as 'admin' without checked admin checkbox (passcode path)
    if (isUsernameAdmin && !isAdmin) {
      return res.status(400).json({ error: "Alias 'admin' is restricted. Toggle the administrator access checkbox and provide the clearance passcode." });
    }

    const player = await getPlayerProfile(username, role);
    
    // Set admin status
    if (isUsernameAdmin) {
      player.isAdmin = true;
      player.role = 'Server Administrator';
      await savePlayerProfile(player);
    } else {
      player.isAdmin = false;
      if (role && player.role !== role) {
        player.role = role;
      }
      await savePlayerProfile(player);
    }

    res.json({ success: true, player, dbMode: dbFallbackMode ? 'InMemory' : 'MongoDB' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Fetch User Profile Details
app.get('/api/user/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const player = await getPlayerProfile(username);
    res.json({ success: true, player });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Claim Daily Check-in Streak Yields
app.post('/api/user/checkin', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'User validation failed.' });

    const player = await getPlayerProfile(username);
    const today = getTodayString();

    if (player.lastCheckInDate === today) {
      return res.status(400).json({ error: 'Check-in matrix already claimed for today.' });
    }

    const nextStreak = player.checkInStreak + 1;
    const xpPayout = nextStreak * 10;

    player.points += xpPayout;
    player.lastCheckInDate = today;
    player.checkInStreak = nextStreak > 7 ? 1 : nextStreak; // loop streak after 7 days
    
    // Auto update level (exclude admin overrides)
    if (player.username.toLowerCase() !== 'admin') {
      player.level = Math.floor(player.points / 100) + 1;
    }

    await savePlayerProfile(player);
    res.json({ success: true, player, xpPayout, streak: player.checkInStreak });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Claim Quest Reward XP points
app.post('/api/quests/claim', async (req, res) => {
  try {
    const { username, questId, points } = req.body;
    if (!username || !questId) return res.status(400).json({ error: 'Validation nodes missing.' });

    const player = await getPlayerProfile(username);
    
    if (player.completedQuests.includes(questId)) {
      return res.status(400).json({ error: 'Quest rewards already harvested.' });
    }

    player.points += points;
    player.completedQuests.push(questId);
    if (player.username.toLowerCase() !== 'admin') {
      player.level = Math.floor(player.points / 100) + 1;
    }

    await savePlayerProfile(player);
    res.json({ success: true, player });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Purchase Cosmetic Loot Skin (XP deduction)
app.post('/api/store/redeem', async (req, res) => {
  try {
    const { username, itemId, cost } = req.body;
    if (!username || !itemId) return res.status(400).json({ error: 'Redeem payload invalid.' });

    const player = await getPlayerProfile(username);

    if (player.points < cost) {
      return res.status(400).json({ error: 'Insufficient XP nodes to complete transaction.' });
    }

    // Deduct cost and add to inventory list
    player.points -= cost;
    if (player.username.toLowerCase() !== 'admin') {
      player.level = Math.floor(player.points / 100) + 1;
    }

    const existingItem = player.inventory.find(i => i.itemId === itemId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      player.inventory.push({ itemId, quantity: 1 });
    }

    await savePlayerProfile(player);
    res.json({ success: true, player });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Join Tournament Bracket
app.post('/api/tournaments/register', async (req, res) => {
  try {
    const { username, tournamentId } = req.body;
    if (!username || !tournamentId) return res.status(400).json({ error: 'Roster validation failure.' });

    const player = await getPlayerProfile(username);

    if (player.registrations.includes(tournamentId)) {
      return res.status(400).json({ error: 'Player already registered in this bracket.' });
    }

    // Add registration
    player.registrations.push(tournamentId);
    await savePlayerProfile(player);

    // Increase registration count on server side
    if (TOURNAMENT_SLOTS[tournamentId] !== undefined) {
      TOURNAMENT_SLOTS[tournamentId] += 1;
    } else {
      TOURNAMENT_SLOTS[tournamentId] = 1;
    }

    res.json({ success: true, player, slotsRegistered: TOURNAMENT_SLOTS[tournamentId] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Get Real-Time Slots Remaining for Tournaments
app.get('/api/tournaments/slots', (req, res) => {
  res.json({ success: true, slots: TOURNAMENT_SLOTS });
});

// 8. Log direct Arcade Game score XP payouts
app.post('/api/arcade/score', async (req, res) => {
  try {
    const { username, score } = req.body;
    if (!username || score === undefined) return res.status(400).json({ error: 'Payload missing.' });

    const player = await getPlayerProfile(username);
    
    // Add score points directly as XP points
    player.points += score;
    if (player.username.toLowerCase() !== 'admin') {
      player.level = Math.floor(player.points / 100) + 1;
    }

    await savePlayerProfile(player);
    res.json({ success: true, player, pointsAwarded: score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Update viewed latency features index (quest helper)
app.post('/api/user/latency', async (req, res) => {
  try {
    const { username, index } = req.body;
    const player = await getPlayerProfile(username);
    
    if (!player.viewedLatencyIndices.includes(index)) {
      player.viewedLatencyIndices.push(index);
      await savePlayerProfile(player);
    }
    
    res.json({ success: true, player });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SERVER-SIDE ADMINISTRATIVE API ENDPOINTS
// ==========================================

// Helper to check if requester username is Admin
async function verifyAdminAuth(username) {
  if (!username) return false;
  const user = await getPlayerProfile(username);
  return user && user.isAdmin;
}

// 10. Fetch Admin Dashboard stats
app.post('/api/admin/stats', async (req, res) => {
  try {
    const { username } = req.body;
    if (!(await verifyAdminAuth(username))) {
      return res.status(403).json({ error: 'Access denied. Administrator clearance required.' });
    }

    let userCount = 0;
    let auditList = [];

    if (dbFallbackMode) {
      userCount = memoryDB.size;
      for (const [key, value] of memoryDB.entries()) {
        if (value.registrations.length > 0) {
          auditList.push({
            username: value.username,
            tourneys: value.registrations
          });
        }
      }
    } else {
      userCount = await UserModel.countDocuments();
      const activeUsers = await UserModel.find({ 'registrations.0': { $exists: true } });
      auditList = activeUsers.map(u => ({ username: u.username, tourneys: u.registrations }));
    }

    res.json({
      success: true,
      stats: {
        totalPlayers: userCount,
        tournamentsCount: TOURNAMENTS_LIST.length,
        storeItemsCount: STORE_ITEMS_LIST.length,
        databaseMode: dbFallbackMode ? 'Resilient In-Memory DB' : 'MongoDB Connection',
        audit: auditList
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Create new tournament (Admin only)
app.post('/api/admin/tournaments', async (req, res) => {
  try {
    const { username, tournament } = req.body;
    if (!(await verifyAdminAuth(username))) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (!tournament || !tournament.title) {
      return res.status(400).json({ error: 'Tournament payload invalid.' });
    }

    // Generate custom unique ID
    const newId = tournament.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newTourney = {
      id: newId,
      title: tournament.title,
      prize: tournament.prize || '5,000 XP',
      slotsMax: parseInt(tournament.slotsMax, 10) || 16,
      date: tournament.date || 'TBD 2026',
      time: tournament.time || '18:00 UTC',
      tag: tournament.tag || 'Special PvP',
      status: 'upcoming'
    };

    TOURNAMENTS_LIST.push(newTourney);
    TOURNAMENT_SLOTS[newId] = 0; // Initialize slots registered at 0

    console.log(`[Admin] Added new tournament: ${newTourney.title}`);
    res.json({ success: true, tournaments: TOURNAMENTS_LIST });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Delete tournament (Admin only)
app.post('/api/admin/tournaments/delete', async (req, res) => {
  try {
    const { username, tournamentId } = req.body;
    if (!(await verifyAdminAuth(username))) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    TOURNAMENTS_LIST = TOURNAMENTS_LIST.filter(t => t.id !== tournamentId);
    delete TOURNAMENT_SLOTS[tournamentId];

    console.log(`[Admin] Deleted tournament ID: ${tournamentId}`);
    res.json({ success: true, tournaments: TOURNAMENTS_LIST });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Create new Store Redemptions Item (Admin only)
app.post('/api/admin/store', async (req, res) => {
  try {
    const { username, storeItem } = req.body;
    if (!(await verifyAdminAuth(username))) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (!storeItem || !storeItem.name || !storeItem.cost) {
      return res.status(400).json({ error: 'Store item details invalid.' });
    }

    const newItem = {
      id: 'skin-' + storeItem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: storeItem.name,
      cost: parseInt(storeItem.cost, 10),
      emoji: storeItem.emoji || '🎁',
      icon: storeItem.icon || 'fa-solid fa-gift'
    };

    STORE_ITEMS_LIST.push(newItem);
    console.log(`[Admin] Added new cosmetic item: ${newItem.name}`);
    res.json({ success: true, store: STORE_ITEMS_LIST });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// START EXPRESS LISTENER
// ==========================================
app.listen(PORT, () => {
  console.log(`[SERVER] Cyberpunk web portal running on: http://localhost:${PORT}`);
});
