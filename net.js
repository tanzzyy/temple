// Live multiplayer for Cai Shen Temple, using Firebase Anonymous Auth + Realtime Database.
// Each player writes only their own record at rooms/{ROOM}/players/{uid};
// Firebase deletes it automatically when they disconnect.
import { firebaseConfig, ROOM } from './firebase-config.js?v=2';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getDatabase, ref, set, onValue, onDisconnect, onChildAdded, onChildChanged, onChildRemoved, serverTimestamp }
  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

const Game = window.Game;
const STALE_MS = 2 * 60 * 1000; // ignore records not updated for 2 minutes (server time)

// Small status badge so you can see what the connection is doing.
const badge = document.createElement('div');
badge.style.cssText = 'position:absolute;left:12px;top:12px;z-index:5;font:12px sans-serif;padding:5px 10px;border-radius:10px;background:rgba(0,0,0,.55);color:#fff;max-width:70%;pointer-events:auto';
document.getElementById('stage').appendChild(badge);
function status(text, color = '#fff', detail = '') {
  badge.textContent = text;
  badge.style.color = color;
  badge.title = detail;
  if (detail) console.warn('[temple]', text, detail);
}

async function start() {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith('PASTE')) {
    status('⚪ Solo mode: firebase-config.js not filled in', '#ffd46b');
    return;
  }
  status('🟡 Connecting…', '#ffd46b');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getDatabase(app);

  let uid;
  try {
    ({ user: { uid } } = await signInAnonymously(auth));
  } catch (e) {
    status('🔴 Sign-in failed: ' + (e.code || e.message) + ' (enable Anonymous sign-in / check authorized domains)', '#ff8a80', String(e));
    return;
  }

  const playersRef = ref(db, `rooms/${ROOM}/players`);
  const meRef = ref(db, `rooms/${ROOM}/players/${uid}`);
  const seen = new Set();
  const count = () => Game.setOnline(seen.size + 1);

  // Server clock offset, so a phone with a wrong clock doesn't hide other players.
  let offset = 0;
  onValue(ref(db, '.info/serverTimeOffset'), (s) => { offset = s.val() || 0; });
  const serverNow = () => Date.now() + offset;

  // Connection state; warn if the database URL is wrong (it never connects).
  let everConnected = false;
  const timeout = setTimeout(() => {
    if (!everConnected) status('🔴 Cannot reach database. Check databaseURL in firebase-config.js matches the Realtime Database page', '#ff8a80', firebaseConfig.databaseURL);
  }, 10000);
  onValue(ref(db, '.info/connected'), (snap) => {
    if (snap.val() === true) {
      everConnected = true; clearTimeout(timeout);
      status('🟢 Online · room "' + ROOM + '"', '#9cff9c');
      onDisconnect(meRef).remove().then(() => Game.resend());
    } else if (everConnected) {
      status('🟡 Reconnecting…', '#ffd46b');
    }
  });

  const handle = (snap) => {
    if (snap.key === uid) return;
    const v = snap.val();
    if (!v || (typeof v.t === 'number' && serverNow() - v.t > STALE_MS)) return;
    seen.add(snap.key);
    Game.upsertOther(snap.key, v);
    count();
  };
  const readError = (e) => status('🔴 Cannot read players: ' + (e.code || e.message) + ' (publish database.rules.json)', '#ff8a80', String(e));
  onChildAdded(playersRef, handle, readError);
  onChildChanged(playersRef, handle, readError);
  onChildRemoved(playersRef, (snap) => {
    seen.delete(snap.key);
    Game.playerLeft(snap.key);
    count();
  }, readError);

  let writeErrShown = false;
  Game.attach({
    send(data) {
      set(meRef, { ...data, t: serverTimestamp() }).catch((e) => {
        if (!writeErrShown) { writeErrShown = true; status('🔴 Cannot save your position: ' + (e.code || e.message) + ' (check database rules)', '#ff8a80', String(e)); }
      });
    }
  });
}

start().catch((e) => {
  status('🔴 Error: ' + (e.code || e.message), '#ff8a80', String(e));
});
