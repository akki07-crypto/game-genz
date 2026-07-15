// GAME X HUB - Express & MongoDB Backend Server

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
  completedQuests: [String]
});

const UserModel = mongoose.model('User', UserSchema);

// In-Memory Database Map for Fallback
const memoryDB = new Map();

// Helper to find or create user profile
async function getPlayerProfile(username, defaultRole = 'Tactician') {
  if (dbFallbackMode) {
    const key = username.toLowerCase();
    if (!memoryDB.has(key)) {
      memoryDB.set(key, {
        username,
        role: defaultRole,
        points: 150,
        level: 1,
        lastCheckInDate: null,
        checkInStreak: 0,
        inventory: [],
        registrations: [],
        viewedLatencyIndices: [],
        completedQuests: []
      });
      console.log(`[InMemoryDB] Created profile for: ${username}`);
    }
    return memoryDB.get(key);
  } else {
    let user = await UserModel.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (!user) {
      user = new UserModel({
        username,
        role: defaultRole,
        points: 150,
        level: 1,
        inventory: [],
        registrations: [],
        viewedLatencyIndices: [],
        completedQuests: []
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
// IN-MEMORY TOURNAMENT SLOTS STATE
// ==========================================
// Maintain tournament slot registration increments on the server
const TOURNAMENT_SLOTS = {
  'val-cyber-cup': 12,
  'league-masters': 24,
  'apex-void-run': 12
};

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. Authenticate / Connect Player Profile
app.post('/api/auth/connect', async (req, res) => {
  try {
    const { username, role } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Player username coordinates missing.' });
    }

    const player = await getPlayerProfile(username, role);
    
    // Optionally update player specialty role if supplied
    if (role && player.role !== role) {
      player.role = role;
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
    
    // Auto update level
    player.level = Math.floor(player.points / 100) + 1;

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
    player.level = Math.floor(player.points / 100) + 1;

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
    player.level = Math.floor(player.points / 100) + 1;

    const existingItem = player.inventory.find(i => i.itemId === itemId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      player.inventory.push({ itemId, quantity: 1 });
    }

    // Check if the User completed the Loot Collector quest
    if (!player.completedQuests.includes('quest-loot')) {
      // Auto-unlock/flag the quest trigger state (completed by client claim)
      console.log(`[Store] Player ${username} earned Quest Loot trigger`);
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
    player.level = Math.floor(player.points / 100) + 1;

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
// START EXPRESS LISTENER
// ==========================================
app.listen(PORT, () => {
  console.log(`[SERVER] Cyberpunk web portal running on: http://localhost:${PORT}`);
});
