import { Controller, InjectCtx, RequestContext, Post, Contract, Body, Get } from 'bwcx-ljsm';
import { Inject } from 'bwcx-core';
import { ApiController } from '@server/decorators';
import { Api } from 'bwcx-api';
import {
  GetCartReqDTO,
  GetCartResDTO,
  AddToCartReqDTO,
  AddToCartResDTO,
  ClearCartReqDTO,
  ClearCartResDTO,
  DeleteItemReqDTO,
  DeleteItemResDTO,
  CartDTO,
} from '@common/modules/cart/cart.dto';
import fs from 'fs';
import path from 'path';
import { ItemDTO } from '@common/modules/items/item.dto';

@ApiController()
export default class CartController {
  public constructor(
    @InjectCtx()
    private readonly ctx: RequestContext,
  ) {}

  /** routes */
  @Api.Summary('Get cart items')
  @Get('/cart')
  @Contract(null, GetCartResDTO)
  public async getCart() {
    const cartFilePath = path.resolve(__dirname, '../../store/cart.store.json');

    // 调试：打印路径
    console.log('Cart file path:', cartFilePath);
    console.log('File exists:', fs.existsSync(cartFilePath));

    const cartData = JSON.parse(fs.readFileSync(cartFilePath, 'utf-8'));
    const userCart = cartData.find((cart: any) => cart.owner === this.ctx.session?.user?.username);

    if (userCart) {
      return {
        count: userCart.rows.length,
        rows: userCart.rows,
      };
    } else {
      return {
        count: 0,
        rows: [],
      };
    }
  }

  @Api.Summary('Add items to cart')
  @Post('/cart/add')
  @Contract(AddToCartReqDTO, AddToCartResDTO)
  public async addToCart(@Body() body: any) {
    const cartFilePath = path.resolve(__dirname, '../../store/cart.store.json');

    // 从 session 获取用户名
    const username = this.ctx.session?.user?.username;
    if (!username) {
      throw new Error('User not logged in');
    }

    // 从请求体中提取 items
    const items = body.items;

    const cartData = JSON.parse(fs.readFileSync(cartFilePath, 'utf-8'));
    let userCart = cartData.find((cart: any) => cart.owner === username);

    if (!userCart) {
      userCart = { owner: username, rows: [] };
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
      };

      userCart.rows.push(cartItem);
      addedItems.push(cartItem);
    });

    fs.writeFileSync(cartFilePath, JSON.stringify(cartData, null, 2));

    // 返回完整的购物车状态
    const currentCart = this.getCurrentCartState(username);
    return {
      message: `Successfully added ${addedItems.length} items to cart`,
      cart: currentCart,
    };
  }

  /**
   * 获取当前用户购物车状态的辅助方法
   */
  private getCurrentCartState(username: string): { count: number; rows: CartDTO[] } {
    const cartFilePath = path.resolve(__dirname, '../../store/cart.store.json');
    const cartData = JSON.parse(fs.readFileSync(cartFilePath, 'utf-8'));
    const userCart = cartData.find((cart: any) => cart.owner === username);

    if (userCart) {
      return {
        count: userCart.rows.length,
        rows: userCart.rows,
      };
    } else {
      return {
        count: 0,
        rows: [],
      };
    }
  }

  @Api.Summary('Clear cart')
  @Post('/cart/clear')
  @Contract(null, ClearCartResDTO)
  public async clearCart() {
    const cartFilePath = path.resolve(__dirname, '../../store/cart.store.json');

    // 从 session 获取用户名
    const username = this.ctx.session?.user?.username;
    if (!username) {
      throw new Error('User not logged in');
    }

    let cartData = JSON.parse(fs.readFileSync(cartFilePath, 'utf-8'));
    cartData = cartData.filter((cart: any) => cart.owner !== username);
    fs.writeFileSync(cartFilePath, JSON.stringify(cartData, null, 2));

    // 返回清空后的购物车状态（应该是空的）
    const currentCart = this.getCurrentCartState(username);
    return {
      message: 'Cart cleared successfully',
      cart: currentCart,
    };
  }

  @Api.Summary('Delete Single Item from cart')
  @Post('/cart/deleteItem')
  @Contract(DeleteItemReqDTO, DeleteItemResDTO)
  public async deleteItem(@Body() req: DeleteItemReqDTO) {
    const cartFilePath = path.resolve(__dirname, '../../store/cart.store.json');

    // 调试：打印接收到的请求数据
    console.log('deleteItem received req:', req);
    console.log('deleteItem req type:', typeof req);
    console.log('deleteItem req keys:', Object.keys(req || {}));

    // 从 session 获取用户名
    const username = this.ctx.session?.user?.username;
    if (!username) {
      throw new Error('User not logged in');
    }

    const { itemIndex } = req;
    if (!itemIndex) {
      throw new Error('Invalid itemIndex');
    }
    console.log('extracted itemIndex:', itemIndex, 'type:', typeof itemIndex);

    const cartData = JSON.parse(fs.readFileSync(cartFilePath, 'utf-8'));
    const userCart = cartData.find((cart: any) => cart.owner === username);

    if (userCart) {
      // 根据唯一的 itemIndex 删除对应的商品
      const originalLength = userCart.rows.length;
      userCart.rows = userCart.rows.filter((item: CartDTO) => item.itemIndex !== itemIndex);
      const newLength = userCart.rows.length;
      userCart.count = newLength; // 更新计数
      fs.writeFileSync(cartFilePath, JSON.stringify(cartData, null, 2));

      console.log(`Deleted item ${itemIndex} for user ${username}. Items count: ${originalLength} -> ${newLength}`);
    }

    // 返回删除后的购物车状态
    const currentCart = this.getCurrentCartState(username);
    return {
      message: 'Item deleted successfully',
      cart: currentCart,
    };
  }
}
