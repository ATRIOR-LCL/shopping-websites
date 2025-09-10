import { Controller, InjectCtx, RequestContext, Post, UseGuards, Get, UseMiddlewares, Body, Contract } from 'bwcx-ljsm';
import { Inject } from 'bwcx-core';
import LoginService from './login.service';
import RandomGuard from '../../guards/random';
import LoginMiddleware from '@server/middlewares/login.middleware';
import { LoginReqDTO, LoginResDTO } from '@common/modules/login/login.dto';
import { Api } from 'bwcx-api';
import { ApiController } from '@server/decorators';

@ApiController()
@UseMiddlewares(LoginMiddleware)
export default class LoginController {
  public constructor(
    @InjectCtx()
    private readonly ctx: RequestContext,
    @Inject()
    private readonly loginService: LoginService,
  ) {}

  /** routes */
  @Api.Summary('User login')
  @Post('/login')
  @Contract(LoginReqDTO, LoginResDTO)
  public async login(@Body('username') username: string, @Body('password') password: string) {
    console.log(`username: ${username}, password: ${password}`);

    // 这里可以添加真实的用户验证逻辑
    // 为了演示，我们简单检查用户名和密码不为空
    if (username && password) {
      // 登录成功，设置 session
      this.ctx.session.user = {
        username,
        loginTime: new Date().toISOString()
      };

      return {
        success: true,
        message: 'Login successful',
        rows: [{ username }]
      };
    } else {
      // 登录失败
      return {
        success: false,
        message: 'Invalid username or password',
        rows: []
      };
    }
  }

  @Api.Summary('User logout')
  @Post('/logout')
  public async logout() {
    this.ctx.session.user = null;
    return {
      success: true,
      message: 'Logout successful'
    };
  }

  @Get('/secret')
  @UseGuards(RandomGuard)
  public secret() {
    return 'You have accessed a secret route!';
  }
}
