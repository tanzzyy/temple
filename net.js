// Live multiplayer for Cai Shen Temple, using Firebase Anonymous Auth + Realtime Database.
// Each player writes only their own record at rooms/{ROOM}/players/{uid};
// Firebase deletes it automatically when they disconnect.
import { firebaseConfig, ROOM } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getDatabase, ref, set, onValue, onDisconnect, onChildAdded, onChildChanged, onChildRemoved, serverTimestamp }
  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

const Game = window.Game;
const STALE_MS = 2 * 60 * 1000; // ignore records not updated for 2 minutes

async function start() {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith('PASTE')) {
    Game.toast('Solo mode — add your Firebase config to play online', 4000);
    return;
  }
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getDatabase(app);
  const { user } = await signInAnonymously(auth);
  const uid = user.uid;

  const playersRef = ref(db, `rooms/${ROOM}/players`);
  const meRef = ref(db, `rooms/${ROOM}/players/${uid}`);
  const seen = new Set();
  const count = () => Game.setOnline(seen.size + 1);

  // Re-arm auto-removal and re-send our state every time the connection (re)opens.
  onValue(ref(db, '.info/connected'), (snap) => {
    if (snap.val() === true) {
      onDisconnect(meRef).remove().then(() => Game.resend());
    }
  });

  const handle = (snap) => {
    if (snap.key === uid) return;
    const v = snap.val();
    if (!v || (typeof v.t === 'number' && Date.now() - v.t > STALE_MS)) return;
    seen.add(snap.key);
    Game.upsertOther(snap.key, v);
    count();
  };
  onChildAdded(playersRef, handle);
  onChildChanged(playersRef, handle);
  onChildRemoved(playersRef, (snap) => {
    seen.delete(snap.key);
    Game.playerLeft(snap.key);
    count();
  });

  Game.attach({
    send(data) {
      set(meRef, { ...data, t: serverTimestamp() }).catch((e) => console.warn('presence write failed', e));
    }
  });
}

start().catch((e) => {
  console.error(e);
  Game.toast('Could not connect to the temple server — playing solo', 4000);
});
