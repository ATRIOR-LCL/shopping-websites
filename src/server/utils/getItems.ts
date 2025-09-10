import { Provide } from "bwcx-core";
import { ItemDTO } from "@common/modules/items/item.dto";

@Provide()
export default class ItemsUtils {
  items: ItemDTO[] = [
    {
      itemName: "Item 1",
      price: 10.99,
      description: "Description for Item 1"
    },
    {
      itemName: "Item 2",
      price: 12.99,
      description: "Description for Item 2"
    },
    {
      itemName: "Item 3",
      price: 8.99,
      description: "Description for Item 3"
    }
  ];

  get allItems(): ItemDTO[] {
    return this.items;
  }
}
