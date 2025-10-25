import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'motto_kb_items';

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function similarity(a, b) {
  const ta = new Set(tokenize(a));
  const tb = new Set(tokenize(b));
  const inter = [...ta].filter(x => tb.has(x)).length;
  const union = new Set([...ta, ...tb]).size || 1;
  return inter / union;
}

async function readAll() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function writeAll(items) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

class KnowledgeBaseService {
  async addItem({ title = '', content = '', tags = [] } = {}) {
    const items = await readAll();
    const item = {
      id: Date.now(),
      title,
      content,
      tags,
      createdAt: new Date().toISOString()
    };
    items.push(item);
    // keep last 500 entries
    const limited = items.slice(-500);
    await writeAll(limited);
    return item;
  }

  async search(query, limit = 3) {
    const items = await readAll();
    const scored = items.map(it => ({
      item: it,
      score: Math.max(
        similarity(query, it.title || ''),
        similarity(query, it.content || '')
      )
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored
      .filter(s => s.score > 0)
      .slice(0, limit)
      .map(s => ({ id: s.item.id, title: s.item.title, content: s.item.content, tags: s.item.tags, score: s.score }));
  }

  async getAll() {
    return readAll();
  }
}

export default new KnowledgeBaseService();


