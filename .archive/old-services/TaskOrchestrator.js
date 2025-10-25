import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';
import { PRIVACY_SETTINGS } from '../constants/config';

const handlers = new Map();

export function registerTaskHandler(action, handler) {
  if (typeof action === 'string' && typeof handler === 'function') {
    handlers.set(action, handler);
  }
}

export function clearTaskHandlers() {
  handlers.clear();
}

// Default handlers
registerTaskHandler('create_note', async (params) => {
  const note = {
    id: Date.now(),
    title: params?.title || 'Note',
    content: params?.content || '',
    createdAt: new Date().toISOString(),
  };
  const raw = await AsyncStorage.getItem('motto_notes');
  const notes = raw ? JSON.parse(raw) : [];
  notes.push(note);
  await AsyncStorage.setItem('motto_notes', JSON.stringify(notes));
  return { success: true, message: 'Note created' };
});

registerTaskHandler('set_reminder', async (params, ctx) => {
  const reminder = {
    id: Date.now(),
    title: params?.title || 'Reminder',
    time: params?.time || new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  };
  const raw = await AsyncStorage.getItem('motto_reminders');
  const reminders = raw ? JSON.parse(raw) : [];
  reminders.push(reminder);
  await AsyncStorage.setItem('motto_reminders', JSON.stringify(reminders));
  if (ctx?.scheduleNotification) {
    try {
      await ctx.scheduleNotification({ title: reminder.title, body: `Scheduled for ${new Date(reminder.time).toLocaleString()}` });
    } catch {}
  }
  return { success: true, message: 'Reminder set' };
});

registerTaskHandler('navigate', async (params, ctx) => {
  if (ctx?.navigation && params?.screen) {
    try {
      ctx.navigation.navigate(params.screen);
      return { success: true, message: `Navigated to ${params.screen}` };
    } catch (e) {
      return { success: false, message: e?.message || 'Navigation failed' };
    }
  }
  return { success: false, message: 'Navigation unavailable' };
});

registerTaskHandler('collection_add', async (params) => {
  const item = {
    id: Date.now(),
    collection: params?.collection || 'default',
    value: params?.value,
  };
  const raw = await AsyncStorage.getItem('motto_collection_items');
  const items = raw ? JSON.parse(raw) : [];
  items.push(item);
  await AsyncStorage.setItem('motto_collection_items', JSON.stringify(items));
  return { success: true, message: 'Item added to collection' };
});

async function executeStep(step, ctx) {
  const action = step?.action;
  const params = step?.params || {};
  const handler = handlers.get(action);
  if (!handler) return { success: false, message: `Unknown action: ${action}` };
  
  // Privacy gate: block remote actions if privacy is enabled
  if (PRIVACY_SETTINGS.DISABLE_REMOTE_AI && isRemoteAction(action)) {
    return { success: false, message: 'Remote actions disabled for privacy' };
  }
  
  try {
    const t0 = Date.now();
    const res = await handler(params, ctx);
    const dt = Date.now() - t0;
    
    // Enhanced metrics with privacy redaction
    const metricsPayload = {
      action,
      ok: !!res?.success,
      ms: dt,
      params: PRIVACY_SETTINGS.REDACT_LOGS ? '[REDACTED]' : params
    };
    try { await MetricsService.log('tool_call', metricsPayload); } catch {}
    return res;
  } catch (e) {
    const errorPayload = {
      action,
      message: e?.message,
      params: PRIVACY_SETTINGS.REDACT_LOGS ? '[REDACTED]' : params
    };
    try { await MetricsService.log('tool_call_error', errorPayload); } catch {}
    return { success: false, message: e?.message || 'Step failed' };
  }
}

function isRemoteAction(action) {
  const remoteActions = ['api_call', 'web_search', 'external_request', 'remote_fetch'];
  return remoteActions.includes(action);
}

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

export async function executePlan(structuredPlan = [], context = {}, options = {}) {
  const results = [];
  for (let i = 0; i < structuredPlan.length; i++) {
    const step = structuredPlan[i];
    if (typeof options.onProgress === 'function') {
      try { await options.onProgress({ phase: 'before', index: i, total: structuredPlan.length, step }); } catch {}
    }

    // Per-step confirmation
    if (typeof options.beforeStep === 'function') {
      try {
        const ok = await options.beforeStep(step, i, structuredPlan.length);
        if (!ok) {
          results.push({ index: i, action: step?.action, success: true, message: 'Skipped by user' });
          continue;
        }
      } catch (e) {
        results.push({ index: i, action: step?.action, success: false, message: e?.message || 'Confirmation failed' });
        continue;
      }
    }

    const res = await executeStep(step, context);
    results.push({ index: i, action: step?.action, success: !!res.success, message: res.message });

    if (typeof options.onProgress === 'function') {
      try { await options.onProgress({ phase: 'after', index: i, total: structuredPlan.length, step, result: res }); } catch {}
    }
    // small delay between steps to keep UI responsive
    await wait(100);
  }
  const success = results.every(r => r.success);
  return { success, results };
}

export default { executePlan, registerTaskHandler, clearTaskHandlers };


