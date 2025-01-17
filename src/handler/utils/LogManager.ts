import { Cyan, Gray, Red } from '../types/TerminalColor';

export class LogManager {
  static log(message: string): void {
    this.logMessage('log', Cyan('[handler]'), message);
  }

  static logError(message: string, data?: unknown): void {
    this.logMessage('error', Red('[handler]'), message, data);
  }

  static logDefault(message: string): void {
    console.info(message);
  }

  private static logMessage(level: 'log' | 'error' | 'info', prefix: string, message: string, data?: unknown): void {
    const formattedMessage: string = this.formatMessage(prefix, message);
    console[level](formattedMessage, data ?? '');
  }

  private static formatMessage(prefix: string, message: string): string {
    const timestamp: string = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return `${Gray(timestamp)} ${prefix} ${message}`;
  }
}
