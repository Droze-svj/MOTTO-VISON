import {
  PRIVATE_SEARCH_PROVIDER,
  BRAVE_SEARCH_ENDPOINT,
  BRAVE_SEARCH_API_KEY,
  KAGI_SEARCH_ENDPOINT,
  KAGI_SEARCH_API_KEY,
  SEARXNG_SEARCH_ENDPOINT,
  PRIVACY_SETTINGS,
} from '../constants/config';
import MetricsService from './MetricsService';

class PrivateSearchService {
  constructor() {
    this.provider = PRIVATE_SEARCH_PROVIDER;
  }

  async searchWeb(query, options = {}) {
    const q = (query || '').trim();
    if (!q) return [];
    
    // Privacy gate: block search if disabled
    if (PRIVACY_SETTINGS.DISABLE_PRIVATE_SEARCH) {
      try { await MetricsService.log('search_blocked', { query: PRIVACY_SETTINGS.REDACT_LOGS ? '[REDACTED]' : q, reason: 'privacy_disabled' }); } catch {}
      return [];
    }
    
    const t0 = Date.now();
    let results = [];
    
    try {
      switch (this.provider) {
        case 'kagi':
          results = await this._searchKagi(q, options);
          break;
        case 'searxng':
          results = await this._searchSearxng(q, options);
          break;
        case 'brave':
        default:
          results = await this._searchBrave(q, options);
      }
      
      const dt = Date.now() - t0;
      const metricsPayload = {
        provider: this.provider,
        query: PRIVACY_SETTINGS.REDACT_LOGS ? '[REDACTED]' : q,
        resultCount: results.length,
        ms: dt,
        success: true
      };
      try { await MetricsService.log('private_search', metricsPayload); } catch {}
      
      return results;
    } catch (e) {
      const dt = Date.now() - t0;
      const errorPayload = {
        provider: this.provider,
        query: PRIVACY_SETTINGS.REDACT_LOGS ? '[REDACTED]' : q,
        ms: dt,
        success: false,
        error: e?.message
      };
      try { await MetricsService.log('private_search_error', errorPayload); } catch {}
      return [];
    }
  }

  async _searchBrave(query, options) {
    if (!BRAVE_SEARCH_API_KEY) return [];
    const url = `${BRAVE_SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}&count=${options.count || 5}`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': BRAVE_SEARCH_API_KEY,
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items = data?.web?.results || [];
    return items.map(it => ({ title: it.title, url: it.url, snippet: it.description }));
  }

  async _searchKagi(query, options) {
    if (!KAGI_SEARCH_API_KEY) return [];
    const res = await fetch(KAGI_SEARCH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bot ${KAGI_SEARCH_API_KEY}`,
      },
      body: JSON.stringify({ q: query, limit: options.count || 5 })
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items = data?.data || [];
    return items.map(it => ({ title: it.title, url: it.url, snippet: it.snippet }));
  }

  async _searchSearxng(query, options) {
    if (!SEARXNG_SEARCH_ENDPOINT) return [];
    const url = `${SEARXNG_SEARCH_ENDPOINT}/search?q=${encodeURIComponent(query)}&format=json&categories=general&language=en`; 
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const items = data?.results || [];
    return items.slice(0, options.count || 5).map(it => ({ title: it.title, url: it.url, snippet: it.content }));
  }
}

export default new PrivateSearchService();


