import type { TimestampStyle } from '../types/TimestampStyle';

export function formatTimestamp(timestamp: number, style: TimestampStyle): string {
  return `<t:${timestamp}${style}>`;
}
