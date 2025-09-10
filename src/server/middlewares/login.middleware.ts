import { Middleware, IBwcxMiddleware, RequestContext, MiddlewareNext } from 'bwcx-ljsm';

@Middleware()
export default class LoginMiddleware implements IBwcxMiddleware {
  public async use(ctx: RequestContext, next: MiddlewareNext) {
    /** methods */
    console.log('request path:', ctx.path);
    await next();
  }
}

