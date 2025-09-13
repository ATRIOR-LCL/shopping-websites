import { InjectCtx, RequestContext, Post, Contract, Body, Get } from 'bwcx-ljsm';
import { Inject } from 'bwcx-core';
import { ApiController } from '@server/decorators';
import { Api } from 'bwcx-api';
import {
  GetCartResDTO,
  AddToCartReqDTO,
  AddToCartResDTO,
  ClearCartResDTO,
  DeleteItemReqDTO,
  DeleteItemResDTO,
} from '@common/modules/cart/cart.dto';
import CartService from './cart.service';

@ApiController()
export default class CartController {
  public constructor(
    @InjectCtx()
    private readonly ctx: RequestContext,
    @Inject()
    private readonly cartService: CartService
  ) {}

  /** routes */
  @Api.Summary('Get cart items')
  @Get('/cart')
  @Contract(null, GetCartResDTO)
  public async getCart() {
    return this.cartService.getCart();
  }

  @Api.Summary('Add items to cart')
  @Post('/cart/add')
  @Contract(AddToCartReqDTO, AddToCartResDTO)
  public async addToCart(@Body() body: AddToCartReqDTO) {
   return this.cartService.addToCart(body.items);
  }

  @Api.Summary('Clear cart')
  @Post('/cart/clear')
  @Contract(null, ClearCartResDTO)
  public async clearCart() {
    return this.cartService.clearCart();
  }

  @Api.Summary('Delete Single Item from cart')
  @Post('/cart/deleteItem')
  @Contract(DeleteItemReqDTO, DeleteItemResDTO)
  public async deleteItem(@Body() req: DeleteItemReqDTO) {
    const { itemIndex } = req;
    return this.cartService.deleteItem(itemIndex);
  }
}
