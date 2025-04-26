interface EternalSession {
  origin: "command" | "listener";
  step:
    | "awaitingEternal"
    | "awaitingProfile"
    | "awaitingInventory"
    | "awaitingGoal"
    | "awaitingTC"
    | "awaitingExpectedTT"
    | "awaitingDaysSealed";
  channelId: string;
  eternal?: {
    eternalAT: number;
    eternalDEF: number;
    eternalLIFE: number;
    eternalProgress: number;
    lastUnsealTT: number;
    swordTier: number;
    swordLevel: number;
  };
  profile?: {
    level: number;
    timeTravels: number;
  };
  inventory?: {
    eternityFlames: number;
  };
  goal?: number;
  tc?: number;
  expectedTT?: number;
  daysSealed?: number;
  result?: {
    flamesToReach: number;
    ttGained: number;
    estTC: number;
    dungeonsNeeded: number;
    estimatedRuns: number;
    tcPerDungeon: number;
    unsealFlames: number;
    recommended: {
      name: string;
      attack: number;
    };
    atkPowerNeeded?: number;
    atkBitePowerNeeded?: number;
    swordBaseAtk?: number;
    flameInventory: number;
    flameDeficit: number;
    canUnseal: boolean;
    bonusTT: number;
  };
}

export const eternalSessionStore = new Map<string, EternalSession>();