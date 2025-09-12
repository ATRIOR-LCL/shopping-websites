import { ItemDTO } from '../items/item.dto';
import { IsNumber } from 'class-validator';
import { FromBody } from 'bwcx-common';


export class CartDTO extends ItemDTO {
  constructor() {
    super();
  }
  itemIndex!: number;
}

export class GetCartReqDTO {
  // username 从服务端 session 获取，不需要客户端传递
}

export class GetCartResDTO {
  count: number;
  rows: CartDTO[];
}

export class AddToCartReqDTO {
  @FromBody()
  items: ItemDTO[];
}

export class AddToCartResDTO {
  message: string;
  cart: {
    count: number;
    rows: CartDTO[];
  };
}

export class ClearCartReqDTO {
}

export class ClearCartResDTO {
  message: string;
  cart: {
    count: number;
    rows: CartDTO[];
  };
}

export class DeleteItemReqDTO {
  @IsNumber()
  @FromBody()
  itemIndex: number;
}

export class DeleteItemResDTO {
  message: string;
  cart: {
    count: number;
    rows: CartDTO[];
  };
}
