import { ExceptionHandler, GuardNotPassException } from 'bwcx-ljsm';
import type { IBwcxExceptionHandler, RequestContext } from 'bwcx-ljsm';
import { ErrCode } from '@common/enums/err-code.enum';
import { errCodeConfigs } from '@server/err-code-configs';

@ExceptionHandler(GuardNotPassException)
export default class GuardNotPassExceptionHandler implements IBwcxExceptionHandler {
  public catch(e: GuardNotPassException, ctx: RequestContext) {
    ctx.error(`GuardNotPassException caught: url: ${ctx.url}, ua: ${ctx.request.headers['user-agent']}, err:`, e);

    // 如果是访问根路径且未登录，重定向到登录页面
    if (ctx.path === '/' && !ctx.session?.user) {
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
