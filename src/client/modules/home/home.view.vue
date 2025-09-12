<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import { View, RenderMethod, RenderMethodKind } from 'bwcx-client-vue3';
import MyFooter from '@client/components/my-footer.vue';
import MyItem from '@client/components/item.vue';
import Cart from '@client/components/cart.vue';
import { AsyncDataOptions } from '@client/typings';
import { ItemDTO, ItemResDTO } from '@common/modules/items/item.dto';
import { Prop } from 'vue-property-decorator';
import { CartDTO } from '@common/modules/cart/cart.dto';
import { ApiClient } from '@common/api/api-client';
import { reactive } from 'vue';
import { ElNotification } from 'element-plus';

@View('/')
@Options({
  components: {
    MyFooter,
    MyItem,
    Cart,
  },
  inject: ['apiClient'],
})
@RenderMethod(RenderMethodKind.SSR)
export default class HomeView extends Vue {
  declare apiClient: ApiClient;
  @Prop({
    type: Object,
    required: true,
  })
  homeState!: ItemResDTO;

  cartState = reactive({
    count: 0,
    items: [] as CartDTO[],
  });

  get totalCount() {
    return this.homeState.count;
  }

  get itemsList() {
    return this.homeState.rows;
  }

  get selectCount() {
    return this.cartState.count;
  }

  get selectItems() {
    return this.cartState.items;
  }
  async mounted() {
    try {
      const cartItems = await this.apiClient.getCart();
      this.cartState.count = cartItems.count;
      this.cartState.items = cartItems.rows;
    } catch (error) {
      console.error('Failed to load initial cart state:', error);
    }
  }

  async handleAddToCart(payload: { quantity: number; items: ItemDTO[] }) {
    try {
      const requestData = {
        items: payload.items,
      };
      const res = await this.apiClient.addToCart(requestData);
      this.cartState.items = res.cart.rows;
      this.cartState.count = res.cart.count;
      ElNotification.success({
        title: 'Added to Cart',
        message: `Successfully added ${payload.quantity} items to your cart.`,
        duration: 1000,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      ElNotification.error({
        title: 'Error',
        message: 'Failed to add items to cart. Please try again.',
        duration: 1000,
      });
    }
  }

  async asyncData({ apiClient }: AsyncDataOptions) {
    const items = await apiClient.getAllItems({
      _t: true,
    });

    return {
      homeState: items,
    };
  }
}
</script>

<template>
  <div class="home-view">
    <cart :item-count="selectCount" />
    <div class="items-container">
      <my-item
        v-for="item in itemsList"
        :key="item.itemId"
        @add-to-cart="handleAddToCart"
        :item-id="item.itemId"
        :item-emoji="item.itemEmoji"
        :item-name="item.itemName"
        :description="item.description"
        :price="item.price"
      />
    </div>
    <my-footer />
  </div>
</template>

<style scoped lang="less">
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.home-view {
  width: 100%;
  height: auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  gap: 20px;
  transition: transform 0.5s ease, opacity 0.5s ease;

  & .items-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    width: 80%;
    margin-bottom: 60px;
    margin-top: 100px;
  }
}
</style>
