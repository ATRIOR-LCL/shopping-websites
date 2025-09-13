import { ItemDTO } from "../items/item.dto";
import { FromBody } from "bwcx-common";

export class OrdersDTO {
  orderId: string;
  item: ItemDTO;
  orderTime: string;
}

export class GetOrdersReqDTO {

}

export class GetOrdersResDTO {
  count: number;
  rows: {
    orderDate: string;
    orders: OrdersDTO[];
  }[];
}

export class AddOrderReqDTO {
  @FromBody()
  item: ItemDTO;
}

export class AddOrderResDTO {
  message: string;
}

export class AddAllOrderReqDTO {
  @FromBody()
  items: ItemDTO[];
}

export class AddAllOrderResDTO {
  message: string;
}
