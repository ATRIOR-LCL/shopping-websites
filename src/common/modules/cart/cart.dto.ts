import { ItemDTO } from '../items/item.dto';

export class CartDTO extends ItemDTO {
  constructor() {
    super();
  }
  itemIndex!: number;
}

export class GetCartReqDTO {
  username: string;
}

export class GetCartResDTO {
  count: number;
  rows: CartDTO[];
}

export class AddToCartReqDTO {
  username: string;
  item: ItemDTO;
}

export class AddToCartResDTO {
  data: string;
}

export class ClearCartReqDTO {
  username: string;
}

export class ClearCartResDTO {
  data: string;
}

export class DeleteItemReqDTO {
  username: string;
  itemId: number;
}

export class DeleteItemResDTO {
  data: string;
}
