import { Provide } from "bwcx-core";
import { ItemDTO } from "@common/modules/items/item.dto";

@Provide()
export default class ItemsUtils {
  items: ItemDTO[] = [
    {
      itemId: 1,
      itemEmoji: "🍞",
      itemName: "小面包",
      price: 10.99,
      description: "吃点面包吗"
    },
    {
      itemId: 2,
      itemEmoji: "🧀",
      itemName: "小奶酪",
      price: 12.99,
      description: "来点奶酪"
    },
    {
      itemId: 3,
      itemEmoji: "🥩",
      itemName: "大牛排",
      price: 8.99,
      description: "量大管饱"
    },
    {
      itemId: 4,
      itemEmoji: "🍔",
      itemName: "汉堡包",
      price: 15.99,
      description: "快餐之王"
    },
    {
      itemId: 5,
      itemEmoji: "🍟",
      itemName: "薯条",
      price: 6.99,
      description: "去码头整点薯条",
    },
    {
      itemId: 6,
      itemEmoji: "🌭",
      itemName: "热狗",
      price: 7.99,
      description: "hot dog ~",
    },
    {
      itemId: 7,
      itemEmoji: "🍕",
      itemName: "披萨",
      price: 20.99,
      description: "意大利风味",
    },
    {
      itemId: 8,
      itemEmoji: "🍣",
      itemName: "寿司",
      price: 18.99,
      description: "别吃，生的",
    },
    {
      itemId: 9,
      itemEmoji: "🍜",
      itemName: "一乐拉面",
      price: 12.99,
      description: "成为火影的必经之路",
    },
    {
      itemId: 10,
      itemEmoji: "🍰",
      itemName: "蛋糕",
      price: 22.99,
      description: "麦贝拉没了我吃什么",
    },
    {
      itemId: 11,
      itemEmoji: "🍩",
      itemName: "甜甜圈",
      price: 9.99,
      description: "呼啦圈",
    },
    {
      itemId: 12,
      itemEmoji: "🍫",
      itemName: "巧克力",
      price: 14.99,
      description: "纵享丝滑",
    },
    {
      itemId: 13,
      itemEmoji: "🍿",
      itemName: "爆米花",
      price: 11.99,
      description: "看电影必备",
    },
    {
      itemId: 14,
      itemEmoji: "🍺",
      itemName: "啤酒",
      price: 19.99,
      description: "可不要贪杯哦",
    },
    {
      itemId: 15,
      itemEmoji: "🍷",
      itemName: "红酒",
      price: 29.99,
      description: "开瓶有益健康",
    },
    {
      itemId: 16,
      itemEmoji: "🐧",
      itemName: "高松灯",
      price: 25.99,
      description: "咕咕嘎嘎",
    },
    {
      itemId: 17,
      itemEmoji: "🐟",
      itemName: "鱼",
      price: 13.99,
      description: "fish",
    },
    {
      itemId: 18,
      itemEmoji: "🥥",
      itemName: "椰子",
      price: 15.99,
      description: "可以制作生椰拿铁",
    }
  ];

  get totalItemsLength(): number {
    return this.items.length;
  }

  get allItems(): ItemDTO[] {
    return this.items;
  }
}
