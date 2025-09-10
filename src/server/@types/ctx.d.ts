import 'bwcx-ljsm';
import 'koa-session';

declare module 'bwcx-ljsm' {
  interface RequestContext {
    // add your extra ctx properties
    info: (...messages: any[]) => void;
    warn: (...messages: any[]) => void;
    error: (...messages: any[]) => void;
    // session 支持
    session: {
      user?: {
        username: string;
        loginTime: string;
      } | null;
      [key: string]: any;
    };
  }
}
