import { Controller, InjectCtx, RequestContext, Post, Contract, Body } from 'bwcx-ljsm';
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
  @Post('/cart')
  @Contract(GetCartReqDTO, GetCartResDTO)
  public async getCart(@Body('username') username: string) {
    const cartFilePath = path.resolve(__dirname, '../../store/cart.store.json');

    // 调试：打印路径
    console.log('Cart file path:', cartFilePath);
    console.log('File exists:', fs.existsSync(cartFilePath));

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

  @Api.Summary('Add item to cart')
  @Post('/cart/add')
  @Contract(AddToCartReqDTO, AddToCartResDTO)
  public async addToCart(@Body('username') username: string, @Body('item') item: ItemDTO) {
    const cartFilePath = path.resolve(__dirname, '../../store/cart.store.json');

    // 调试：检查接收到的数据
    console.log('Received username:', username);
    console.log('Received item:', JSON.stringify(item, null, 2));
    console.log('Item type:', typeof item);

    const cartData = JSON.parse(fs.readFileSync(cartFilePath, 'utf-8'));
    let userCart = cartData.find((cart: any) => cart.owner === username);

    if (!userCart) {
      userCart = { owner: username, rows: [] };
      cartData.push(userCart);
    }

    // 确保 item 是一个对象而不是字符串
    const parsedItem = typeof item === 'string' ? JSON.parse(item) : item;

    // 为商品生成唯一的 itemIndex（使用时间戳 + 随机数确保唯一性）
    const cartItem: CartDTO = {
      ...parsedItem,
      itemIndex: Date.now() + Math.floor(Math.random() * 1000), // 生成唯一 ID
    };

    console.log('Final cart item:', JSON.stringify(cartItem, null, 2));

    userCart.rows.push(cartItem);
    fs.writeFileSync(cartFilePath, JSON.stringify(cartData, null, 2));

    return {
      data: 'OK',
    };
  }

  @Api.Summary('Clear cart')
  @Post('/cart/clear')
  @Contract(ClearCartReqDTO, ClearCartResDTO)
  public async clearCart(@Body('username') username: string) {
    const cartFilePath = path.resolve(__dirname, '../../store/cart.store.json');
    let cartData = JSON.parse(fs.readFileSync(cartFilePath, 'utf-8'));
    cartData = cartData.filter((cart: any) => cart.owner !== username);
    fs.writeFileSync(cartFilePath, JSON.stringify(cartData, null, 2));

    return {
      data: 'OK',
    };
  }

  @Api.Summary('Delete Single Item from cart')
  @Post('/cart/deleteItem')
  @Contract(DeleteItemReqDTO, DeleteItemResDTO)
  public async deleteItem(@Body('username') username: string, @Body('itemIndex') itemIndex: number) {
    const cartFilePath = path.resolve(__dirname, '../../store/cart.store.json');
    const cartData = JSON.parse(fs.readFileSync(cartFilePath, 'utf-8'));
    const userCart = cartData.find((cart: any) => cart.owner === username);

    if (userCart) {
      // 根据唯一的 itemIndex 删除对应的商品
      userCart.rows = userCart.rows.filter((item: CartDTO) => item.itemIndex !== itemIndex);
      fs.writeFileSync(cartFilePath, JSON.stringify(cartData, null, 2));
    }

    return {
      data: 'OK',
    };
  }
}
