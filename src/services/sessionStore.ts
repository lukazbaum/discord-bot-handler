// src/services/sessionStore.ts

interface EternalSession {
  origin: "command" | "listener";
  step:
    | "awaitingEternal"
    | "awaitingProfile"
    | "awaitingInventory"
    | "awaitingGoal"
    | "awaitingTC"
    | "awaitingExpectedTT";
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
}

export const eternalSessionStore = new Map<string, EternalSession>();