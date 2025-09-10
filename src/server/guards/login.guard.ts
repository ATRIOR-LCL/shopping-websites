import { Guard, IBwcxGuard, RequestContext } from 'bwcx-ljsm';

@Guard()
export default class LoginGuard implements IBwcxGuard {
  canPass(ctx: RequestContext) {
    // 检查用户是否已登录
    // 这里可以检查 session、cookie、或者其他认证方式
    // 示例：检查 session 中是否有用户信息
    const isLoggedIn = ctx.session?.user != null;

    // 返回登录状态，如果返回 false，框架会抛出 GuardNotPassException
    // 重定向逻辑将由异常处理器处理
    return isLoggedIn;
  }
}
