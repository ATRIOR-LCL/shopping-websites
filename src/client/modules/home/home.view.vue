<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import { View, RenderMethod, RenderMethodKind } from 'bwcx-client-vue3';
import MyFooter from '@client/components/my-footer.vue';
import MyItem from '@client/components/item.vue';
import Cart from '@client/components/cart.vue';
import { AsyncDataOptions } from '@client/typings';
import { ItemDTO, ItemResDTO } from '@common/modules/items/item.dto';
import { Prop } from 'vue-property-decorator';
import CartContainer from '@client/components/cart-container.vue';

@View('/')
@Options({
  components: {
    MyFooter,
    MyItem,
    Cart,
    CartContainer,
  },
})
@RenderMethod(RenderMethodKind.SSR)
export default class HomeView extends Vue {
  @Prop({
    type: Object,
    required: true,
  })
  homeState!: ItemResDTO;
  selectCount: number = 0;
  selectItems: Array<ItemDTO> = [];
  showCart: boolean = false;

  get totalCount() {
    return this.homeState.count;
  }

  get itemsList() {
    return this.homeState.rows;
  }

  handleAddToCart(data: { quantity: number; items: Array<ItemDTO> }) {
    // 将商品数量添加到购物车总数
    this.selectCount += data.quantity;

    // 将商品信息添加到购物车列表
    this.selectItems.push(...data.items);

    console.log(`Added ${data.quantity} items to cart. Total count:`, this.selectCount);
    console.log('Current cart items:', this.selectItems);
  }

  handleShowCart() {
    this.showCart = true;
  }

  handleCloseCart() {
    this.showCart = false;
  }

  handleRemoveItem(index: number) {
    if (index >= 0 && index < this.selectItems.length) {
      // 从购物车中移除商品
      this.selectItems.splice(index, 1);
      // 更新商品数量
      this.selectCount = this.selectItems.length;
      console.log(`Removed item at index ${index}. Total count:`, this.selectCount);
      console.log('Current cart items:', this.selectItems);
    } else {
      console.warn(`Invalid index ${index} for removing item.`);
    }
  }

  async mounted() {
    console.log('HomeView mounted', this.totalCount);
    console.log('HomeView mounted', this.itemsList);
  }

  async asyncData({ apiClient }: AsyncDataOptions) {
    const res = await apiClient.getAllItems({
      _t: true,
    });
    console.log('Fetched items:', res);
    return {
      homeState: res,
    };
  }
}
</script>

<template>
  <div class="home-view">
    <cart :item-count="this.selectCount" @click="handleShowCart" />
    <transition name="slide-fade">
      <cart-container :visible="showCart" :items="selectItems" @remove-item="handleRemoveItem" @close-cart="handleCloseCart" />
    </transition>
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
  transition: transform 0.3s ease-out, opacity 0.5s ease-out;
}

.slide-fade-leave-active {
  transition: transform 0.3s ease-in, opacity 0.5s ease-in;
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
