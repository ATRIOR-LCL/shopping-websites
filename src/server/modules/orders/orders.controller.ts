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
import fs from 'fs';
import path from 'path';
import { Body } from 'bwcx-ljsm';
import LoginGuard from '@server/guards/login.guard';
import LogicException from '@server/exceptions/logic.exception';
import { ErrCode } from '@common/enums/err-code.enum';

@ApiController()
@UseGuards(LoginGuard)
export default class OrdersController {
  public constructor(
    @InjectCtx()
    private readonly ctx: RequestContext,
  ) {}

  /**
   * 获取或创建用户订单组
   */
  private async getUserOrdersGroup(username: string, allOrders: any[]): Promise<any> {
    let userOrders = allOrders.find((orderGroup: any) => orderGroup.owner === username);

    if (!userOrders) {
      // 从用户数据文件中获取真实的 userId
      const userStorePath = path.resolve(__dirname, '../../store/user.store.json');
      const userData = JSON.parse(await fs.promises.readFile(userStorePath, 'utf-8'));
      const user = userData.users.find((u: any) => u.username === username);

      userOrders = {
        owner: username,
        userId: user?.userId || `user_${Date.now()}`, // 使用真实的 userId，如果没有则生成临时的
        rows: []
      };
      allOrders.push(userOrders);
    }

    return userOrders;
  }

  /** routes */
  @Api.Summary('获取当前用户的订单')
  @Get('/orders')
  @Contract(null, GetOrdersResDTO)
  public async getOrders() {
    try {
      const username = this.ctx.session.user.username;
      const ordersFilePath = path.resolve(__dirname, '../../store/orders.store.json');
      const ordersData = await fs.promises.readFile(ordersFilePath, 'utf-8');
      const allOrders = JSON.parse(ordersData);

      // 查找当前用户的订单
      const userOrders = allOrders.find((orderGroup: any) => orderGroup.owner === username);

      if (!userOrders) {
        return { count: 0, rows: [] };
      }

      // 按 orderDate 分组订单
      const groupedOrders = new Map<string, any[]>();

      userOrders.rows.forEach((order: any) => {
        // 从 orderTime 提取日期部分 (YYYY-MM-DD)
        const orderDate = order.orderTime ? order.orderTime.split('T')[0] : '未填写日期';

        if (!groupedOrders.has(orderDate)) {
          groupedOrders.set(orderDate, []);
        }
        groupedOrders.get(orderDate)!.push(order);
      });

      // 转换为响应格式
      const rows = Array.from(groupedOrders.entries()).map(([orderDate, orders]) => ({
        orderDate,
        orders
      }));

      // 按日期排序，未填写日期的放在最后
      rows.sort((a, b) => {
        if (a.orderDate === '未填写日期') return 1;
        if (b.orderDate === '未填写日期') return -1;
        return b.orderDate.localeCompare(a.orderDate); // 最新日期在前
      });

      return { count: userOrders.rows.length, rows };
    } catch (error) {
      console.error('Failed to read orders data:', error);
      throw new LogicException(ErrCode.SystemError);
    }
  }

  @Api.Summary('添加订单')
  @Post('/orders/add')
  @Contract(AddOrderReqDTO, AddOrderResDTO)
  public async addOrder(@Body() body: AddOrderReqDTO) {
    try {
      const username = this.ctx.session.user.username;
      const ordersFilePath = path.resolve(__dirname, '../../store/orders.store.json');
      const ordersData = await fs.promises.readFile(ordersFilePath, 'utf-8');
      const allOrders = JSON.parse(ordersData);

      // 获取或创建用户订单组
      const userOrders = await this.getUserOrdersGroup(username, allOrders);

      // 创建新订单
      const newOrder = {
        orderId: `order-${Date.now()}`,
        item: body.item,
        orderTime: new Date().toISOString(),
      };

      userOrders.rows.push(newOrder);
      await fs.promises.writeFile(ordersFilePath, JSON.stringify(allOrders, null, 2), 'utf-8');

      return { message: 'Order added successfully' };
    } catch (error) {
      console.error('Failed to add order:', error);
      throw new LogicException(ErrCode.SystemError);
    }
  }

  @Api.Summary('批量添加订单')
  @Post('/orders/addAll')
  @Contract(AddAllOrderReqDTO, AddAllOrderResDTO)
  public async addAllOrder(@Body() body: AddAllOrderReqDTO) {
    try {
      const username = this.ctx.session.user.username;
      const ordersFilePath = path.resolve(__dirname, '../../store/orders.store.json');
      const ordersData = await fs.promises.readFile(ordersFilePath, 'utf-8');
      const allOrders = JSON.parse(ordersData);

      // 获取或创建用户订单组
      const userOrders = await this.getUserOrdersGroup(username, allOrders);

      // 创建新订单数组
      const newOrders = body.items.map((item, index) => ({
        orderId: `order-${Date.now()}-${index}`,
        item,
        orderTime: new Date().toISOString(),
      }));

      userOrders.rows.push(...newOrders);
      await fs.promises.writeFile(ordersFilePath, JSON.stringify(allOrders, null, 2), 'utf-8');

      return { message: 'Orders added successfully' };
    } catch (error) {
      console.error('Failed to add orders:', error);
      throw new LogicException(ErrCode.SystemError);
    }
  }
  @Post('/orders/clear')
  @Contract(null, AddOrderResDTO)
  public async clearOrders() {
    try {
      const username = this.ctx.session.user.username;
      const ordersFilePath = path.resolve(__dirname, '../../store/orders.store.json');
      const ordersData = await fs.promises.readFile(ordersFilePath, 'utf-8');
      const allOrders = JSON.parse(ordersData);

      // 查找当前用户的订单组
      const userOrders = allOrders.find((orderGroup: any) => orderGroup.owner === username);

      if (userOrders) {
        userOrders.rows = []; // 清空订单
        await fs.promises.writeFile(ordersFilePath, JSON.stringify(allOrders, null, 2), 'utf-8');
      }

      return { message: 'Orders cleared successfully' };
    } catch (error) {
      console.error('Failed to clear orders:', error);
      throw new LogicException(ErrCode.SystemError);
    }
  }
}
