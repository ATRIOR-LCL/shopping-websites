import { Service, InjectCtx, RequestContext } from 'bwcx-ljsm';
import fs from 'fs';
import path from 'path';
import { ItemDTO } from '@common/modules/items/item.dto';
import { GetOrdersResDTO } from '@common/modules/orders/oders.dto';
import LogicException from '@server/exceptions/logic.exception';
import { ErrCode } from '@common/enums/err-code.enum';

@Service()
export default class OrdersService {
  public constructor(
    @InjectCtx()
    private readonly ctx: RequestContext,
  ) {}

  /** methods */
  public async getOrders(): Promise<GetOrdersResDTO> {
    try {
      const username = this.username;
      if (!username) {
        throw new Error('User not logged in');
      }

      const ordersData = this.ordersData;

      // 查找当前用户的订单
      const userOrders = ordersData.find((orderGroup: any) => orderGroup.owner === username);

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

  public async addOrder(item: ItemDTO) {
    try {
      const username = this.username;
      if (!username) {
        throw new Error('User not logged in');
      }

      const ordersData = this.ordersData;

      // 获取或创建用户订单组
      const userOrders = await this.getUserOrdersGroup(username, ordersData);

      // 创建新订单
      const newOrder = {
        orderId: `order-${Date.now()}`,
        item,
        orderTime: new Date().toISOString(),
      };

      userOrders.rows.push(newOrder);
      await fs.promises.writeFile(this.ordersFilePath, JSON.stringify(ordersData, null, 2), 'utf-8');

      return { message: 'Order added successfully' };
    } catch (error) {
      console.error('Failed to add order:', error);
      throw new LogicException(ErrCode.SystemError);
    }
  }

  public async addAllOrders(items: ItemDTO[]) {
    try {
      const username = this.username;
      if (!username) {
        throw new Error('User not logged in');
      }

      const ordersData = this.ordersData;

      // 获取或创建用户订单组
      const userOrders = await this.getUserOrdersGroup(username, ordersData);

      // 创建新订单数组
      const newOrders = items.map((item, index) => ({
        orderId: `order-${Date.now()}-${index}`,
        item,
        orderTime: new Date().toISOString(),
      }));

      userOrders.rows.push(...newOrders);
      await fs.promises.writeFile(this.ordersFilePath, JSON.stringify(ordersData, null, 2), 'utf-8');

      return { message: 'Orders added successfully' };
    } catch (error) {
      console.error('Failed to add orders:', error);
      throw new LogicException(ErrCode.SystemError);
    }
  }

  public async clearOrders() {
    try {
      const username = this.username;
      if (!username) {
        throw new Error('User not logged in');
      }

      const ordersData = this.ordersData;

      // 查找当前用户的订单组
      const userOrders = ordersData.find((orderGroup: any) => orderGroup.owner === username);

      if (userOrders) {
        userOrders.rows = []; // 清空订单
        await fs.promises.writeFile(this.ordersFilePath, JSON.stringify(ordersData, null, 2), 'utf-8');
      }

      return { message: 'Orders cleared successfully' };
    } catch (error) {
      console.error('Failed to clear orders:', error);
      throw new LogicException(ErrCode.SystemError);
    }
  }

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

  get ordersFilePath() {
    return path.resolve(__dirname, '../../store/orders.store.json');
  }

  get ordersData() {
    return JSON.parse(fs.readFileSync(this.ordersFilePath, 'utf-8'));
  }

  get username() {
    return this.ctx.session?.user?.username;
  }
}
