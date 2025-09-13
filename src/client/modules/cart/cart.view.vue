<script lang="ts">
import { ItemDTO } from '@common/modules/items/item.dto';
import { Vue, Options } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { ElCard, ElButton, ElIcon, ElNotification } from 'element-plus';
import { Close } from '@element-plus/icons-vue';
import { AsyncDataOptions } from '@client/typings';
import { RenderMethod, RenderMethodKind } from 'bwcx-client-vue';
import { View } from 'bwcx-client-vue3';
import { CartDTO } from '@common/modules/cart/cart.dto';
import MyFooter from '@client/components/my-footer.vue';
import { ApiClientType } from '@client/api';
import { ClientOnly } from 'vite-ssr';

@View('/cart')
@Options({
  components: { ElCard, ElButton, ElIcon, Close, MyFooter, ClientOnly },
  inject: ['apiClient'],
})
@RenderMethod(RenderMethodKind.SSR)
export default class CartContainer extends Vue {
  declare apiClient: ApiClientType;
  @Prop() items!: Array<CartDTO>;
  cartItems: Array<CartDTO> = [];
  mounted() {
    this.cartItems = this.items;
    console.log('CartContainer mounted', this.items);
  }
  get getItemsLength() {
    return this.cartItems.length;
  }

  async handleRemoveItem(itemIndex: number) {
    try {
      console.log('Removing item with index:', itemIndex);
      const _ = await this.apiClient.deleteItem({
        itemIndex,
      });
      ElNotification.success({
        title: 'Item Removed',
        message: 'The item has been removed from your cart.',
        duration: 1000,
      });
      console.log('Now Items:', _);
      this.cartItems = _.cart.rows;
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      ElNotification.error({
        title: 'Error',
        message: 'Failed to remove item from cart.',
        duration: 1000,
      });
    }
  }

  async handleRemoveAll() {
    try {
      const res = await this.apiClient.clearCart();
      this.cartItems = res.cart.rows;
      ElNotification.success({
        title: 'All Items Removed',
        message: 'All items have been removed from your cart.',
        duration: 1000,
      });
    } catch (error) {
      console.error('Failed to remove all items from cart:', error);
      ElNotification.error({
        title: 'Error',
        message: 'Failed to remove all items from cart.',
        duration: 1000,
      });
    }
  }

  async handleBuyItem(item: CartDTO) {
    try {
      const res = await this.apiClient.addOrder({
        item: item,
      });
      const cartRes = await this.apiClient.deleteItem({
        itemIndex: item.itemIndex,
      });
      this.cartItems = cartRes.cart.rows;
      ElNotification.success({
        title: 'Order Placed',
        message: `Successfully placed an order for ${item.itemName}.`,
        duration: 1000,
      });
    } catch (error) {
      console.error('Failed to place order:', error);
      ElNotification.error({
        title: 'Error',
        message: 'Failed to place order.',
        duration: 1000,
      });
    }
  }

  async handleBuyAll() {
    try {
      await this.apiClient.addAllOrder({
        items: this.cartItems,
      });
      await this.apiClient.clearCart();
      this.cartItems = [];
      ElNotification.success({
        title: 'All Orders Placed',
        message: 'Successfully placed all orders.',
        duration: 1000,
      });
    } catch (e) {
      console.error('Failed to place all orders:', e);
      ElNotification.error({
        title: 'Error',
        message: 'Failed to place all orders.',
        duration: 1000,
      });
    }
  }

  get getItems() {
    return this.cartItems;
  }

  async asyncData({ apiClient }: AsyncDataOptions) {
    const res = await apiClient.getCart();
    return { items: res.rows };
  }
}
</script>

<template>
  <div class="cart-container">
    <h2 class="cart-title" style="text-align: center; color: #000; font-size: var(--font-large-size)">
      Shopping Cart 🛒
    </h2>
    <client-only>
      <el-card class="cart-content" style="overflow-y: auto !important">
        <div v-if="getItemsLength === 0" style="text-align: center; margin-top: 50px">Your cart is empty.</div>
        <div v-else style="padding: 20px; max-height: 80%; overflow-y: auto">
          <div
            v-for="(item, index) in getItems"
            :key="index"
            class="cart-item"
            style="
              margin-bottom: 15px;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              position: relative;
              overflow: hidden;
            "
          >
            <div style="flex: 1; margin-right: 15px; z-index: 10">
              <h3>{{ item.itemName }} {{ item.itemEmoji }}</h3>
              <p>{{ item.description }}</p>
              <p>Price: ${{ item.price }}</p>
              <p>{{ item.addTime }}</p>
            </div>
            <div
              style="
                font-size: 60px;
                opacity: 0.3;
                position: absolute;
                left: 0;
                bottom: 0;
                width: fit-content;
                height: fit-content;
                transform: translate(-25%, 25%);
              "
            >
              {{ item.itemEmoji }}
            </div>
            <el-button type="danger" size="small" @click="handleRemoveItem(item.itemIndex)" style="flex-shrink: 0">
              Remove
            </el-button>
            <el-button type="primary" size="small" @click="handleBuyItem(item)" style="flex-shrink: 0"> Buy </el-button>
          </div>
        </div>
      </el-card>
      <el-card class="cart-options">
        <el-button type="danger" @click="handleRemoveAll" :disabled="getItemsLength === 0">Remove All</el-button>
        <el-button type="primary" :disabled="getItemsLength === 0" @click="handleBuyAll">Buy All</el-button>
      </el-card>
    </client-only>
    <MyFooter />
  </div>
</template>

<style scoped lang="less">
.cart-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  align-items: center;

  & .cart-content {
    width: 30%;
    height: 60%;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  .cart-item {
    padding: 0 10px;
    background-color: rgba(255, 255, 255, 1);
    transition: background-color 0.3s ease;
    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}

.cart-options {
  width: 30%;
  height: 50px;
  display: flex;
  justify-content: center;
  background-color: transparent;
  box-shadow: none;
  border: none;
  align-items: center;
}
</style>
