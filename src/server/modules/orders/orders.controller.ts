import { Contract, Controller, Get, InjectCtx, Post, RequestContext, UseGuards } from 'bwcx-ljsm';
import { Inject } from 'bwcx-core';
import { ApiController } from '@server/decorators';
import { Api } from 'bwcx-api';
import {
  GetOrdersReqDTO,
  GetOrdersResDTO,
  AddOrderReqDTO,
  AddOrderResDTO,
  AddAllOrderReqDTO,
  AddAllOrderResDTO,
} from '@common/modules/orders/oders.dto';
import { Body } from 'bwcx-ljsm';
import LoginGuard from '@server/guards/login.guard';
import OrdersService from './orders.service';

@ApiController()
@UseGuards(LoginGuard)
export default class OrdersController {
  public constructor(
    @InjectCtx()
    private readonly ctx: RequestContext,
    @Inject()
    private readonly ordersService: OrdersService
  ) {}

  /** routes */
  @Api.Summary('获取当前用户的订单')
  @Get('/orders')
  @Contract(GetOrdersReqDTO, GetOrdersResDTO)
  public async getOrders() {
    return this.ordersService.getOrders();
  }

  @Api.Summary('添加订单')
  @Post('/orders/add')
  @Contract(AddOrderReqDTO, AddOrderResDTO)
  public async addOrder(@Body() body: AddOrderReqDTO) {
    return this.ordersService.addOrder(body.item);
  }

  @Api.Summary('批量添加订单')
  @Post('/orders/addAll')
  @Contract(AddAllOrderReqDTO, AddAllOrderResDTO)
  public async addAllOrder(@Body() body: AddAllOrderReqDTO) {
    return this.ordersService.addAllOrders(body.items);
  }

  @Api.Summary('清空订单')
  @Post('/orders/clear')
  @Contract(null, AddOrderResDTO)
  public async clearOrders() {
    return this.ordersService.clearOrders();
  }
}
