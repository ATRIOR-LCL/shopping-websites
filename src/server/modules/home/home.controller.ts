import { Get, Contract, UseGuards } from 'bwcx-ljsm';
import { ApiController } from '@server/decorators';
import { ItemReqDTO, ItemResDTO } from '@common/modules/items/item.dto';
import ItemsUtils from '@server/utils/getItems';
import { Inject } from 'bwcx-core';
import LoginGuard from '@server/guards/login.guard';
import { Api } from 'bwcx-api';
import { RequestContext } from 'bwcx-ljsm';
import { InjectCtx } from 'bwcx-ljsm';

@ApiController()
@UseGuards(LoginGuard)
export default class ItemsController {
  public constructor(
    @InjectCtx() private readonly ctx: RequestContext,
    @Inject()
    private readonly itemsUtils: ItemsUtils,
  ) {}

  @Api.Summary('Get all items')
  @Get('/items')
  @Contract(ItemReqDTO, ItemResDTO)
  public async getAllItems() {
    const items = this.itemsUtils.allItems;
    return {
      count: this.itemsUtils.totalItemsLength,
      rows: items,
    };
  }

  @Api.Summary('Get UserInfo')
  @Get('/user')
  public async getUserInfo() {
    return {
      data: {
        username: this.ctx.session?.user?.username || 'Guest',
      }
    }
  }
}
