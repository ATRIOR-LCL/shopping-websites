import { Controller, InjectCtx, RequestContext } from 'bwcx-ljsm';
import { Inject } from 'bwcx-core';
import { ApiController } from '@server/decorators';

@ApiController()
export default class UserController {
  public constructor(
    @InjectCtx()
    private readonly ctx: RequestContext,
  ) {}

  /** routes */
  
}
