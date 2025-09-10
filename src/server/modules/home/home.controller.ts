import { InjectCtx, RequestContext, Post, Get, Contract, UseGuards } from 'bwcx-ljsm';
import { ApiController } from '@server/decorators';
import { ItemReqDTO, ItemResDTO } from '@common/modules/items/item.dto';
import ItemsUtils from '@server/utils/getItems';
import { Inject } from 'bwcx-core';
import LoginGuard from '@server/guards/login.guard';

@ApiController()
@UseGuards(LoginGuard)
export default class ItemsController {
  public constructor(
    @Inject()
    private readonly itemsUtils: ItemsUtils,
  ) {}

  @Post('/items')
  @Contract(ItemReqDTO, ItemResDTO)
  public async getAllItems() {
    const items = this.itemsUtils.allItems;
    return {
      rows: items,
    };
  }
}
