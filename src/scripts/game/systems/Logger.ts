import Phaser from 'phaser';
import { jsonStringifySafe, selectFromObj } from './utils';

export type MessageType = 'info' | 'warn' | 'error';
export interface IMessage {
  time: number;
  message: string;
  type: MessageType;
}

export default class Logger {
  readonly messages: IMessage[] = [];
  readonly events: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter();

  isLogOn = true;

  info(message: any | string, ...args: any[]) {
    if (!this.isLogOn) return;

    if ((message as any).message) {
      const log = { ...(message as any) };
      delete log.message;
      if (Object.keys(log).length) console.log((message as any).message, log, ...args);
      else console.log((message as any).message, ...args);
    } else {
      console.log(message, ...args);
    }

    // support null-like values
    // and numbers in message argument
    if (message === null || message === undefined || typeof message === 'number') {
      message = '' + message;
    }

    if (typeof message === 'string' && message.slice(0, 2) === '%c') {
      // colorized log
      // do not pass it through
      args.length = 0;
      message = message.replace(/%c/g, '');
    }

    this.logMultipleArgs(message, 'info', args);
  }

  warn(message: any | string, ...args: any[]) {
    if ((message as any).message) {
      const warn = { ...(message as any) };
      delete warn.message;
      console.warn((message as any).message, warn, ...args);
    } else {
      console.warn(message, ...args);
    }

    this.logMultipleArgs(message, 'warn', args);
  }

  error(message: object | string, ...args: any[]) {
    if ((message as any).message) {
      const error = { ...(message as any) };
      delete error.message;
      console.error((message as any).message, error, ...args);
    } else {
      console.error(message, ...args);
    }

    this.logMultipleArgs(message, 'error', args);
  }

  private logMultipleArgs(message: object | string, type: MessageType, args: any[]) {
    if (args && args.length) {
      let argsStr = '';
      args.forEach((arg) => {
        if (argsStr) argsStr += ' | ';
        if (typeof arg === 'string') argsStr += arg;
        else argsStr += JSON.stringify(selectFromObj(arg, undefined, 4), null, '  ');
      });

      if (typeof message === 'string' || typeof message === 'number') message += ' | ' + argsStr;
      else (message as any)._msg = argsStr;
    }
    this.storeMsg(message, type);
    return message;
  }

  private storeMsg(message: object | string, type: MessageType = 'info') {
    const messageVO = {
      type,
      time: Date.now(),
      message: typeof message === 'string' ? message : jsonStringifySafe(message),
    };
    this.messages.push(messageVO);
  }
}

export const logger = new Logger();

export function logAs(subject: string, message: string, colorAs: string = '#d0b659') {
  logWithColor(`%c[${subject}] %c ${message}`, colorAs, '#88aaff');
}

export function logWithColor(message: string, firstColor = '#63aa17', secondColor = '#ffff33') {
  if (message.slice(0, 2) !== '%c') {
    const [pre, ...rest] = message.split('] ');
    message = `%c${pre}] %c${rest.join('] ')}`;
  }

  const colorsNeeded = message.match(/%c/g);

  if (colorsNeeded && colorsNeeded.length >= 4)
    logger.info(
      message,
      `background: #222; color: ${firstColor}`,
      'background: #222; color: #ddd',
      `background: #222; color: ${secondColor}`,
      'background: #222; color: #ddd'
    );
  else if (colorsNeeded && colorsNeeded.length === 3)
    logger.info(
      message,
      `background: #222; color: ${firstColor}`,
      'background: #222; color: #ddd',
      `background: #222; color: ${secondColor}`
    );
  else if (colorsNeeded && colorsNeeded.length === 2)
    logger.info(message, `background: #222; color: ${firstColor}`, 'background: #222; color: #ddd');
  else if (colorsNeeded && colorsNeeded.length === 1)
    logger.info(message, `background: #222; color: ${firstColor}`);
  else logger.info(message);
}
