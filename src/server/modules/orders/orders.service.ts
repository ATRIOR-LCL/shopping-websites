import { Service, InjectCtx, RequestContext } from 'bwcx-ljsm';
import { ItemDTO } from '@common/modules/items/item.dto';
import { GetOrdersResDTO } from '@common/modules/orders/oders.dto';
import LogicException from '@server/exceptions/logic.exception';
import { ErrCode } from '@common/enums/err-code.enum';
import Database from '@server/lib/database';

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

      // 从数据库获取用户订单数据
      const orderItems = await Database.query(
        'SELECT * FROM orders WHERE user_id = (SELECT user_id FROM users WHERE username = ?) ORDER BY order_time DESC',
        [username]
      );

      if (!orderItems.length) {
        return { count: 0, rows: [] };
      }

      // 按 orderDate 分组订单
      const groupedOrders = new Map<string, any[]>();

      orderItems.forEach((order: any) => {
        // 从 order_time 提取日期部分 (YYYY-MM-DD)
        const orderDate = order.order_time ? order.order_time.toISOString().split('T')[0] : '未填写日期';

        if (!groupedOrders.has(orderDate)) {
          groupedOrders.set(orderDate, []);
        }
        
        groupedOrders.get(orderDate)!.push({
          orderId: order.order_id,
          item: {
            itemId: order.item_id,
            itemName: order.item_name,
            itemEmoji: order.item_emoji,
            price: parseFloat(order.price),
            description: order.item_desc,
          },
          orderTime: order.order_time?.toISOString() || null,
        });
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

      return { count: orderItems.length, rows };
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

      const orderId = `order-${Date.now()}`;

      // 插入订单到数据库
      await Database.query(
        `INSERT INTO orders (order_id, user_id, item_id, item_name, item_emoji, item_desc, price, order_time) 
         SELECT ?, user_id, ?, ?, ?, ?, ?, NOW() 
         FROM users WHERE username = ?`,
        [
          orderId,
          item.itemId,
          item.itemName,
          item.itemEmoji,
          item.description,
          item.price,
          username
        ]
      );

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

      // 使用事务批量插入订单
      await Database.transaction(async (connection) => {
        for (const [index, item] of items.entries()) {
          const orderId = `order-${Date.now()}-${index}`;
          
          await connection.execute(
            `INSERT INTO orders (order_id, user_id, item_id, item_name, item_emoji, item_desc, price, order_time) 
             SELECT ?, user_id, ?, ?, ?, ?, ?, NOW() 
             FROM users WHERE username = ?`,
            [
              orderId,
              item.itemId,
              item.itemName,
              item.itemEmoji,
              item.description,
              item.price,
              username
            ]
          );
        }
      });

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

      // 删除用户的所有订单
      await Database.query(
        'DELETE FROM orders WHERE user_id = (SELECT user_id FROM users WHERE username = ?)',
        [username]
      );

      return { message: 'Orders cleared successfully' };
    } catch (error) {
      console.error('Failed to clear orders:', error);
      throw new LogicException(ErrCode.SystemError);
    }
  }

  get username() {
    return this.ctx.session?.user?.username;
  }
}