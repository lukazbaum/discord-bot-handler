// trade.ts

// ========== TYPES ==========
export type Inventory = Record<string, number>;

export interface TradeRecommendation {
  steps: string[];
  summary: string;
  details: {
    item: string;
    before: number;
    after: number;
    action: string;
    notes?: string;
  }[];
  projection?: string;
}

export interface TradeContext {
  area: number;
  crafterLevel: number;
  inventory: Inventory;
  timeTravel?: boolean;
  useTimePotion?: boolean; // TT bonus
}

// ========== CONSTANTS ==========

const TRADE_TABLE: Record<number, {id: string, from: string, to: string, rate: number}[]> = {
  1: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 1},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 1},
  ],
  2: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 1},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 1},
  ],
  3: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 1},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 1},
    {id: 'C', from: 'apple', to: 'wooden log', rate: 3},
    {id: 'D', from: 'wooden log', to: 'apple', rate: 3},
  ],
  4: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 2},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 2},
    {id: 'C', from: 'apple', to: 'wooden log', rate: 4},
    {id: 'D', from: 'wooden log', to: 'apple', rate: 4},
  ],
  5: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 2},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 2},
    {id: 'C', from: 'apple', to: 'wooden log', rate: 4},
    {id: 'D', from: 'wooden log', to: 'apple', rate: 4},
    {id: 'E', from: 'ruby', to: 'wooden log', rate: 450},
    {id: 'F', from: 'wooden log', to: 'ruby', rate: 450},
  ],
  6: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 3},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 3},
    {id: 'C', from: 'apple', to: 'wooden log', rate: 15},
    {id: 'D', from: 'wooden log', to: 'apple', rate: 15},
    {id: 'E', from: 'ruby', to: 'wooden log', rate: 675},
    {id: 'F', from: 'wooden log', to: 'ruby', rate: 675},
  ],
  7: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 3},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 3},
    {id: 'C', from: 'apple', to: 'wooden log', rate: 15},
    {id: 'D', from: 'wooden log', to: 'apple', rate: 15},
    {id: 'E', from: 'ruby', to: 'wooden log', rate: 675},
    {id: 'F', from: 'wooden log', to: 'ruby', rate: 675},
  ],
  8: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 3},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 3},
    {id: 'C', from: 'apple', to: 'wooden log', rate: 8},
    {id: 'D', from: 'wooden log', to: 'apple', rate: 8},
    {id: 'E', from: 'ruby', to: 'wooden log', rate: 675},
    {id: 'F', from: 'wooden log', to: 'ruby', rate: 675},
  ],
  9: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 2},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 2},
    {id: 'C', from: 'apple', to: 'wooden log', rate: 12},
    {id: 'D', from: 'wooden log', to: 'apple', rate: 12},
    {id: 'E', from: 'ruby', to: 'wooden log', rate: 850},
    {id: 'F', from: 'wooden log', to: 'ruby', rate: 850},
  ],
  10: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 3},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 3},
    {id: 'C', from: 'apple', to: 'wooden log', rate: 12},
    {id: 'D', from: 'wooden log', to: 'apple', rate: 12},
    {id: 'E', from: 'ruby', to: 'wooden log', rate: 500},
    {id: 'F', from: 'wooden log', to: 'ruby', rate: 500},
  ],
  11: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 3},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 3},
    {id: 'C', from: 'apple', to: 'wooden log', rate: 8},
    {id: 'D', from: 'wooden log', to: 'apple', rate: 8},
    {id: 'E', from: 'ruby', to: 'wooden log', rate: 500},
    {id: 'F', from: 'wooden log', to: 'ruby', rate: 500},
  ],
  12: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 3},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 3},
    {id: 'C', from: 'apple', to: 'wooden log', rate: 8},
    {id: 'D', from: 'wooden log', to: 'apple', rate: 8},
    {id: 'E', from: 'ruby', to: 'wooden log', rate: 350},
    {id: 'F', from: 'wooden log', to: 'ruby', rate: 350},
  ],
  13: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 3},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 3},
    {id: 'C', from: 'apple', to: 'wooden log', rate: 8},
    {id: 'D', from: 'wooden log', to: 'apple', rate: 8},
    {id: 'E', from: 'ruby', to: 'wooden log', rate: 350},
    {id: 'F', from: 'wooden log', to: 'ruby', rate: 350},
  ],
  14: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 3},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 3},
    {id: 'C', from: 'apple', to: 'wooden log', rate: 8},
    {id: 'D', from: 'wooden log', to: 'apple', rate: 8},
    {id: 'E', from: 'ruby', to: 'wooden log', rate: 350},
    {id: 'F', from: 'wooden log', to: 'ruby', rate: 350},
  ],
  15: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 3},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 3},
    {id: 'C', from: 'apple', to: 'wooden log', rate: 8},
    {id: 'D', from: 'wooden log', to: 'apple', rate: 8},
    {id: 'E', from: 'ruby', to: 'wooden log', rate: 350},
    {id: 'F', from: 'wooden log', to: 'ruby', rate: 350},
  ],
  16: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 2},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 2},
    {id: 'C', from: 'apple', to: 'wooden log', rate: 4},
    {id: 'D', from: 'wooden log', to: 'apple', rate: 4},
    {id: 'E', from: 'ruby', to: 'wooden log', rate: 250},
    {id: 'F', from: 'wooden log', to: 'ruby', rate: 250},
  ],
  17: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 2},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 2},
    {id: 'C', from: 'apple', to: 'wooden log', rate: 4},
    {id: 'D', from: 'wooden log', to: 'apple', rate: 4},
    {id: 'E', from: 'ruby', to: 'wooden log', rate: 250},
    {id: 'F', from: 'wooden log', to: 'ruby', rate: 250},
  ],
  18: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 2},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 2},
    {id: 'C', from: 'apple', to: 'wooden log', rate: 4},
    {id: 'D', from: 'wooden log', to: 'apple', rate: 4},
    {id: 'E', from: 'ruby', to: 'wooden log', rate: 250},
    {id: 'F', from: 'wooden log', to: 'ruby', rate: 250},
  ],
  19: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 2},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 2},
    {id: 'C', from: 'apple', to: 'wooden log', rate: 4},
    {id: 'D', from: 'wooden log', to: 'apple', rate: 4},
    {id: 'E', from: 'ruby', to: 'wooden log', rate: 250},
    {id: 'F', from: 'wooden log', to: 'ruby', rate: 250},
  ],
  20: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 2},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 2},
    {id: 'C', from: 'apple', to: 'wooden log', rate: 4},
    {id: 'D', from: 'wooden log', to: 'apple', rate: 4},
    {id: 'E', from: 'ruby', to: 'wooden log', rate: 250},
    {id: 'F', from: 'wooden log', to: 'ruby', rate: 250},
  ],
  21: [
    {id: 'A', from: 'normie fish', to: 'wooden log', rate: 2},
    {id: 'B', from: 'wooden log', to: 'normie fish', rate: 2},
    {id: 'C', from: 'apple', to: 'wooden log', rate: 4},
    {id: 'D', from: 'wooden log', to: 'apple', rate: 4},
    {id: 'E', from: 'ruby', to: 'wooden log', rate: 250},
    {id: 'F', from: 'wooden log', to: 'ruby', rate: 250},
  ],
};

const CRAFT_RECIPES = {
  'epic log':    { from: 'wooden log', cost: 25 },
  'super log':   { from: 'wooden log', cost: 250 },
  'mega log':    { from: 'wooden log', cost: 2500 },
  'hyper log':   { from: 'wooden log', cost: 25000 },
  'ultra log':   { from: 'wooden log', cost: 250000 },
  'banana':      { from: 'apple',      cost: 15 },
  'epic fish':   { from: 'normie fish', cost: 1500 },
  'golden fish': { from: 'normie fish', cost: 15 },
  // Add more!
};

const DISMANTLE_RETURNS = {
  'epic log':    { to: 'wooden log', amount: 20, loss: 0.2 },
  'super log':   { to: 'wooden log', amount: 160, loss: 0.36 },
  'mega log':    { to: 'wooden log', amount: 1280, loss: 0.488 },
  'hyper log':   { to: 'wooden log', amount: 10240, loss: 0.5904 },
  'ultra log':   { to: 'wooden log', amount: 81920, loss: 0.6723 },
  'banana':      { to: 'apple', amount: 12, loss: 0.2 },
  'epic fish':   { to: 'normie fish', amount: 960, loss: 0.36 },
  'golden fish': { to: 'normie fish', amount: 12, loss: 0.2 },
  // Add more!
};

const ITEM_ALIASES: Record<string, string> = {
  'logs': 'wooden log',
  'log': 'wooden log',
  'wooden logs': 'wooden log',
  'wood logs': 'wooden log',
  'fish': 'normie fish',
  'normie fish': 'normie fish',
  'apples': 'apple',
  'banana': 'banana',
  'bananas': 'banana',
  'superlog': 'super log',
  'epiclog': 'epic log',
  'megalog': 'mega log',
  'hyperlog': 'hyper log',
  'ultralog': 'ultra log',
  // More as needed
};


function normalizeItemName(str: string): string {
  str = str.trim().toLowerCase();
  return ITEM_ALIASES[str] || str;
}
const MAX_SAFE = 25_000_000_000;

function fmt(n: number) {
  return n.toLocaleString();
}

// ========== PARSERS ==========
export function parseCrafterLevel(embed: any): number {
  for (const field of embed.fields || []) {
    const match = field.name.match(/Crafter Lv\s*(\d+)/i);
    if (match) return parseInt(match[1], 10);
  }
  return 0;
}
export function parseInventory(embed: any): Inventory {
  const inventory: Inventory = {};
  for (const field of embed.fields || []) {
    const lines = field.value.split('\n');
    for (const line of lines) {
      const m = line.match(/\*\*(.+?)\*\*:\s*([\d,]+)/);
      if (m) {
        const key = normalizeItemName(m[1]);
        inventory[key] = Number(m[2].replace(/,/g, ''));
      }
    }
  }
  return inventory;
}

// ========== CRAFTER BONUS FORMULA ==========
export function getCrafterReturnPercent(level: number): number {
  if (level <= 100) return 10;
  return 12.5 + Math.pow(225 * (level - 100), 0.2);
}

// ========== Dismantle Helper ==========
export function getAllDismantleSteps(inventory: Inventory, crafterLevel: number): { steps: string[], newInventory: Inventory } {
  let steps: string[] = [];
  let newInventory = { ...inventory };
  for (const [item, v] of Object.entries(DISMANTLE_RETURNS)) {
    const count = newInventory[item] || 0;
    if (count > 0) {
      let returnAmt = v.amount;
      if (item === 'banana' || item === 'golden fish') {
        returnAmt = Math.floor(15 * (getCrafterReturnPercent(crafterLevel) / 100));
      }
      newInventory[item] = 0;
      newInventory[v.to] = (newInventory[v.to] || 0) + count * returnAmt;
      steps.push(`/dismantle ${item.replace(' ', '')} all`);
    }
  }
  return { steps, newInventory };
}

/** Find the best trade/craft/dismantle chain in this area to maximize logs in Area 10 (no TT) */
export function findBestTradePathToA10(
  area: number,
  inventory: Inventory,
  crafterLevel: number
): { steps: string[], projectedLogs: number } {
  // Clone inventory to avoid mutation
  let inv = JSON.parse(JSON.stringify(inventory)) as Inventory;
  let steps: string[] = [];

  // Simple greedy: apply all available trades/crafts/dismantles in the given area (excluding TT logic)
  // For real use, you could A* or BFS for max logs, but this is a good baseline!
  // Try: log→apple (area 3), apple→log (area 4), fish→log, log→fish, and all dismantles/crafts
  let somethingChanged: boolean;
  do {
    somethingChanged = false;
    // Trades
    for (const t of TRADE_TABLE[area] || []) {
      const fromCount = inv[t.from] || 0;
      if (fromCount >= t.rate) {
        const times = Math.floor(fromCount / t.rate);
        if (times > 0) {
          inv[t.from] -= times * t.rate;
          inv[t.to] = (inv[t.to] || 0) + times;
          steps.push(`/trade ${t.id} ${times}`);
          somethingChanged = true;
        }
      }
    }
    // Crafts
    for (const [item, v] of Object.entries(CRAFT_RECIPES)) {
      const fromCount = inv[v.from] || 0;
      if (fromCount >= v.cost) {
        const times = Math.floor(fromCount / v.cost);
        if (times > 0) {
          inv[v.from] -= times * v.cost;
          inv[item] = (inv[item] || 0) + times;
          steps.push(`/craft ${item.replace(' ', '')} ${times}`);
          somethingChanged = true;
        }
      }
    }
    // Dismantles
    for (const [item, v] of Object.entries(DISMANTLE_RETURNS)) {
      const count = inv[item] || 0;
      if (count > 0) {
        let returnAmt = v.amount;
        if (item === 'banana' || item === 'golden fish') {
          returnAmt = Math.floor(15 * (getCrafterReturnPercent(crafterLevel) / 100));
        }
        inv[item] = 0;
        inv[v.to] = (inv[v.to] || 0) + count * returnAmt;
        steps.push(`/dismantle ${item.replace(' ', '')} all`);
        somethingChanged = true;
      }
    }
  } while (somethingChanged);

  // Forward-project to A10 for rubies/logs/apples
  const logs = inv['wooden log'] || 0;
  const rubies = inv['ruby'] || 0;
  const apples = inv['apple'] || 0;
  // Use the same "projectOptimalTT" logic (but don't apply TT loss)
  const projection = projectOptimalTT(logs, rubies, TRADE_TABLE);
  // Apples can be converted in A4, rubies in A5, then logs are final in A10
  return {
    steps,
    projectedLogs: projection.projectedLogs,
  };
}

// ========== Main TT Chain Optimizer ==========

function getOptimalTTSplitAndProject(
  logs: number,
  rubies: number,
  area: number,
  useTimePotion: boolean,
  tradeTables: typeof TRADE_TABLE
): {steps: string[], projectedLogs: number, notes: string[]} {
  const MAX_SAFE = 25_000_000_000;

  // Find logs->ruby trade in this area
  const logToRuby = (tradeTables[area] || []).find(t => t.from === 'wooden log' && t.to === 'ruby');
  if (!logToRuby) {
    return {
      steps: [],
      projectedLogs: logs,
      notes: ["No logs→rubies trade in this area!"]
    };
  }

  // Try a grid of possible splits: keep X logs, trade rest to rubies, simulate TT, project to A10
  let best = {
    steps: [] as string[],
    projectedLogs: logs,
    notes: [] as string[]
  };
  let bestLogsA10 = logs;

  // Use reasonable step size to keep it fast, e.g. every 1B logs, but always try edge cases
  let step = Math.max(1, Math.floor(MAX_SAFE / 25)); // 1B steps

  for (let keepLogs = 0; keepLogs <= Math.min(logs, MAX_SAFE); keepLogs += step) {
    // Trade rest of logs to rubies
    let tradeLogs = logs - keepLogs;
    let tradableRubies = Math.floor(tradeLogs / logToRuby.rate);
    let leftoverLogs = tradeLogs - tradableRubies * logToRuby.rate;
    let logsAfter = keepLogs + leftoverLogs;
    let rubiesAfter = rubies + tradableRubies;

    // TT loss
    const loss = useTimePotion ? 0.075 : 0.15;
    let logsPost = Math.floor(logsAfter * (1 - loss));
    let rubiesPost = Math.floor(rubiesAfter * (1 - loss));

    // Project optimal trades from A1-A10 (area 5: rubies->logs, area 3/4: logs->apples->logs)
    const project = projectOptimalTT(logsPost, rubiesPost, tradeTables);

    if (project.projectedLogs > bestLogsA10) {
      bestLogsA10 = project.projectedLogs;
      best = {
        steps: [
          tradableRubies > 0 ? `/trade ${logToRuby.id} ${tradableRubies}` : "(no logs traded to rubies)",
          `Time travel (loss: ${(loss*100).toFixed(2)}%)`,
          ...project.steps
        ].filter(Boolean),
        projectedLogs: project.projectedLogs,
        notes: [
          `Pre-TT: Keep ${fmt(keepLogs)} logs, convert ${fmt(tradeLogs)} logs to rubies (${tradableRubies} rubies, ${fmt(leftoverLogs)} leftover logs)`,
          `Post-TT: ${fmt(logsPost)} logs, ${fmt(rubiesPost)} rubies`,
          `After optimal post-TT trades, logs in area 10: ${fmt(project.projectedLogs)}`
        ]
      };
    }
  }

  // Edge case: trade all logs to rubies except for leftovers
  let allToRubies = Math.floor(logs / logToRuby.rate);
  let allLeftoverLogs = logs - allToRubies * logToRuby.rate;
  let rubiesAll = rubies + allToRubies;
  let logsPost = Math.floor(allLeftoverLogs * (1 - (useTimePotion ? 0.075 : 0.15)));
  let rubiesPost = Math.floor(rubiesAll * (1 - (useTimePotion ? 0.075 : 0.15)));
  const projectAll = projectOptimalTT(logsPost, rubiesPost, tradeTables);
  if (projectAll.projectedLogs > bestLogsA10) {
    best = {
      steps: [
        `/trade ${logToRuby.id} ${allToRubies}`,
        `Time travel (loss: ${(useTimePotion ? 7.5 : 15).toFixed(2)}%)`,
        ...projectAll.steps
      ],
      projectedLogs: projectAll.projectedLogs,
      notes: [
        `Pre-TT: Convert all logs to rubies (leftover logs: ${fmt(allLeftoverLogs)})`,
        `Post-TT: ${fmt(logsPost)} logs, ${fmt(rubiesPost)} rubies`,
        `After optimal post-TT trades, logs in area 10: ${fmt(projectAll.projectedLogs)}`
      ]
    };
  }

  // If nothing found (shouldn't happen), fallback
  if (!best.steps.length) {
    best.steps = ["No TT trade steps possible."];
    best.projectedLogs = logs;
    best.notes = ["Unable to optimize TT: not enough logs or missing rates."];
  }

  return best;
}

/** Helper: Simulate post-TT trading up to area 10 */
function projectOptimalTT(
  logsAfterTT: number,
  rubiesAfterTT: number,
  tradeTables: typeof TRADE_TABLE
): { projectedLogs: number; steps: string[] } {
  let steps: string[] = [];
  let logs = logsAfterTT;
  let rubies = rubiesAfterTT;
  const MAX_SAFE = 25_000_000_000;

  // 1. Area 5: Rubies -> logs
  const tradeE = (tradeTables[5] || []).find(t => t.from === 'ruby' && t.to === 'wooden log');
  if (tradeE && rubies > 0) {
    const canTrade = Math.floor((MAX_SAFE - logs) / tradeE.rate);
    const tradeRubies = Math.min(rubies, canTrade);
    if (tradeRubies > 0) {
      logs += tradeRubies * tradeE.rate;
      rubies -= tradeRubies;
      steps.push(`Area 5: /trade ${tradeE.id} ${tradeRubies} (rubies → logs)`);
    }
    if (rubies > 0) steps.push(`Area 5: (leftover rubies: ${fmt(rubies)})`);
  }

  // 2. Area 3: logs → apples, Area 4: apples → logs
  let apples = 0;
  const tradeD = (tradeTables[3] || []).find(t => t.from === 'wooden log' && t.to === 'apple');
  if (tradeD && logs > 0) {
    let canTrade = Math.min(Math.floor(logs / tradeD.rate), Math.floor(MAX_SAFE));
    if (canTrade > 0) {
      logs -= canTrade * tradeD.rate;
      apples += canTrade;
      steps.push(`Area 3: /trade ${tradeD.id} ${canTrade} (logs → apples)`);
    }
    if (logs > 0) steps.push(`Area 3: (leftover logs: ${fmt(logs)})`);
  }
  const tradeC = (tradeTables[4] || []).find(t => t.from === 'apple' && t.to === 'wooden log');
  if (tradeC && apples > 0) {
    let canTrade = Math.min(apples, Math.floor((MAX_SAFE - logs) / tradeC.rate));
    if (canTrade > 0) {
      apples -= canTrade;
      logs += canTrade * tradeC.rate;
      steps.push(`Area 4: /trade ${tradeC.id} ${canTrade} (apples → logs)`);
    }
    if (apples > 0) steps.push(`Area 4: (leftover apples: ${fmt(apples)})`);
  }
  // Now logs = optimal for area 10
  return {
    projectedLogs: logs,
    steps,
  };
}

// ========== Inventory Optimization for Non-TT ==========
function getPossibleActions(area: number, inventory: Inventory) {
  const actions: any[] = [];
  // Trades
  for (const t of TRADE_TABLE[area] || []) {
    if (inventory[t.from] && inventory[t.from] >= t.rate) {
      actions.push({ type: 'trade', ...t });
    }
  }
  // Craft
  for (const [item, v] of Object.entries(CRAFT_RECIPES)) {
    if (inventory[v.from] && inventory[v.from] >= v.cost) {
      actions.push({ type: 'craft', to: item, from: v.from, cost: v.cost });
    }
  }
  // Dismantle
  for (const [item, v] of Object.entries(DISMANTLE_RETURNS)) {
    if (inventory[item] && inventory[item] > 0) {
      actions.push({ type: 'dismantle', from: item, to: v.to, amount: v.amount, loss: v.loss });
    }
  }
  return actions; // <-- THIS is the missing line!
}
function cloneInv(inv: Inventory) { return JSON.parse(JSON.stringify(inv)); }
function optimizeInventory(
  area: number,
  inv: Inventory,
  crafterLvl: number,
  depth = 0,
  chain: string[] = [],
  seen: Set<string> = new Set()
): { steps: string[]; finalInv: Inventory; details: any[] } | null {
  // If all items are below MAX_SAFE, stop and return the current inventory and action chain.
  const bad = Object.entries(inv).filter(([_, v]) => v >= MAX_SAFE);
  if (bad.length === 0) {
    return { steps: chain, finalInv: cloneInv(inv), details: [] };
  }

  // Cycle/recursion guard: Don't recurse forever, nor loop on same state.
  const invSig = JSON.stringify(inv);
  if (seen.has(invSig) || depth > 7) {
    return null;
  }
  seen.add(invSig);

  // Try to reduce each "bad" item using available actions
  for (const [item, _] of bad) {
    // All possible actions (trade/craft/dismantle) for this area and inventory
    const possible = getPossibleActions(area, inv).filter(
      act => act.from === item || (act.type === 'dismantle' && act.from === item)
    );
    for (const act of possible) {
      const newInv = cloneInv(inv);
      let step = '';

      if (act.type === 'trade') {
        const maxTrades = Math.floor(newInv[act.from] / act.rate);
        if (maxTrades < 1) continue; // Skip useless trades
        newInv[act.from] -= maxTrades * act.rate;
        newInv[act.to] = (newInv[act.to] || 0) + maxTrades;
        step = `/trade ${act.id} ${maxTrades}`;
      } else if (act.type === 'craft') {
        const maxCrafts = Math.floor(newInv[act.from] / act.cost);
        if (maxCrafts < 1) continue;
        newInv[act.from] -= maxCrafts * act.cost;
        newInv[act.to] = (newInv[act.to] || 0) + maxCrafts;
        step = `/craft ${act.to.replace(' ', '')} ${maxCrafts}`;
      } else if (act.type === 'dismantle') {
        // Apply crafter bonus if banana/golden fish
        let returnAmt = act.amount;
        if (act.from === 'banana' || act.from === 'golden fish') {
          returnAmt = Math.floor(15 * (getCrafterReturnPercent(crafterLvl) / 100));
        }
        const maxDismantle = newInv[act.from];
        if (maxDismantle < 1) continue;
        newInv[act.from] = 0;
        newInv[act.to] = (newInv[act.to] || 0) + maxDismantle * returnAmt;
        step = `/dismantle ${act.from.replace(' ', '')} all`;
      }

      // Recursive call for the next step
      const result = optimizeInventory(area, newInv, crafterLvl, depth + 1, [...chain, step], seen);
      if (result) {
        return result; // Return first solution found (could also try best-of-all)
      }
    }
  }

  // If no possible actions solved the problem, explicitly return null.
  return null;
}
// ========== Main Entry Point ==========
export function getTradeRecommendation(ctx: TradeContext): TradeRecommendation {
  const { area, crafterLevel, inventory, timeTravel, useTimePotion } = ctx;

  // Step 1: Dismantle all logs/fish/banana tiers first (mandatory for TT)
  let dismantleSteps: string[] = [];
  let workingInventory = { ...inventory };
  if (timeTravel) {
    const dismantled = getAllDismantleSteps(workingInventory, crafterLevel);
    dismantleSteps = dismantled.steps;
    workingInventory = dismantled.newInventory;
  }

  if (timeTravel) {
    const logs = workingInventory['wooden log'] || 0;
    const rubies = workingInventory['ruby'] || 0;
    const result = getOptimalTTSplitAndProject(
      logs, rubies, area, !!useTimePotion, TRADE_TABLE
    );
    return {
      steps: [...dismantleSteps, ...result.steps],
      summary: 'TT Optimization Path (MAX post-TT logs in Area 10):',
      details: [],
      projection: `Projected logs after TT and all trades: ${result.projectedLogs.toLocaleString()}\n\n${result.notes.join('\n')}`,
    };
  }

  // Normal trade optimizer (not TT)
  const result = optimizeInventory(area, inventory, crafterLevel);
  if (!result) {
    return {
      steps: ['No valid action chain found!'],
      summary: 'Could not optimize inventory. Try manually reducing item quantities.',
      details: [],
    };
  }
  const details = Object.entries(result.finalInv).map(([item, after]) => ({
    item,
    before: inventory[item] || 0,
    after,
    action: result.steps.join(' → ')
  }));
  return {
    steps: result.steps,
    summary: result.steps.length
      ? "Trade/craft/dismantle these to bring all items below 25B:"
      : "All items are already under 25B, no actions needed.",
    details,
  };
}

// ========== EMBED FORMATTER ==========

function getTradeRelevantItems(area: number): Set<string> {
  const set = new Set<string>();
  for (const t of TRADE_TABLE[area] || []) {
    set.add(t.from);
    set.add(t.to);
  }
  for (const item in CRAFT_RECIPES) {
    set.add(item);
    set.add(CRAFT_RECIPES[item].from);
  }
  for (const item in DISMANTLE_RETURNS) {
    set.add(item);
    set.add(DISMANTLE_RETURNS[item].to);
  }
  return set;
}

export function formatTradeEmbed(rec: TradeRecommendation, area?: number): any {
  const MAX_FIELDS = 25;
  let fields = rec.details;

  // Only show trade-relevant items (if area provided)
  if (area) {
    const relevant = getTradeRelevantItems(area);
    fields = fields.filter(x => relevant.has(x.item));
  }

  const shownFields = fields.length > MAX_FIELDS ? fields.slice(0, MAX_FIELDS) : fields;

  return {
    title: 'Trade Recommendations',
    description: rec.summary + (rec.projection ? `\n\n${rec.projection}` : ''),
    fields: shownFields.map(x => ({
      name: `${x.item}`,
      value: `**Before:** ${x.before.toLocaleString()} → **After:** ${x.after.toLocaleString()}\n${x.action}`,
      inline: false,
    })),
    color: 0x3498db,
    footer: { text: `Run each command in order before progressing to the next area!${fields.length > MAX_FIELDS ? ' (First 25 trade items shown)' : ''}` },
  };
}

export { TRADE_TABLE, CRAFT_RECIPES, DISMANTLE_RETURNS };