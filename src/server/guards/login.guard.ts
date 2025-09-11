import { Guard, IBwcxGuard, RequestContext } from 'bwcx-ljsm';

@Guard()
export default class LoginGuard implements IBwcxGuard {
  canPass(ctx: RequestContext) {
    const isLoggedIn = ctx.session?.user != null;
    return isLoggedIn;
  }
}
