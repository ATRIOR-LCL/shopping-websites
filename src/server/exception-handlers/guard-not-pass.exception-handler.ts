import { ExceptionHandler, GuardNotPassException } from 'bwcx-ljsm';
import type { IBwcxExceptionHandler, RequestContext } from 'bwcx-ljsm';
import { ErrCode } from '@common/enums/err-code.enum';
import { errCodeConfigs } from '@server/err-code-configs';

@ExceptionHandler(GuardNotPassException)
export default class GuardNotPassExceptionHandler implements IBwcxExceptionHandler {
  public catch(e: GuardNotPassException, ctx: RequestContext) {
    ctx.error(`GuardNotPassException caught: url: ${ctx.url}, ua: ${ctx.request.headers['user-agent']}, err:`, e);

    // 只判断指定路由未登录时跳转到登录页面
    const protectedRoutes = ['/', '/orders', '/cart', '/profile'];
    if ((protectedRoutes.includes(ctx.path) || protectedRoutes.some(r => ctx.path.startsWith(r + '/')))
      && !ctx.session?.user) {
      ctx.redirect('/login');
      return;
    }

    // 其他情况返回错误响应
    ctx.body = {
      success: false,
      code: ErrCode.IllegalRequest,
      msg: errCodeConfigs[ErrCode.IllegalRequest],
    };
  }
}
