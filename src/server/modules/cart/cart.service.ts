import { Service, InjectCtx, RequestContext } from 'bwcx-ljsm';
import { ItemDTO } from '@common/modules/items/item.dto';
import { CartDTO } from '@common/modules/cart/cart.dto';
import Database from '@server/lib/database';

@Service()
export default class CartService {
  public constructor(
    @InjectCtx()
    private readonly ctx: RequestContext,
  ) {}

  /** methods */
  public async getCart() {
    const username = this.username;
    if (!username) {
      return { count: 0, rows: [] };
    }

    try {
      // 从数据库获取用户购物车数据
      const cartItems = await Database.query(
        'SELECT * FROM carts WHERE user_id = (SELECT user_id FROM users WHERE username = ?) ORDER BY add_time DESC',
        [username]
      );

      const rows: CartDTO[] = cartItems.map((item: any) => ({
        itemId: item.item_id,
        itemName: item.item_name,
        itemEmoji: item.item_emoji,
        price: parseFloat(item.price),
        description: item.item_desc,
        itemIndex: item.item_index,
        addTime: item.add_time?.toISOString() || new Date().toISOString(),
      }));

      return {
        count: rows.length,
        rows,
      };
    } catch (error) {
      console.error('Failed to get cart:', error);
      return { count: 0, rows: [] };
    }
  }

  public async addToCart(items: ItemDTO[]) {
    const username = this.username;
    if (!username) {
      throw new Error('User not logged in');
    }

    // 确保 items 是一个数组
    let parsedItems: ItemDTO[];
    if (typeof items === 'string') {
      parsedItems = JSON.parse(items);
    } else if (Array.isArray(items)) {
      parsedItems = items;
    } else {
      parsedItems = [items];
    }

    try {
      const addedItems: CartDTO[] = [];

      for (const [index, item] of parsedItems.entries()) {
        const itemIndex = Date.now() + Math.floor(Math.random() * 1000) + index;

        await Database.query(
          `INSERT INTO carts (user_id, item_id, item_index, item_name, item_emoji, item_desc, price, image, add_time)
           SELECT user_id, ?, ?, ?, ?, ?, ?, ?, NOW()
           FROM users WHERE username = ?`,
          [
            item.itemId,
            itemIndex,
            item.itemName,
            item.itemEmoji,
            item.description,
            item.price,
            '',
            username
          ]
        );
        const cartItem: CartDTO = {
          ...item,
          itemIndex,
          addTime: new Date().toISOString(),
        };
        addedItems.push(cartItem);
      }

      const currentCart = await this.getCart();

      return {
        message: `Successfully added ${addedItems.length} items to cart`,
        cart: currentCart,
      };
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw new Error('Failed to add items to cart');
    }
  }

  public async clearCart() {
    const username = this.username;
    if (!username) {
      throw new Error('User not logged in');
    }

    try {
      // 删除用户的所有购物车项目
      await Database.query(
        'DELETE FROM carts WHERE user_id = (SELECT user_id FROM users WHERE username = ?)',
        [username]
      );

      const currentCart = await this.getCart();
      return {
        message: 'Cart cleared successfully',
        cart: currentCart,
      };
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw new Error('Failed to clear cart');
    }
  }

  public async deleteItem(itemIndex: number) {
    const username = this.username;
    if (!username) {
      throw new Error('User not logged in');
    }
    if (!itemIndex) {
      throw new Error('Invalid itemIndex');
    }

    try {
      // 删除指定的购物车项目
      const result = await Database.query(
        'DELETE FROM carts WHERE item_index = ? AND user_id = (SELECT user_id FROM users WHERE username = ?)',
        [itemIndex, username]
      );

      console.log(`Deleted item ${itemIndex} for user ${username}`);

      const currentCart = await this.getCart();
      return {
        message: 'Item deleted successfully',
        cart: currentCart,
      };
    } catch (error) {
      console.error('Failed to delete item:', error);
      throw new Error('Failed to delete item');
    }
  }

  get username() {
    return this.ctx.session?.user?.username;
  }
}
