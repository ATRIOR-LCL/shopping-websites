import { Guard, IBwcxGuard, RequestContext } from 'bwcx-ljsm';

@Guard()
export default class RandomGuard implements IBwcxGuard {
  canPass(ctx: RequestContext) {
    return Math.random() > 0.5;
  }
}
