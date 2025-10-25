// Utility to parse compound/multi-step commands from a string
// Returns an array of parsed command objects: { app, action, text, params }

export function parseCompoundCommand(commandString) {
  if (!commandString || typeof commandString !== 'string') return [];

  // Split on common conjunctions for compound commands
  const steps = commandString
    .split(/\band\b|\,|\;/i)
    .map(s => s.trim())
    .filter(Boolean);

  // Simple patterns for demo; can be extended for more complex parsing
  const commandPatterns = [
    // open app and do something
    /open\s+(?<app>\w+)(?:\s+and\s+(?<action>\w+))?(?:\s+for\s+(?<text>.+))?/i,
    // create note
    /create\s+(?<app>note|reminder|event|email|mail|calendar|task)(?:\s*:\s*(?<text>.+))?/i,
    // search in app
    /search\s+for\s+(?<text>.+?)(?:\s+in\s+(?<app>\w+))?/i,
    // play music in app
    /play\s+(?<text>.+?)(?:\s+in\s+(?<app>\w+))?/i,
    // generic app action
    /(?<action>\w+)\s+(?<app>\w+)(?:\s+about\s+(?<text>.+))?/i,
  ];

  const parsed = steps.map(step => {
    for (const pattern of commandPatterns) {
      const match = step.match(pattern);
      if (match && match.groups) {
        return {
          app: match.groups.app || null,
          action: match.groups.action || null,
          text: match.groups.text || null,
          params: match.groups,
        };
      }
    }
    // Fallback: return raw step
    return { app: null, action: null, text: step, params: {} };
  });

  return parsed;
}

// Example usage:
// parseCompoundCommand('open Safari and search for weather in Paris')
// => [ { app: 'Safari', action: null, text: null, ... }, { app: null, action: 'search', text: 'weather in Paris', ... } ] 