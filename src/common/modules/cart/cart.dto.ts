import { ItemDTO } from "../items/item.dto";

export class CartReqDTO {
  _t?: boolean;
}

export class CartResDTO {
  count: number;
  rows: ItemDTO[];
}
