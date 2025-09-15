import { Service, InjectCtx, RequestContext } from 'bwcx-ljsm';
import fs from 'fs';
import path from 'path';
import { ItemDTO } from '@common/modules/items/item.dto';
import { CartDTO } from '@common/modules/cart/cart.dto';

@Service()
export default class CartService {
  public constructor(
    @InjectCtx()
    private readonly ctx: RequestContext,
  ) {}

  /** methods */
  public async getCart() {
    if (this.userCart) {
      return {
        count: this.userCart.rows.length,
        rows: this.userCart.rows,
      };
    } else {
      return {
        count: 0,
        rows: [],
      };
    }
  }

  public async addToCart(items: ItemDTO[]) {
    if (!this.username) {
      throw new Error('User not logged in');
    }

    // 读取购物车数据
    const cartData = this.cartData;

    // 查找或创建用户购物车
    let userCart = cartData.find((cart: any) => cart.owner === this.username);
    if (!userCart) {
      // 如果用户购物车不存在，创建新的
      userCart = { owner: this.username, rows: [] };
      cartData.push(userCart);
    }

    // 确保 items 是一个数组
    let parsedItems: ItemDTO[];
    if (typeof items === 'string') {
      parsedItems = JSON.parse(items);
    } else if (Array.isArray(items)) {
      parsedItems = items;
    } else {
      // 如果传入的是单个商品对象，转换为数组
      parsedItems = [items];
    }

    // 批量添加商品到购物车
    const addedItems: CartDTO[] = [];
    parsedItems.forEach((item, index) => {
      // 为每个商品生成唯一的 itemIndex
      const cartItem: CartDTO = {
        ...item,
        itemIndex: Date.now() + Math.floor(Math.random() * 1000) + index, // 确保每个商品都有唯一 ID
        addTime: new Date().toISOString(),
      };

      userCart.rows.push(cartItem);
      addedItems.push(cartItem);
    });

    fs.writeFileSync(this.cartFilePath, JSON.stringify(cartData, null, 2));

    const currentCart = this.getCurrentCartState(this.username);

    return {
      message: `Successfully added ${addedItems.length} items to cart`,
      cart: currentCart,
    };
  }

  public async clearCart() {
    if (!this.username) {
      throw new Error('User not logged in');
    }

    let cartData = JSON.parse(fs.readFileSync(this.cartFilePath, 'utf-8'));
    cartData = cartData.filter((cart: any) => cart.owner !== this.username);
    fs.writeFileSync(this.cartFilePath, JSON.stringify(cartData, null, 2));

    // 返回清空后的购物车状态（应该是空的）
    const currentCart = this.getCurrentCartState(this.username);
    return {
      message: 'Cart cleared successfully',
      cart: currentCart,
    };
  }

  public async deleteItem(itemIndex: number) {
    if (!this.username) {
      throw new Error('User not logged in');
    }
    if (!itemIndex) {
      throw new Error('Invalid itemIndex');
    }
    console.log('extracted itemIndex:', itemIndex, 'type:', typeof itemIndex);

    const cartData = JSON.parse(fs.readFileSync(this.cartFilePath, 'utf-8'));
    const userCart = cartData.find((cart: any) => cart.owner === this.username);

    if (userCart) {
      // 根据唯一的 itemIndex 删除对应的商品
      const originalLength = userCart.rows.length;
      userCart.rows = userCart.rows.filter((item: CartDTO) => item.itemIndex !== itemIndex);
      const newLength = userCart.rows.length;
      userCart.count = newLength; // 更新计数
      fs.writeFileSync(this.cartFilePath, JSON.stringify(cartData, null, 2));

      console.log(
        `Deleted item ${itemIndex} for user ${this.username}. Items count: ${originalLength} -> ${newLength}`,
      );
    }

    const currentCart = this.getCurrentCartState(this.username);
    return {
      message: 'Item deleted successfully',
      cart: currentCart,
    };
  }

  get cartFilePath() {
    return path.resolve(__dirname, '../../store/cart.store.json');
  }

  get cartData() {
    return JSON.parse(fs.readFileSync(this.cartFilePath, 'utf-8'));
  }

  get userCart() {
    return this.cartData.find((cart: any) => cart.owner === this.ctx.session?.user?.username);
  }

  get username() {
    return this.ctx.session?.user?.username;
  }

  private getCurrentCartState(username: string): { count: number; rows: CartDTO[] } {
    if (this.userCart) {
      return {
        count: this.userCart.rows.length,
        rows: this.userCart.rows,
      };
    } else {
      return {
        count: 0,
        rows: [],
      };
    }
  }
}
