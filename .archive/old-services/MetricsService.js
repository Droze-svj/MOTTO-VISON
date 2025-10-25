import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'motto_metrics_events';

function redact(str) {
  if (!str) return str;
  return String(str).replace(/sk-[a-z0-9-_]+/gi, 'sk-REDACTED');
}

async function readAll() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

async function writeAll(items) {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}

class MetricsService {
  async log(eventName, payload = {}) {
    const events = await readAll();
    events.push({ id: Date.now(), t: new Date().toISOString(), e: eventName, p: this._redactPayload(payload) });
    // keep last 1000
    const limited = events.slice(-1000);
    await writeAll(limited);
  }

  _redactPayload(p) {
    const safe = {};
    for (const k of Object.keys(p || {})) {
      const v = p[k];
      if (typeof v === 'string') safe[k] = redact(v);
      else safe[k] = v;
    }
    return safe;
  }

  async getEvents(limit = 200) {
    const events = await readAll();
    return events.slice(-limit);
  }

  async clearEvents() {
    await AsyncStorage.removeItem(KEY);
  }
}

export default new MetricsService();


