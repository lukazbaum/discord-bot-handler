import type { Events } from 'discord.js';

type EventExecutor = (...args: any[]) => Promise<void>;

interface EventData {
  name: Events;
  once?: boolean;
  disabled?: boolean;
  execute: EventExecutor;
}

export class Event {
  readonly name: string;
  readonly once: boolean;
  readonly disabled: boolean;
  readonly execute: EventExecutor;

  constructor({ name, once = false, disabled = false, execute }: EventData) {
    this.name = name;
    this.once = once;
    this.disabled = disabled;
    this.execute = execute;
  }
}
