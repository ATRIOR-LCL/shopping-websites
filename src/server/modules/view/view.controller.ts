import { Controller, Get, UseGuards } from 'bwcx-ljsm';
import { Inject } from 'bwcx-core';
import { UseClientRoutes, PrimaryRenderMethod, OverrideView } from 'bwcx-client-vue/server';
import { RenderMethodKind } from 'bwcx-client-vue';
import ViewService from './view.service';
import { HtmlResponse } from '@server/response-handlers/html.response-handler';
import LoginGuard from '../../guards/login.guard';

@Controller('', { priority: -100 })
@HtmlResponse()
export default class ViewController {
  public constructor(
    @Inject()
    private readonly service: ViewService,
  ) {}

  // 可选重写指定某个前端路由的逻辑
  @OverrideView('DemoDetail')
  public demoDetailView(@PrimaryRenderMethod() renderMethod: RenderMethodKind) {
    // 可以重写逻辑，如有条件的重定向等。不会进入到下面的 `autoWiredView`
    console.log('DemoDetail has been overridden. The original render method is:', renderMethod);
    return this.service.render(renderMethod || RenderMethodKind.CSR);
  }

  // 为首页路由添加登录守卫
  @OverrideView('HomeView')
  @UseGuards(LoginGuard)
  public homeView(@PrimaryRenderMethod() renderMethod: RenderMethodKind) {
    // 如果通过了登录守卫，正常渲染首页
    return this.service.render(renderMethod || RenderMethodKind.SSR);
  }

  @UseClientRoutes()
  public autoWiredView(@PrimaryRenderMethod() renderMethod: RenderMethodKind) {
    return this.service.render(renderMethod || RenderMethodKind.CSR);
  }
}
