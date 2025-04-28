import { Cyan, Gray, Red } from '../types/TerminalColor';
export class LogManager {
    static log(message) {
        this.logMessage('log', Cyan('[handler]'), message);
    }
    static logError(message, data) {
        this.logMessage('error', Red('[handler]'), message, data);
    }
    static logDefault(message) {
        console.info(message);
    }
    static logMessage(level, prefix, message, data) {
        const formattedMessage = this.formatMessage(prefix, message);
        console[level](formattedMessage, data ?? '');
    }
    static formatMessage(prefix, message) {
        const timestamp = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        return `${Gray(timestamp)} ${prefix} ${message}`;
    }
}
